-- 00004: shifts, readings, sales, deliveries, cash reconciliation

create table public.shifts (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references public.stations (id) on delete cascade,
  opened_by uuid not null references public.profiles (id) on delete restrict,
  closed_by uuid references public.profiles (id) on delete set null,
  status shift_status not null default 'open',
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  constraint shifts_closed_consistency check (
    (status = 'open' and closed_at is null) or (status = 'closed' and closed_at is not null)
  )
);

create index shifts_station_idx on public.shifts (station_id);
create index shifts_status_idx on public.shifts (station_id, status);

-- Only one open shift per station at a time.
create unique index shifts_one_open_per_station
  on public.shifts (station_id)
  where status = 'open';

create table public.shift_readings (
  id uuid primary key default gen_random_uuid(),
  shift_id uuid not null references public.shifts (id) on delete cascade,
  nozzle_id uuid not null references public.nozzles (id) on delete cascade,
  opening_index numeric(12, 2) not null,
  closing_index numeric(12, 2),
  recorded_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (shift_id, nozzle_id),
  constraint shift_readings_closing_gte_opening check (
    closing_index is null or closing_index >= opening_index
  )
);

create index shift_readings_shift_idx on public.shift_readings (shift_id);

create trigger set_shift_readings_updated_at
  before update on public.shift_readings
  for each row execute function public.set_updated_at();

create table public.fuel_sales (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references public.stations (id) on delete cascade,
  shift_id uuid not null references public.shifts (id) on delete cascade,
  nozzle_id uuid references public.nozzles (id) on delete set null,
  fuel_type fuel_type not null,
  liters numeric(10, 2) not null check (liters > 0),
  unit_price numeric(8, 2) not null check (unit_price > 0),
  total_amount numeric(12, 2) generated always as (round(liters * unit_price, 2)) stored,
  payment_method payment_method not null default 'cash',
  recorded_by uuid not null references public.profiles (id) on delete restrict,
  sold_at timestamptz not null default now()
);

create index fuel_sales_station_idx on public.fuel_sales (station_id, sold_at);
create index fuel_sales_shift_idx on public.fuel_sales (shift_id);

-- Suppliers is created here (ahead of the rest of the business tables in
-- 00005) because fuel_deliveries needs to reference it.
create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  contact_name text,
  phone text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index suppliers_org_idx on public.suppliers (organization_id);

create trigger set_suppliers_updated_at
  before update on public.suppliers
  for each row execute function public.set_updated_at();

create table public.fuel_deliveries (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references public.stations (id) on delete cascade,
  tank_id uuid not null references public.tanks (id) on delete cascade,
  supplier_id uuid references public.suppliers (id) on delete set null,
  liters numeric(10, 2) not null check (liters > 0),
  unit_cost numeric(8, 2),
  delivery_note_ref text,
  delivered_at timestamptz not null default now(),
  received_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now()
);

create index fuel_deliveries_station_idx on public.fuel_deliveries (station_id);
create index fuel_deliveries_tank_idx on public.fuel_deliveries (tank_id);

create table public.cash_reconciliations (
  id uuid primary key default gen_random_uuid(),
  shift_id uuid not null references public.shifts (id) on delete cascade,
  station_id uuid not null references public.stations (id) on delete cascade,
  expected_amount numeric(12, 2) not null,
  counted_amount numeric(12, 2) not null,
  difference numeric(12, 2) generated always as (round(counted_amount - expected_amount, 2)) stored,
  notes text,
  recorded_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (shift_id)
);

create index cash_reconciliations_station_idx on public.cash_reconciliations (station_id);
