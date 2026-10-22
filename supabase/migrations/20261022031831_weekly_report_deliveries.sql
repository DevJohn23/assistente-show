-- Server-only delivery ledger. Provider acceptance does not imply inbox delivery.
create table public.weekly_report_deliveries (
  user_id uuid not null references auth.users(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  status text not null check (status in ('processing', 'accepted', 'needs_review')),
  provider_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, period_start),
  check (period_end = period_start + 7),
  check (status <> 'accepted' or provider_id is not null)
);
alter table public.weekly_report_deliveries enable row level security;
revoke all on public.weekly_report_deliveries from public, anon, authenticated;
grant select, insert, update, delete on public.weekly_report_deliveries to service_role;
