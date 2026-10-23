-- Panoryx development seed data.
--
-- Safe to run multiple times (idempotent via ON CONFLICT / existence
-- checks). The product catalog itself is seeded by migration
-- 00009_product_catalog.sql (every deployment needs it, not just
-- development), so this file only adds a reference "Panoryx Demo"
-- organization with stations, tanks, pumps, nozzles and suppliers using
-- Moroccan conventions (MAD, Gasoil/SP95/SP98, Casablanca/Rabat/Marrakech/
-- Tanger). This organization is NOT linked to any auth user by default —
-- see README.md for how to attach your own local account to it so you can
-- exercise the PanoStation workflows against realistic data.

do $$
declare
  demo_org_id uuid;
  station_casa uuid;
  station_rabat uuid;
  station_marrakech uuid;
  station_tanger uuid;

  tank_id uuid;
  pump_id uuid;

  supplier_afriquia uuid;
  supplier_vivo uuid;
begin
  select id into demo_org_id from public.organizations where slug = 'panoryx-demo';

  if demo_org_id is null then
    insert into public.organizations (name, slug, created_by)
    values ('Panoryx Demo', 'panoryx-demo', null)
    returning id into demo_org_id;
  end if;

  -- Grant the demo org a running PanoStation trial.
  insert into public.organization_products (organization_id, product_id, status, trial_ends_at)
  select demo_org_id, p.id, 'trial', now() + interval '30 days'
  from public.products p
  where p.slug = 'panostation'
  on conflict (organization_id, product_id) do nothing;

  -- Stations -------------------------------------------------------------
  if not exists (select 1 from public.stations where organization_id = demo_org_id and name = 'Casablanca Centre') then
    insert into public.stations (organization_id, name, city, address)
    values (demo_org_id, 'Casablanca Centre', 'Casablanca', 'Boulevard Zerktouni')
    returning id into station_casa;
  else
    select id into station_casa from public.stations where organization_id = demo_org_id and name = 'Casablanca Centre';
  end if;

  if not exists (select 1 from public.stations where organization_id = demo_org_id and name = 'Rabat Agdal') then
    insert into public.stations (organization_id, name, city, address)
    values (demo_org_id, 'Rabat Agdal', 'Rabat', 'Avenue Fal Ould Oumeir')
    returning id into station_rabat;
  else
    select id into station_rabat from public.stations where organization_id = demo_org_id and name = 'Rabat Agdal';
  end if;

  if not exists (select 1 from public.stations where organization_id = demo_org_id and name = 'Marrakech Guéliz') then
    insert into public.stations (organization_id, name, city, address)
    values (demo_org_id, 'Marrakech Guéliz', 'Marrakech', 'Avenue Mohammed V')
    returning id into station_marrakech;
  else
    select id into station_marrakech from public.stations where organization_id = demo_org_id and name = 'Marrakech Guéliz';
  end if;

  if not exists (select 1 from public.stations where organization_id = demo_org_id and name = 'Tanger Centre') then
    insert into public.stations (organization_id, name, city, address)
    values (demo_org_id, 'Tanger Centre', 'Tanger', 'Avenue Mohammed VI')
    returning id into station_tanger;
  else
    select id into station_tanger from public.stations where organization_id = demo_org_id and name = 'Tanger Centre';
  end if;

  -- Suppliers --------------------------------------------------------------
  if not exists (select 1 from public.suppliers where organization_id = demo_org_id and name = 'Afriquia Distribution') then
    insert into public.suppliers (organization_id, name, contact_name, phone, email)
    values (demo_org_id, 'Afriquia Distribution', 'Karim Benslimane', '+212 522 00 11 22', 'contact@afriquia-demo.ma')
    returning id into supplier_afriquia;
  end if;

  if not exists (select 1 from public.suppliers where organization_id = demo_org_id and name = 'Vivo Energy Maroc') then
    insert into public.suppliers (organization_id, name, contact_name, phone, email)
    values (demo_org_id, 'Vivo Energy Maroc', 'Sanae El Amrani', '+212 522 33 44 55', 'contact@vivoenergy-demo.ma')
    returning id into supplier_vivo;
  end if;

  -- Tanks + pumps + nozzles, one representative set per station ----------
  if not exists (select 1 from public.tanks where station_id = station_casa) then
    insert into public.tanks (station_id, label, fuel_type, capacity_liters, current_volume_liters, low_level_threshold_liters)
    values
      (station_casa, 'Cuve 1 — Gasoil', 'gasoil', 30000, 21400, 6000),
      (station_casa, 'Cuve 2 — SP95', 'sp95', 15000, 4200, 3000),
      (station_casa, 'Cuve 3 — SP98', 'sp98', 10000, 7100, 2000);

    insert into public.pumps (station_id, label) values (station_casa, 'Pompe 1') returning id into pump_id;
    select id into tank_id from public.tanks where station_id = station_casa and fuel_type = 'gasoil';
    insert into public.nozzles (pump_id, station_id, tank_id, label, fuel_type, last_index_liters)
    values (pump_id, station_casa, tank_id, 'Pompe 1 — Buse Gasoil', 'gasoil', 128430);

    insert into public.pumps (station_id, label) values (station_casa, 'Pompe 2') returning id into pump_id;
    select id into tank_id from public.tanks where station_id = station_casa and fuel_type = 'sp95';
    insert into public.nozzles (pump_id, station_id, tank_id, label, fuel_type, last_index_liters)
    values (pump_id, station_casa, tank_id, 'Pompe 2 — Buse SP95', 'sp95', 87650);
  end if;

  if not exists (select 1 from public.tanks where station_id = station_rabat) then
    insert into public.tanks (station_id, label, fuel_type, capacity_liters, current_volume_liters, low_level_threshold_liters)
    values
      (station_rabat, 'Cuve 1 — Gasoil', 'gasoil', 25000, 18300, 5000),
      (station_rabat, 'Cuve 2 — SP95', 'sp95', 12000, 5400, 2500);

    insert into public.pumps (station_id, label) values (station_rabat, 'Pompe 1') returning id into pump_id;
    select id into tank_id from public.tanks where station_id = station_rabat and fuel_type = 'gasoil';
    insert into public.nozzles (pump_id, station_id, tank_id, label, fuel_type, last_index_liters)
    values (pump_id, station_rabat, tank_id, 'Pompe 1 — Buse Gasoil', 'gasoil', 96210);
  end if;

  if not exists (select 1 from public.tanks where station_id = station_marrakech) then
    insert into public.tanks (station_id, label, fuel_type, capacity_liters, current_volume_liters, low_level_threshold_liters)
    values
      (station_marrakech, 'Cuve 1 — Gasoil', 'gasoil', 28000, 6200, 6000),
      (station_marrakech, 'Cuve 2 — SP98', 'sp98', 10000, 3100, 2000);

    insert into public.pumps (station_id, label) values (station_marrakech, 'Pompe 1') returning id into pump_id;
    select id into tank_id from public.tanks where station_id = station_marrakech and fuel_type = 'gasoil';
    insert into public.nozzles (pump_id, station_id, tank_id, label, fuel_type, last_index_liters)
    values (pump_id, station_marrakech, tank_id, 'Pompe 1 — Buse Gasoil', 'gasoil', 143870);
  end if;

  if not exists (select 1 from public.tanks where station_id = station_tanger) then
    insert into public.tanks (station_id, label, fuel_type, capacity_liters, current_volume_liters, low_level_threshold_liters)
    values (station_tanger, 'Cuve 1 — Gasoil', 'gasoil', 22000, 15100, 5000);

    insert into public.pumps (station_id, label) values (station_tanger, 'Pompe 1') returning id into pump_id;
    select id into tank_id from public.tanks where station_id = station_tanger and fuel_type = 'gasoil';
    insert into public.nozzles (pump_id, station_id, tank_id, label, fuel_type, last_index_liters)
    values (pump_id, station_tanger, tank_id, 'Pompe 1 — Buse Gasoil', 'gasoil', 71340);
  end if;
end $$;
