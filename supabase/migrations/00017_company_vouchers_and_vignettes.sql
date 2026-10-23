-- 00017: "Bon Société" vouchers (signed, deferred-payment slips) and
-- entreprise vignettes for fuel and café/boutique (module 7).

create type voucher_status as enum ('unpaid', 'paid');
create type voucher_payment_method as enum ('cash', 'check', 'transfer');
create type vignette_type as enum ('fuel', 'cafe_boutique');

create table public.voucher_companies (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references public.stations (id) on delete cascade,
  name text not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index voucher_companies_station_idx on public.voucher_companies (station_id);

create trigger set_voucher_companies_updated_at
  before update on public.voucher_companies
  for each row execute function public.set_updated_at();

create table public.company_vouchers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.voucher_companies (id) on delete cascade,
  station_id uuid not null references public.stations (id) on delete cascade,
  amount numeric(10, 2) not null check (amount > 0),
  product_description text not null,
  status voucher_status not null default 'unpaid',
  payment_method voucher_payment_method,
  paid_at timestamptz,
  issued_at timestamptz not null default now(),
  recorded_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now()
);

create index company_vouchers_company_idx on public.company_vouchers (company_id, issued_at);
create index company_vouchers_station_idx on public.company_vouchers (station_id, status);

create table public.vignette_usages (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.voucher_companies (id) on delete cascade,
  station_id uuid not null references public.stations (id) on delete cascade,
  vignette_type vignette_type not null,
  amount numeric(10, 2) not null check (amount > 0),
  product_description text,
  used_at timestamptz not null default now(),
  recorded_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now()
);

create index vignette_usages_company_idx on public.vignette_usages (company_id, used_at);
create index vignette_usages_station_idx on public.vignette_usages (station_id);

alter table public.voucher_companies enable row level security;
alter table public.company_vouchers enable row level security;
alter table public.vignette_usages enable row level security;

create policy voucher_companies_select on public.voucher_companies
  for select using (is_org_member(station_org_id(station_id)) or is_super_admin());
create policy voucher_companies_write on public.voucher_companies
  for all
  using (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager']::org_role[]))
  with check (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager']::org_role[]));

create policy company_vouchers_select on public.company_vouchers
  for select using (is_org_member(station_org_id(station_id)) or is_super_admin());
create policy company_vouchers_write on public.company_vouchers
  for all
  using (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager', 'accountant', 'operator']::org_role[]))
  with check (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager', 'accountant', 'operator']::org_role[]));

create policy vignette_usages_select on public.vignette_usages
  for select using (is_org_member(station_org_id(station_id)) or is_super_admin());
create policy vignette_usages_write on public.vignette_usages
  for insert
  with check (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager', 'accountant', 'operator']::org_role[]));
