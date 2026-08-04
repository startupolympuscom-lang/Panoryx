-- 00013: Point of sale for the café/restaurant side of a station (module
-- 14) — menu, ingredient stock, recipes, orders, and a physical stock
-- count so a manager can compare theoretical vs. counted ingredient stock
-- and spot shrinkage by product.

create type cafe_order_status as enum ('completed', 'cancelled');

create table public.cafe_products (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references public.stations (id) on delete cascade,
  name text not null,
  category text,
  price numeric(10, 2) not null check (price > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index cafe_products_station_idx on public.cafe_products (station_id);

create trigger set_cafe_products_updated_at
  before update on public.cafe_products
  for each row execute function public.set_updated_at();

create table public.cafe_ingredients (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references public.stations (id) on delete cascade,
  name text not null,
  unit text not null,
  stock_quantity numeric(10, 2) not null default 0 check (stock_quantity >= 0),
  cost_per_unit numeric(10, 4) not null default 0 check (cost_per_unit >= 0),
  low_stock_threshold numeric(10, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index cafe_ingredients_station_idx on public.cafe_ingredients (station_id);

create trigger set_cafe_ingredients_updated_at
  before update on public.cafe_ingredients
  for each row execute function public.set_updated_at();

-- Recipe: how much of each ingredient one unit of a product consumes.
create table public.cafe_recipe_items (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.cafe_products (id) on delete cascade,
  ingredient_id uuid not null references public.cafe_ingredients (id) on delete cascade,
  quantity_required numeric(10, 4) not null check (quantity_required > 0),
  unique (product_id, ingredient_id)
);

create index cafe_recipe_items_product_idx on public.cafe_recipe_items (product_id);
create index cafe_recipe_items_ingredient_idx on public.cafe_recipe_items (ingredient_id);

create table public.cafe_orders (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references public.stations (id) on delete cascade,
  status cafe_order_status not null default 'completed',
  total_amount numeric(12, 2) not null default 0 check (total_amount >= 0),
  recorded_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now()
);

create index cafe_orders_station_idx on public.cafe_orders (station_id, created_at);
create index cafe_orders_recorded_by_idx on public.cafe_orders (recorded_by);

create table public.cafe_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.cafe_orders (id) on delete cascade,
  product_id uuid not null references public.cafe_products (id) on delete restrict,
  quantity numeric(10, 2) not null check (quantity > 0),
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  total_amount numeric(12, 2) generated always as (round(quantity * unit_price, 2)) stored
);

create index cafe_order_items_order_idx on public.cafe_order_items (order_id);
create index cafe_order_items_product_idx on public.cafe_order_items (product_id);

-- Physical stock count for an ingredient: theoretical_quantity is the
-- system's live stock_quantity at the moment of the count (already
-- decremented order by order per recipe), counted_quantity is what was
-- physically measured. A negative variance beyond normal handling loss
-- is the signal the manager is after (shrinkage/theft).
create table public.cafe_stock_counts (
  id uuid primary key default gen_random_uuid(),
  ingredient_id uuid not null references public.cafe_ingredients (id) on delete cascade,
  station_id uuid not null references public.stations (id) on delete cascade,
  theoretical_quantity numeric(10, 2) not null,
  counted_quantity numeric(10, 2) not null check (counted_quantity >= 0),
  variance numeric(10, 2) generated always as (round(counted_quantity - theoretical_quantity, 2)) stored,
  counted_by uuid not null references public.profiles (id) on delete restrict,
  counted_at timestamptz not null default now()
);

create index cafe_stock_counts_ingredient_idx on public.cafe_stock_counts (ingredient_id, counted_at);
create index cafe_stock_counts_station_idx on public.cafe_stock_counts (station_id);

alter table public.cafe_products enable row level security;
alter table public.cafe_ingredients enable row level security;
alter table public.cafe_recipe_items enable row level security;
alter table public.cafe_orders enable row level security;
alter table public.cafe_order_items enable row level security;
alter table public.cafe_stock_counts enable row level security;

create policy cafe_products_select on public.cafe_products
  for select using (is_org_member(station_org_id(station_id)) or is_super_admin());
create policy cafe_products_write on public.cafe_products
  for all
  using (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager']::org_role[]))
  with check (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager']::org_role[]));

create policy cafe_ingredients_select on public.cafe_ingredients
  for select using (is_org_member(station_org_id(station_id)) or is_super_admin());
create policy cafe_ingredients_write on public.cafe_ingredients
  for all
  using (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager']::org_role[]))
  with check (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager']::org_role[]));

create policy cafe_recipe_items_select on public.cafe_recipe_items
  for select using (
    exists (
      select 1 from cafe_products p
      where p.id = product_id and (is_org_member(station_org_id(p.station_id)) or is_super_admin())
    )
  );
create policy cafe_recipe_items_write on public.cafe_recipe_items
  for all
  using (
    exists (
      select 1 from cafe_products p
      where p.id = product_id
        and has_org_write_role(station_org_id(p.station_id), array['owner', 'network_manager', 'station_manager']::org_role[])
    )
  )
  with check (
    exists (
      select 1 from cafe_products p
      where p.id = product_id
        and has_org_write_role(station_org_id(p.station_id), array['owner', 'network_manager', 'station_manager']::org_role[])
    )
  );

create policy cafe_orders_select on public.cafe_orders
  for select using (is_org_member(station_org_id(station_id)) or is_super_admin());
create policy cafe_orders_insert on public.cafe_orders
  for insert
  with check (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager', 'operator']::org_role[]));
create policy cafe_orders_update on public.cafe_orders
  for update
  using (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager']::org_role[]))
  with check (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager']::org_role[]));

create policy cafe_order_items_select on public.cafe_order_items
  for select using (
    exists (
      select 1 from cafe_orders o
      where o.id = order_id and (is_org_member(station_org_id(o.station_id)) or is_super_admin())
    )
  );
create policy cafe_order_items_insert on public.cafe_order_items
  for insert
  with check (
    exists (
      select 1 from cafe_orders o
      where o.id = order_id
        and has_org_write_role(station_org_id(o.station_id), array['owner', 'network_manager', 'station_manager', 'operator']::org_role[])
    )
  );

create policy cafe_stock_counts_select on public.cafe_stock_counts
  for select using (is_org_member(station_org_id(station_id)) or is_super_admin());
create policy cafe_stock_counts_write on public.cafe_stock_counts
  for insert
  with check (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager', 'accountant']::org_role[]));
