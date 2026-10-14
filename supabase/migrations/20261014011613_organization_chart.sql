-- Company directory: authenticated consultation, administrator-only writes.
create schema if not exists org_private;
revoke all on schema org_private from public, anon, authenticated;

create function public.can_manage_organization() returns boolean
language sql stable security invoker set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.admin_users a
    where lower(a.email) = lower((select auth.jwt()->>'email'))
  );
$$;
revoke all on function public.can_manage_organization() from public, anon;
grant execute on function public.can_manage_organization() to authenticated;

create table public.org_departments (
  id text primary key default gen_random_uuid()::text,
  name text not null unique check (length(trim(name)) between 1 and 100),
  color text not null default '#2563eb' check (color ~ '^#[0-9a-fA-F]{6}$')
);
create table public.org_employees (
  id text primary key default gen_random_uuid()::text,
  name text not null check (length(trim(name)) between 1 and 150),
  job_title text not null check (length(trim(job_title)) between 1 and 150),
  department_id text not null references public.org_departments(id) on delete restrict,
  unit text not null default '' check (length(unit) <= 150),
  email text not null default '' check (length(email) <= 254),
  phone text not null default '' check (length(phone) <= 50),
  extension text not null default '' check (length(extension) <= 20),
  responsibilities text not null default '' check (length(responsibilities) <= 5000),
  serves jsonb not null default '[]' check (jsonb_typeof(serves) = 'array' and jsonb_array_length(serves) <= 30),
  manager_id text references public.org_employees(id) on delete restrict,
  photo_path text not null default '' check (length(photo_path) <= 500),
  status text not null default 'active' check (status in ('active', 'inactive')),
  is_example boolean not null default false,
  sort_order integer not null default 1000,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default clock_timestamp(),
  constraint org_not_own_manager check (manager_id is distinct from id)
);
create index org_employees_manager_idx on public.org_employees(manager_id);
create index org_employees_department_idx on public.org_employees(department_id);

create table public.org_history (
  id bigint generated always as identity primary key,
  entity_id text not null,
  entity_type text not null,
  operation text not null,
  actor_id uuid,
  actor_email text,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default clock_timestamp()
);
create index org_history_created_idx on public.org_history(created_at desc);

alter table public.org_employees enable row level security;
alter table public.org_departments enable row level security;
alter table public.org_history enable row level security;
revoke all on public.org_employees, public.org_departments, public.org_history from anon, authenticated;
grant select, insert, update, delete on public.org_employees, public.org_departments to authenticated;
grant select on public.org_history to authenticated;

create policy org_employee_read on public.org_employees for select to authenticated
using ((select auth.uid()) is not null and (status = 'active' or (select public.can_manage_organization())));
create policy org_employee_insert on public.org_employees for insert to authenticated
with check ((select public.can_manage_organization()));
create policy org_employee_update on public.org_employees for update to authenticated
using ((select public.can_manage_organization())) with check ((select public.can_manage_organization()));
create policy org_employee_delete on public.org_employees for delete to authenticated
using ((select public.can_manage_organization()));
create policy org_department_read on public.org_departments for select to authenticated using ((select auth.uid()) is not null);
create policy org_department_insert on public.org_departments for insert to authenticated with check ((select public.can_manage_organization()));
create policy org_department_update on public.org_departments for update to authenticated using ((select public.can_manage_organization())) with check ((select public.can_manage_organization()));
create policy org_department_delete on public.org_departments for delete to authenticated using ((select public.can_manage_organization()));
create policy org_history_read on public.org_history for select to authenticated using ((select public.can_manage_organization()));

-- Serializes hierarchy changes, validates cycles, and prevents orphaning active teams.
create function org_private.validate_employee() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare invalid_cycle boolean;
begin
  perform pg_advisory_xact_lock(741938220);
  if tg_op = 'DELETE' then return old; end if;
  new.updated_at := clock_timestamp();
  if new.manager_id is not null then
    if not exists (select 1 from public.org_employees where id = new.manager_id and status = 'active') then
      raise exception 'A liderança deve ser um colaborador ativo.' using errcode = '23514';
    end if;
    with recursive ancestors as (
      select id, manager_id from public.org_employees where id = new.manager_id
      union
      select e.id, e.manager_id from public.org_employees e join ancestors a on e.id = a.manager_id
    ) select exists(select 1 from ancestors where id = new.id) into invalid_cycle;
    if invalid_cycle then raise exception 'Esta alteração criaria um ciclo de liderança.' using errcode = '23514'; end if;
  end if;
  if new.status = 'inactive' and exists(select 1 from public.org_employees where manager_id = new.id and status = 'active') then
    raise exception 'Reatribua os liderados ativos antes de inativar esta pessoa.' using errcode = '23514';
  end if;
  if exists (select 1 from jsonb_array_elements(new.serves) item where jsonb_typeof(item) <> 'string' or length(item #>> '{}') > 150) then
    raise exception 'Informe atendimentos como textos de até 150 caracteres.' using errcode = '23514';
  end if;
  return new;
end;
$$;
create trigger org_validate_employee before insert or update or delete on public.org_employees
for each row execute function org_private.validate_employee();

-- Trigger-only privileged audit writer. Administrators cannot forge or erase history.
create function org_private.audit_change() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null and session_user not in ('postgres', 'supabase_admin') then
    raise exception 'Sessão necessária.' using errcode = '42501';
  end if;
  insert into public.org_history(entity_id, entity_type, operation, actor_id, actor_email, before_data, after_data)
  values(coalesce(new.id, old.id), tg_table_name, tg_op, auth.uid(), auth.jwt()->>'email',
    case when tg_op <> 'INSERT' then to_jsonb(old) end,
    case when tg_op <> 'DELETE' then to_jsonb(new) end);
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
revoke all on function org_private.audit_change() from public, anon, authenticated;
revoke all on function org_private.validate_employee() from public, anon, authenticated;
create trigger org_employee_audit after insert or update or delete on public.org_employees for each row execute function org_private.audit_change();
create trigger org_department_audit after insert or update or delete on public.org_departments for each row execute function org_private.audit_change();

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('organization-photos', 'organization-photos', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
create policy org_photo_read on storage.objects for select to authenticated
using (bucket_id = 'organization-photos' and (select auth.uid()) is not null);
create policy org_photo_insert on storage.objects for insert to authenticated
with check (bucket_id = 'organization-photos' and (select public.can_manage_organization()));
create policy org_photo_update on storage.objects for update to authenticated
using (bucket_id = 'organization-photos' and (select public.can_manage_organization()))
with check (bucket_id = 'organization-photos' and (select public.can_manage_organization()));
create policy org_photo_delete on storage.objects for delete to authenticated
using (bucket_id = 'organization-photos' and (select public.can_manage_organization()));
