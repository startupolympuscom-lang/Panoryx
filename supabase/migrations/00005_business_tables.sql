-- 00005: suppliers' purchase orders, staffing, expenses, maintenance, alerts
-- (suppliers itself lives in 00004, ahead of fuel_deliveries)

create table public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  station_id uuid not null references public.stations (id) on delete cascade,
  supplier_id uuid not null references public.suppliers (id) on delete restrict,
  status purchase_order_status not null default 'draft',
  total_amount numeric(12, 2) not null default 0 check (total_amount >= 0),
  expected_date date,
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index purchase_orders_org_idx on public.purchase_orders (organization_id);
create index purchase_orders_station_idx on public.purchase_orders (station_id);

create trigger set_purchase_orders_updated_at
  before update on public.purchase_orders
  for each row execute function public.set_updated_at();

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  station_id uuid references public.stations (id) on delete set null,
  full_name text not null,
  role_title text,
  phone text,
  email text,
  hired_at date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index employees_org_idx on public.employees (organization_id);
create index employees_station_idx on public.employees (station_id);

create trigger set_employees_updated_at
  before update on public.employees
  for each row execute function public.set_updated_at();

create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  station_id uuid not null references public.stations (id) on delete cascade,
  work_date date not null,
  status attendance_status not null default 'present',
  check_in timestamptz,
  check_out timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  unique (employee_id, work_date)
);

create index attendance_station_idx on public.attendance_records (station_id, work_date);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  station_id uuid references public.stations (id) on delete set null,
  category text not null,
  amount numeric(12, 2) not null check (amount > 0),
  description text,
  expense_date date not null default current_date,
  recorded_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now()
);

create index expenses_org_idx on public.expenses (organization_id);
create index expenses_station_idx on public.expenses (station_id, expense_date);

create table public.maintenance_tickets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  station_id uuid not null references public.stations (id) on delete cascade,
  title text not null,
  description text,
  status maintenance_status not null default 'open',
  priority maintenance_priority not null default 'medium',
  reported_by uuid not null references public.profiles (id) on delete restrict,
  assigned_to uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index maintenance_org_idx on public.maintenance_tickets (organization_id);
create index maintenance_station_idx on public.maintenance_tickets (station_id, status);

create trigger set_maintenance_tickets_updated_at
  before update on public.maintenance_tickets
  for each row execute function public.set_updated_at();

create table public.operational_alerts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  station_id uuid references public.stations (id) on delete cascade,
  type text not null,
  severity alert_severity not null default 'info',
  message text not null,
  is_resolved boolean not null default false,
  related_table text,
  related_id uuid,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index operational_alerts_org_idx on public.operational_alerts (organization_id, is_resolved);
create index operational_alerts_station_idx on public.operational_alerts (station_id);
