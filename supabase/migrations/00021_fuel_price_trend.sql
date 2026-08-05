-- 00021: fuel price trend advisory (module 5). This is a manually-set
-- trend indicator (rising/falling/stable) combined with tank stock-days
-- to produce a buy-now/wait recommendation — there is no live oil-price
-- or news-feed integration here (see the app's README/session notes for
-- why), so the trend has to be set by whoever is tracking the market.

create type fuel_price_trend as enum ('rising', 'falling', 'stable');

create table public.fuel_price_trend_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  trend fuel_price_trend not null,
  note text,
  set_by uuid not null references public.profiles (id) on delete restrict,
  set_at timestamptz not null default now()
);

create index fuel_price_trend_settings_org_idx on public.fuel_price_trend_settings (organization_id, set_at desc);

alter table public.fuel_price_trend_settings enable row level security;

create policy fuel_price_trend_settings_select on public.fuel_price_trend_settings
  for select using (is_org_member(organization_id) or is_super_admin());
create policy fuel_price_trend_settings_write on public.fuel_price_trend_settings
  for insert
  with check (has_org_write_role(organization_id, array['owner', 'network_manager', 'station_manager', 'accountant']::org_role[]));
