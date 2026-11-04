-- Import metadata and atomic, owner-scoped CSV import.
alter table public.opportunities
  add column source_system text,
  add column external_id text,
  add column source_name text,
  add column source_registration_date date,
  add column imported_at timestamptz;

alter table public.opportunities add constraint opportunities_source_pair check (
  (source_system is null and external_id is null) or
  (source_system is not null and external_id is not null and source_system = 'crm_csv_v1' and external_id ~ '^[0-9]{1,64}$')
);
create unique index opportunities_source_user_unique on public.opportunities(user_id, source_system, external_id)
  where source_system is not null;

create or replace function public.import_opportunities_csv(items jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  actor uuid := auth.uid(); item jsonb; previous public.opportunities; saved public.opportunities;
  inserted_count int := 0; updated_count int := 0; skipped_count int := 0;
  records jsonb := '[]'::jsonb; incoming_date date; incoming_type public.opportunities.type%type;
  snapshot jsonb; seen text[] := '{}';
begin
  if actor is null then raise exception 'Autenticação necessária'; end if;
  if jsonb_typeof(items) is distinct from 'array' or jsonb_array_length(items) not between 1 and 2000 then
    raise exception 'Selecione de 1 a 2000 oportunidades';
  end if;
  -- Serializes imports for the same account. Manual updates are protected by row locks and snapshots.
  perform pg_advisory_xact_lock(hashtextextended(actor::text, 3102026));
  for item in select value from jsonb_array_elements(items) loop
    if (item->>'external_id') is null or (item->>'external_id') !~ '^[0-9]{1,64}$'
      or coalesce(length(btrim(item->>'client_name')),0) not between 1 and 300
      or coalesce(item->>'action','') not in ('insert','update')
      or coalesce(item->>'type','') not in ('PF','PJ')
      or coalesce(item->>'registration_date','') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
      raise exception 'Dados de importação inválidos';
    end if;
    if item->>'external_id' = any(seen) then raise exception 'ID repetido no lote'; end if;
    seen := array_append(seen,item->>'external_id');
    incoming_date := (item->>'registration_date')::date;
    if incoming_date < date '1900-01-01' or incoming_date > date '9998-12-31' then raise exception 'Data inválida'; end if;
    incoming_type := item->>'type';
    select * into previous from public.opportunities
      where user_id=actor and source_system='crm_csv_v1' and external_id=item->>'external_id' for update;
    if found then
      if item->>'action' = 'insert' then
        skipped_count := skipped_count + 1;
        records := records || jsonb_build_array(to_jsonb(previous));
        continue;
      end if;
      snapshot := jsonb_build_object('client_name',previous.client_name,'registration_date',previous.registration_date,
        'expiration_date',previous.expiration_date,'type',previous.type,'source_name',previous.source_name,
        'source_registration_date',previous.source_registration_date);
      if item->'expected' is distinct from snapshot then
        raise exception 'A carteira mudou desde a prévia. Feche e importe o arquivo novamente.';
      end if;
      update public.opportunities set client_name=btrim(item->>'client_name'), registration_date=incoming_date,
        type=incoming_type,
        expiration_date=case when coalesce((item->>'recalculate_expiration')::boolean,false)
          then incoming_date + case when incoming_type='PJ' then 30 else 15 end else previous.expiration_date end,
        source_name=btrim(item->>'client_name'), source_registration_date=incoming_date
        where id=previous.id and user_id=actor returning * into saved;
      updated_count := updated_count + 1;
    else
      if item->>'action' = 'update' then raise exception 'A carteira mudou desde a prévia. Feche e importe o arquivo novamente.'; end if;
      insert into public.opportunities(user_id,client_name,cpf_cnpj,type,phone,registration_date,expiration_date,status,
        source_system,external_id,source_name,source_registration_date,imported_at)
        values(actor,btrim(item->>'client_name'),'',incoming_type,'',incoming_date,
          incoming_date + case when incoming_type='PJ' then 30 else 15 end,'active',
          'crm_csv_v1',item->>'external_id',btrim(item->>'client_name'),incoming_date,now())
        on conflict (user_id,source_system,external_id) where source_system is not null do nothing returning * into saved;
      if not found then skipped_count := skipped_count + 1; continue; end if;
      inserted_count := inserted_count + 1;
    end if;
    records := records || jsonb_build_array(to_jsonb(saved));
  end loop;
  return jsonb_build_object('inserted',inserted_count,'updated',updated_count,'skipped',skipped_count,'records',records);
end;
$$;
revoke all on function public.import_opportunities_csv(jsonb) from public, anon;
grant execute on function public.import_opportunities_csv(jsonb) to authenticated;
