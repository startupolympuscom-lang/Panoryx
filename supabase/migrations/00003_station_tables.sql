-- 00003: stations and their fuel infrastructure

create table public.stations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  city text not null,
  address text,
  timezone text not null default 'Africa/Casablanca',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index stations_org_idx on public.stations (organization_id);

create trigger set_stations_updated_at
  before update on public.stations
  for each row execute function public.set_updated_at();

create table public.tanks (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references public.stations (id) on delete cascade,
  label text not null,
  fuel_type fuel_type not null,
  capacity_liters numeric(10, 2) not null check (capacity_liters > 0),
  current_volume_liters numeric(10, 2) not null default 0 check (current_volume_liters >= 0),
  low_level_threshold_liters numeric(10, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tanks_station_idx on public.tanks (station_id);

create trigger set_tanks_updated_at
  before update on public.tanks
  for each row execute function public.set_updated_at();

create table public.pumps (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references public.stations (id) on delete cascade,
  label text not null,
  created_at timestamptz not null default now()
);

create index pumps_station_idx on public.pumps (station_id);

create table public.nozzles (
  id uuid primary key default gen_random_uuid(),
  pump_id uuid not null references public.pumps (id) on delete cascade,
  station_id uuid not null references public.stations (id) on delete cascade,
  tank_id uuid not null references public.tanks (id) on delete restrict,
  label text not null,
  fuel_type fuel_type not null,
  last_index_liters numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index nozzles_pump_idx on public.nozzles (pump_id);
create index nozzles_station_idx on public.nozzles (station_id);

create trigger set_nozzles_updated_at
  before update on public.nozzles
  for each row execute function public.set_updated_at();
