alter table public.tecnicos add column if not exists is_active boolean not null default true;

create table public.technical_network_imports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor_id uuid not null default auth.uid(),
  actor_email text not null default (auth.jwt()->>'email'),
  filename text not null check (length(filename) between 1 and 300),
  previous_rows jsonb not null check (jsonb_typeof(previous_rows) = 'array'),
  summary jsonb not null,
  restored_from uuid references public.technical_network_imports(id)
);
alter table public.technical_network_imports enable row level security;
revoke all on public.technical_network_imports from anon, authenticated;
grant select, insert on public.technical_network_imports to authenticated;
create policy "Administrators read import history" on public.technical_network_imports for select to authenticated
using ((select public.can_manage_organization()));
create policy "Administrators record imports" on public.technical_network_imports for insert to authenticated
with check ((select public.can_manage_organization()) and actor_id = auth.uid() and actor_email = (auth.jwt()->>'email'));
create index technical_network_imports_created_idx on public.technical_network_imports(created_at desc);
create index technical_network_imports_restored_idx on public.technical_network_imports(restored_from);

-- Invoker retains the existing administrator RLS on tecnicos; no service key is used.
create function public.import_technical_network(
  p_rows jsonb default '[]', p_filename text default 'KML',
  p_deactivate boolean default false, p_apply boolean default false,
  p_expected text default null, p_restore uuid default null
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  before_rows jsonb; candidate jsonb := '[]'; incoming jsonb; old_row jsonb; item jsonb;
  added jsonb := '[]'; changed jsonb := '[]'; missing jsonb := '[]'; unchanged integer := 0;
  revision text; result jsonb; found_id integer; history_id uuid;
begin
  if auth.uid() is null or not public.can_manage_organization() then
    raise exception 'Apenas administradores podem atualizar a rede técnica.' using errcode = '42501';
  end if;
  if p_apply is null or p_deactivate is null then raise exception 'Opções inválidas.'; end if;
  if p_filename is null or length(trim(p_filename)) not between 1 and 300 then raise exception 'Nome de arquivo inválido.'; end if;
  -- Serializes imports and ordinary edits. Preview token detects edits since review.
  if p_apply then lock table public.tecnicos in share row exclusive mode; end if;
  select coalesce(jsonb_agg(to_jsonb(t) order by t.id), '[]') into before_rows from public.tecnicos t;
  if p_restore is not null then
    select previous_rows into candidate from public.technical_network_imports where id = p_restore;
    if candidate is null then raise exception 'Versão não encontrada.'; end if;
    -- Rows added after the snapshot remain recoverable but inactive.
    for old_row in select value from jsonb_array_elements(before_rows) loop
      if not exists(select 1 from jsonb_array_elements(candidate) x where x->>'id' = old_row->>'id') then
        candidate := candidate || jsonb_build_array(old_row || '{"is_active":false}'::jsonb);
      end if;
    end loop;
  else
    if p_rows is null or jsonb_typeof(p_rows) <> 'array' then raise exception 'Lista de técnicos inválida.'; end if;
    if jsonb_array_length(p_rows) not between 1 and 5000 or octet_length(p_rows::text) > 10000000 then
      raise exception 'Envie entre 1 e 5.000 técnicos em um arquivo de até 5 MB.';
    end if;
    if exists(select 1 from jsonb_array_elements(p_rows) x group by lower(trim(x->>'nome')) having count(*) > 1)
      or exists(select 1 from public.tecnicos group by lower(trim(nome)) having count(*) > 1) then
      raise exception 'Há nomes duplicados no arquivo ou na rede. Resolva as duplicidades antes de importar.';
    end if;
    for incoming in select value from jsonb_array_elements(p_rows) loop
      if jsonb_typeof(incoming) <> 'object' or coalesce(length(trim(incoming->>'nome')),0) not between 1 and 300
        or jsonb_typeof(incoming->'lat') is distinct from 'number' or jsonb_typeof(incoming->'lng') is distinct from 'number'
        or (incoming->>'lat')::float8 not between -90 and 90 or (incoming->>'lng')::float8 not between -180 and 180
        or coalesce(length(incoming->>'descricao'),0) > 10000 then raise exception 'Técnico inválido no arquivo.'; end if;
      select value into old_row from jsonb_array_elements(before_rows) where lower(trim(value->>'nome')) = lower(trim(incoming->>'nome'));
      -- Explicit whitelist ignores client-supplied IDs, timestamps or active flags.
      item := jsonb_build_object('id',old_row->'id','nome',trim(incoming->>'nome'),
        'categoria',coalesce(incoming->>'categoria','OUTROS'),'tipo',coalesce(incoming->>'tipo',''),
        'descricao',coalesce(incoming->>'descricao',''),'telefone',coalesce(incoming->>'telefone',''),
        'email',coalesce(incoming->>'email',''),'lat',incoming->'lat','lng',incoming->'lng',
        'vendedor_parceiro',coalesce(incoming->>'vendedor_parceiro',''),'is_active',true);
      candidate := candidate || jsonb_build_array(item);
    end loop;
    for old_row in select value from jsonb_array_elements(before_rows) loop
      if not exists(select 1 from jsonb_array_elements(candidate) x where x->>'id' = old_row->>'id') then
        if (old_row->>'is_active')::boolean then missing := missing || jsonb_build_array(old_row->>'nome'); end if;
        candidate := candidate || jsonb_build_array(old_row || jsonb_build_object('is_active', (old_row->>'is_active')::boolean and not p_deactivate));
      end if;
    end loop;
  end if;
  for item in select value from jsonb_array_elements(candidate) loop
    select value into old_row from jsonb_array_elements(before_rows) where value->>'id' = item->>'id';
    if old_row is null then added := added || jsonb_build_array(item->>'nome');
    elsif (old_row - 'created_at') is distinct from (item - 'created_at') then
      changed := changed || jsonb_build_array(jsonb_build_object('name',item->>'nome','before',old_row,'after',item));
    else unchanged := unchanged + 1;
    end if;
  end loop;
  revision := md5(before_rows::text || candidate::text || coalesce(p_restore::text,'') || p_filename);
  result := jsonb_build_object('added',added,'changed',changed,'missing',missing,'unchanged',unchanged,'revision',revision,
    'total',jsonb_array_length(candidate),'active', (select count(*) from jsonb_array_elements(candidate) x where (x->>'is_active')::boolean));
  if not p_apply then return result; end if;
  if p_expected is null or p_expected <> revision then raise exception 'A rede mudou desde a prévia. Gere uma nova prévia antes de confirmar.' using errcode = '40001'; end if;
  if jsonb_array_length(added) + jsonb_array_length(changed) = 0 then raise exception 'Nenhuma alteração para aplicar.'; end if;
  insert into public.technical_network_imports(filename, previous_rows, summary, restored_from)
    values(p_filename, before_rows, result - 'changed' || jsonb_build_object('changed_count',jsonb_array_length(changed)), p_restore) returning id into history_id;
  for item in select value from jsonb_array_elements(candidate) loop
    found_id := (item->>'id')::integer;
    if found_id is null then
      insert into public.tecnicos(nome,categoria,tipo,descricao,telefone,email,lat,lng,vendedor_parceiro,is_active)
      values(item->>'nome',item->>'categoria',item->>'tipo',item->>'descricao',item->>'telefone',item->>'email',
        (item->>'lat')::float8,(item->>'lng')::float8,item->>'vendedor_parceiro',(item->>'is_active')::boolean);
    else
      insert into public.tecnicos(id,nome,categoria,tipo,descricao,telefone,email,lat,lng,vendedor_parceiro,is_active)
      values(found_id,item->>'nome',item->>'categoria',item->>'tipo',item->>'descricao',item->>'telefone',item->>'email',
        (item->>'lat')::float8,(item->>'lng')::float8,item->>'vendedor_parceiro',(item->>'is_active')::boolean)
      on conflict(id) do update set nome=excluded.nome,categoria=excluded.categoria,tipo=excluded.tipo,descricao=excluded.descricao,
        telefone=excluded.telefone,email=excluded.email,lat=excluded.lat,lng=excluded.lng,vendedor_parceiro=excluded.vendedor_parceiro,is_active=excluded.is_active;
    end if;
  end loop;
  return result || jsonb_build_object('id',history_id,'applied',true);
end;
$$;
revoke all on function public.import_technical_network(jsonb,text,boolean,boolean,text,uuid) from public,anon;
grant execute on function public.import_technical_network(jsonb,text,boolean,boolean,text,uuid) to authenticated;
