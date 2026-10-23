-- 00011: employee salary, and a shop/convenience-store module (products
-- with cost/retail price, and sales against them) so stations that run a
-- supermarché/boutique alongside the pumps can track its margin and have
-- it count toward turnover.

alter table public.employees add column salary numeric(10, 2);

create table public.shop_products (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references public.stations (id) on delete cascade,
  name text not null,
  cost_price numeric(10, 2) not null check (cost_price >= 0),
  retail_price numeric(10, 2) not null check (retail_price > 0),
  stock_quantity numeric(10, 2) not null default 0 check (stock_quantity >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index shop_products_station_idx on public.shop_products (station_id);

create trigger set_shop_products_updated_at
  before update on public.shop_products
  for each row execute function public.set_updated_at();

create table public.shop_sales (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references public.stations (id) on delete cascade,
  product_id uuid not null references public.shop_products (id) on delete restrict,
  quantity numeric(10, 2) not null check (quantity > 0),
  -- Cost/price are snapshotted at sale time (not read live from the
  -- product) so historical profit stays accurate even if the catalog
  -- price changes later — same rationale as fuel_sales not joining tanks.
  unit_cost numeric(10, 2) not null check (unit_cost >= 0),
  unit_price numeric(10, 2) not null check (unit_price > 0),
  total_amount numeric(12, 2) generated always as (round(quantity * unit_price, 2)) stored,
  total_profit numeric(12, 2) generated always as (round(quantity * (unit_price - unit_cost), 2)) stored,
  sold_at timestamptz not null default now(),
  recorded_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now()
);

create index shop_sales_station_idx on public.shop_sales (station_id, sold_at);
create index shop_sales_product_idx on public.shop_sales (product_id);

alter table public.shop_products enable row level security;
alter table public.shop_sales enable row level security;

create policy shop_products_select on public.shop_products
  for select using (is_org_member(station_org_id(station_id)) or is_super_admin());
create policy shop_products_write on public.shop_products
  for all
  using (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager']::org_role[]))
  with check (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager']::org_role[]));

create policy shop_sales_select on public.shop_sales
  for select using (is_org_member(station_org_id(station_id)) or is_super_admin());
create policy shop_sales_write on public.shop_sales
  for all
  using (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager', 'operator']::org_role[]))
  with check (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager', 'operator']::org_role[]));
