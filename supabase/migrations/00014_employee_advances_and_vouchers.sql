-- 00014: employee salary advances ("Bons") and free-fuel vouchers given
-- away by an employee (module 17). Employees already carry a monthly
-- salary (00011); this adds the running ledger against it.

create table public.employee_advances (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  amount numeric(10, 2) not null check (amount > 0),
  period_month date not null,
  note text,
  recorded_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now()
);

create index employee_advances_employee_idx on public.employee_advances (employee_id, period_month);
create index employee_advances_org_idx on public.employee_advances (organization_id);

-- A voucher an employee gives away for free (e.g. fuel to a friend/family
-- member) without collecting payment. Treated the same as a salary
-- advance once marked unreimbursed: it comes out of that employee's pay.
create table public.employee_fuel_vouchers (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  station_id uuid not null references public.stations (id) on delete cascade,
  amount numeric(10, 2) not null check (amount > 0),
  product_description text not null,
  beneficiary_name text,
  is_reimbursed boolean not null default false,
  voucher_date date not null default current_date,
  recorded_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now()
);

create index employee_fuel_vouchers_employee_idx on public.employee_fuel_vouchers (employee_id, voucher_date);
create index employee_fuel_vouchers_org_idx on public.employee_fuel_vouchers (organization_id);

alter table public.employee_advances enable row level security;
alter table public.employee_fuel_vouchers enable row level security;

create policy employee_advances_select on public.employee_advances
  for select using (is_org_member(organization_id) or is_super_admin());
create policy employee_advances_write on public.employee_advances
  for all
  using (has_org_write_role(organization_id, array['owner', 'network_manager', 'station_manager', 'accountant']::org_role[]))
  with check (has_org_write_role(organization_id, array['owner', 'network_manager', 'station_manager', 'accountant']::org_role[]));

create policy employee_fuel_vouchers_select on public.employee_fuel_vouchers
  for select using (is_org_member(organization_id) or is_super_admin());
create policy employee_fuel_vouchers_write on public.employee_fuel_vouchers
  for all
  using (has_org_write_role(organization_id, array['owner', 'network_manager', 'station_manager', 'accountant']::org_role[]))
  with check (has_org_write_role(organization_id, array['owner', 'network_manager', 'station_manager', 'accountant']::org_role[]));
