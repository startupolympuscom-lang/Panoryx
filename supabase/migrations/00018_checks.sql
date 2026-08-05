-- 00018: customer checks/drafts (module 11) and company-issued checks for
-- expenses (module 12).

create type check_status as enum ('pending', 'cleared', 'bounced');

create table public.customer_checks (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.credit_customers (id) on delete cascade,
  station_id uuid not null references public.stations (id) on delete cascade,
  amount numeric(10, 2) not null check (amount > 0),
  check_number text not null,
  due_date date,
  status check_status not null default 'pending',
  recorded_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  cleared_at timestamptz
);

create index customer_checks_customer_idx on public.customer_checks (customer_id);
create index customer_checks_station_idx on public.customer_checks (station_id, status);

create table public.company_checks (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references public.stations (id) on delete cascade,
  beneficiary text not null,
  category text not null,
  amount numeric(10, 2) not null check (amount > 0),
  check_number text not null,
  issued_date date not null default current_date,
  status check_status not null default 'pending',
  recorded_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now()
);

create index company_checks_station_idx on public.company_checks (station_id, issued_date);
create index company_checks_category_idx on public.company_checks (station_id, category);

alter table public.customer_checks enable row level security;
alter table public.company_checks enable row level security;

create policy customer_checks_select on public.customer_checks
  for select using (is_org_member(station_org_id(station_id)) or is_super_admin());
create policy customer_checks_write on public.customer_checks
  for all
  using (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager', 'accountant']::org_role[]))
  with check (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager', 'accountant']::org_role[]));

create policy company_checks_select on public.company_checks
  for select using (is_org_member(station_org_id(station_id)) or is_super_admin());
create policy company_checks_write on public.company_checks
  for all
  using (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager', 'accountant']::org_role[]))
  with check (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager', 'accountant']::org_role[]));
