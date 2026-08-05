-- 00015: tank gauge certificates, delivery shortfall reports, pending-invoice
-- tracking (module 18), and delivery driver history (module 19). Excludes
-- the "driver sells un-invoiced fuel" tracking from the original spec —
-- that fed the undeclared-purchases ratio (module 1) and was declined.

create table public.delivery_drivers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  full_name text not null,
  supplier_id uuid references public.suppliers (id) on delete set null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index delivery_drivers_org_idx on public.delivery_drivers (organization_id);

create trigger set_delivery_drivers_updated_at
  before update on public.delivery_drivers
  for each row execute function public.set_updated_at();

-- A delivery's ordered quantity, which driver brought it, and whether the
-- supplier's invoice has been received yet — the existing fuel_deliveries
-- table only tracked what was actually delivered.
alter table public.fuel_deliveries add column ordered_quantity numeric(10, 2);
alter table public.fuel_deliveries add column driver_id uuid references public.delivery_drivers (id) on delete set null;
alter table public.fuel_deliveries add column invoice_received boolean not null default false;
alter table public.fuel_deliveries add column invoice_received_at timestamptz;
alter table public.fuel_deliveries add column invoice_reference text;

create index fuel_deliveries_driver_idx on public.fuel_deliveries (driver_id);
create index fuel_deliveries_pending_invoice_idx on public.fuel_deliveries (station_id, invoice_received);

create table public.tank_gauge_certificates (
  id uuid primary key default gen_random_uuid(),
  tank_id uuid not null references public.tanks (id) on delete cascade,
  station_id uuid not null references public.stations (id) on delete cascade,
  measured_quantity numeric(10, 2) not null check (measured_quantity >= 0),
  theoretical_quantity numeric(10, 2) not null,
  variance numeric(10, 2) generated always as (round(measured_quantity - theoretical_quantity, 2)) stored,
  certified_by uuid not null references public.profiles (id) on delete restrict,
  certified_at timestamptz not null default now()
);

create index tank_gauge_certificates_tank_idx on public.tank_gauge_certificates (tank_id, certified_at);
create index tank_gauge_certificates_station_idx on public.tank_gauge_certificates (station_id);

-- "Facture Manque": a signed document recording a delivery shortfall.
create table public.delivery_shortfall_reports (
  id uuid primary key default gen_random_uuid(),
  delivery_id uuid not null references public.fuel_deliveries (id) on delete cascade,
  station_id uuid not null references public.stations (id) on delete cascade,
  missing_quantity numeric(10, 2) not null check (missing_quantity > 0),
  driver_name text not null,
  signature_note text,
  report_date date not null default current_date,
  reported_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now()
);

create index delivery_shortfall_reports_delivery_idx on public.delivery_shortfall_reports (delivery_id);
create index delivery_shortfall_reports_station_idx on public.delivery_shortfall_reports (station_id);

alter table public.delivery_drivers enable row level security;
alter table public.tank_gauge_certificates enable row level security;
alter table public.delivery_shortfall_reports enable row level security;

create policy delivery_drivers_select on public.delivery_drivers
  for select using (is_org_member(organization_id) or is_super_admin());
create policy delivery_drivers_write on public.delivery_drivers
  for all
  using (has_org_write_role(organization_id, array['owner', 'network_manager', 'station_manager']::org_role[]))
  with check (has_org_write_role(organization_id, array['owner', 'network_manager', 'station_manager']::org_role[]));

create policy tank_gauge_certificates_select on public.tank_gauge_certificates
  for select using (is_org_member(station_org_id(station_id)) or is_super_admin());
create policy tank_gauge_certificates_write on public.tank_gauge_certificates
  for insert
  with check (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager', 'operator']::org_role[]));

create policy delivery_shortfall_reports_select on public.delivery_shortfall_reports
  for select using (is_org_member(station_org_id(station_id)) or is_super_admin());
create policy delivery_shortfall_reports_write on public.delivery_shortfall_reports
  for insert
  with check (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager', 'operator']::org_role[]));
