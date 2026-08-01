-- 00008: Row Level Security — every tenant-owned table is locked down here.
-- Nothing in this app relies on UI-only checks for authorization; each
-- policy below is enforced by Postgres regardless of which client issues
-- the query.

-- Prevent a user from granting themselves super-admin through a profile
-- update (RLS alone can't do column-level checks on UPDATE).
create or replace function public.prevent_super_admin_self_grant()
returns trigger
language plpgsql
as $$
begin
  if new.is_super_admin is distinct from old.is_super_admin and not public.is_super_admin() then
    new.is_super_admin := old.is_super_admin;
  end if;
  return new;
end;
$$;

create trigger guard_profiles_super_admin
  before update on public.profiles
  for each row execute function public.prevent_super_admin_self_grant();

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy profiles_select on public.profiles
  for select using (
    id = auth.uid()
    or is_super_admin()
    or exists (
      select 1 from organization_members m1
      join organization_members m2 on m1.organization_id = m2.organization_id
      where m1.user_id = auth.uid() and m2.user_id = profiles.id
    )
  );

create policy profiles_update_self on public.profiles
  for update using (id = auth.uid() or is_super_admin())
  with check (id = auth.uid() or is_super_admin());

-- ---------------------------------------------------------------------
-- organizations
-- ---------------------------------------------------------------------
alter table public.organizations enable row level security;

create policy organizations_select on public.organizations
  for select using (is_org_member(id) or is_super_admin());

create policy organizations_update on public.organizations
  for update using (has_org_write_role(id, array['owner']::org_role[]))
  with check (has_org_write_role(id, array['owner']::org_role[]));

-- ---------------------------------------------------------------------
-- organization_members
-- ---------------------------------------------------------------------
alter table public.organization_members enable row level security;

create policy organization_members_select on public.organization_members
  for select using (is_org_member(organization_id) or is_super_admin());

create policy organization_members_insert on public.organization_members
  for insert with check (has_org_write_role(organization_id, array['owner', 'network_manager']::org_role[]));

create policy organization_members_update on public.organization_members
  for update using (has_org_write_role(organization_id, array['owner', 'network_manager']::org_role[]))
  with check (has_org_write_role(organization_id, array['owner', 'network_manager']::org_role[]));

create policy organization_members_delete on public.organization_members
  for delete using (has_org_write_role(organization_id, array['owner']::org_role[]));

-- ---------------------------------------------------------------------
-- products (public catalog) & product_trial_config (internal)
-- ---------------------------------------------------------------------
alter table public.products enable row level security;

create policy products_select on public.products for select using (true);
create policy products_write on public.products for all
  using (is_super_admin()) with check (is_super_admin());

alter table public.product_trial_config enable row level security;

create policy product_trial_config_all on public.product_trial_config for all
  using (is_super_admin()) with check (is_super_admin());

-- ---------------------------------------------------------------------
-- organization_products (entitlements — not self-service)
-- ---------------------------------------------------------------------
alter table public.organization_products enable row level security;

create policy organization_products_select on public.organization_products
  for select using (is_org_member(organization_id) or is_super_admin());

create policy organization_products_write on public.organization_products
  for all using (is_super_admin()) with check (is_super_admin());

-- ---------------------------------------------------------------------
-- stations
-- ---------------------------------------------------------------------
alter table public.stations enable row level security;

create policy stations_select on public.stations
  for select using (is_org_member(organization_id) or is_super_admin());

create policy stations_insert on public.stations
  for insert with check (has_org_write_role(organization_id, array['owner', 'network_manager']::org_role[]));

create policy stations_update on public.stations
  for update using (has_org_write_role(organization_id, array['owner', 'network_manager']::org_role[]))
  with check (has_org_write_role(organization_id, array['owner', 'network_manager']::org_role[]));

create policy stations_delete on public.stations
  for delete using (has_org_write_role(organization_id, array['owner']::org_role[]));

-- ---------------------------------------------------------------------
-- tanks / pumps / nozzles
-- ---------------------------------------------------------------------
alter table public.tanks enable row level security;
alter table public.pumps enable row level security;
alter table public.nozzles enable row level security;

create policy tanks_select on public.tanks
  for select using (is_org_member(station_org_id(station_id)) or is_super_admin());
create policy tanks_write on public.tanks
  for all
  using (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager']::org_role[]))
  with check (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager']::org_role[]));

create policy pumps_select on public.pumps
  for select using (is_org_member(station_org_id(station_id)) or is_super_admin());
create policy pumps_write on public.pumps
  for all
  using (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager']::org_role[]))
  with check (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager']::org_role[]));

create policy nozzles_select on public.nozzles
  for select using (is_org_member(station_org_id(station_id)) or is_super_admin());
create policy nozzles_write on public.nozzles
  for all
  using (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager']::org_role[]))
  with check (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager']::org_role[]));

-- ---------------------------------------------------------------------
-- shifts / shift_readings
-- ---------------------------------------------------------------------
alter table public.shifts enable row level security;
alter table public.shift_readings enable row level security;

create policy shifts_select on public.shifts
  for select using (is_org_member(station_org_id(station_id)) or is_super_admin());
create policy shifts_insert on public.shifts
  for insert with check (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager', 'operator']::org_role[]));
create policy shifts_update on public.shifts
  for update
  using (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager', 'operator']::org_role[]))
  with check (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager', 'operator']::org_role[]));
create policy shifts_delete on public.shifts
  for delete using (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager']::org_role[]));

create policy shift_readings_select on public.shift_readings
  for select using (is_org_member(shift_org_id(shift_id)) or is_super_admin());
create policy shift_readings_write on public.shift_readings
  for all
  using (has_org_write_role(shift_org_id(shift_id), array['owner', 'network_manager', 'station_manager', 'operator']::org_role[]))
  with check (has_org_write_role(shift_org_id(shift_id), array['owner', 'network_manager', 'station_manager', 'operator']::org_role[]));

-- ---------------------------------------------------------------------
-- fuel_sales
-- ---------------------------------------------------------------------
alter table public.fuel_sales enable row level security;

create policy fuel_sales_select on public.fuel_sales
  for select using (is_org_member(station_org_id(station_id)) or is_super_admin());
create policy fuel_sales_insert on public.fuel_sales
  for insert with check (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager', 'operator']::org_role[]));
create policy fuel_sales_update on public.fuel_sales
  for update
  using (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager', 'accountant']::org_role[]))
  with check (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager', 'accountant']::org_role[]));
create policy fuel_sales_delete on public.fuel_sales
  for delete using (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager']::org_role[]));

-- ---------------------------------------------------------------------
-- fuel_deliveries
-- ---------------------------------------------------------------------
alter table public.fuel_deliveries enable row level security;

create policy fuel_deliveries_select on public.fuel_deliveries
  for select using (is_org_member(station_org_id(station_id)) or is_super_admin());
create policy fuel_deliveries_insert on public.fuel_deliveries
  for insert with check (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager']::org_role[]));
create policy fuel_deliveries_update on public.fuel_deliveries
  for update
  using (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager']::org_role[]))
  with check (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager']::org_role[]));
create policy fuel_deliveries_delete on public.fuel_deliveries
  for delete using (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager']::org_role[]));

-- ---------------------------------------------------------------------
-- cash_reconciliations
-- ---------------------------------------------------------------------
alter table public.cash_reconciliations enable row level security;

create policy cash_reconciliations_select on public.cash_reconciliations
  for select using (is_org_member(station_org_id(station_id)) or is_super_admin());
create policy cash_reconciliations_insert on public.cash_reconciliations
  for insert with check (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager', 'accountant']::org_role[]));
create policy cash_reconciliations_update on public.cash_reconciliations
  for update
  using (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'accountant']::org_role[]))
  with check (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'accountant']::org_role[]));
create policy cash_reconciliations_delete on public.cash_reconciliations
  for delete using (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager']::org_role[]));

-- ---------------------------------------------------------------------
-- suppliers / purchase_orders
-- ---------------------------------------------------------------------
alter table public.suppliers enable row level security;
alter table public.purchase_orders enable row level security;

create policy suppliers_select on public.suppliers
  for select using (is_org_member(organization_id) or is_super_admin());
create policy suppliers_write on public.suppliers
  for all
  using (has_org_write_role(organization_id, array['owner', 'network_manager', 'station_manager', 'accountant']::org_role[]))
  with check (has_org_write_role(organization_id, array['owner', 'network_manager', 'station_manager', 'accountant']::org_role[]));

create policy purchase_orders_select on public.purchase_orders
  for select using (is_org_member(organization_id) or is_super_admin());
create policy purchase_orders_write on public.purchase_orders
  for all
  using (has_org_write_role(organization_id, array['owner', 'network_manager', 'station_manager', 'accountant']::org_role[]))
  with check (has_org_write_role(organization_id, array['owner', 'network_manager', 'station_manager', 'accountant']::org_role[]));

-- ---------------------------------------------------------------------
-- employees / attendance_records
-- ---------------------------------------------------------------------
alter table public.employees enable row level security;
alter table public.attendance_records enable row level security;

create policy employees_select on public.employees
  for select using (is_org_member(organization_id) or is_super_admin());
create policy employees_write on public.employees
  for all
  using (has_org_write_role(organization_id, array['owner', 'network_manager', 'station_manager']::org_role[]))
  with check (has_org_write_role(organization_id, array['owner', 'network_manager', 'station_manager']::org_role[]));

create policy attendance_select on public.attendance_records
  for select using (is_org_member(station_org_id(station_id)) or is_super_admin());
create policy attendance_write on public.attendance_records
  for all
  using (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager']::org_role[]))
  with check (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager']::org_role[]));

-- ---------------------------------------------------------------------
-- expenses
-- ---------------------------------------------------------------------
alter table public.expenses enable row level security;

create policy expenses_select on public.expenses
  for select using (is_org_member(organization_id) or is_super_admin());
create policy expenses_write on public.expenses
  for all
  using (has_org_write_role(organization_id, array['owner', 'network_manager', 'station_manager', 'accountant']::org_role[]))
  with check (has_org_write_role(organization_id, array['owner', 'network_manager', 'station_manager', 'accountant']::org_role[]));

-- ---------------------------------------------------------------------
-- maintenance_tickets
-- ---------------------------------------------------------------------
alter table public.maintenance_tickets enable row level security;

create policy maintenance_select on public.maintenance_tickets
  for select using (is_org_member(organization_id) or is_super_admin());
create policy maintenance_insert on public.maintenance_tickets
  for insert with check (has_org_write_role(organization_id, array['owner', 'network_manager', 'station_manager', 'operator']::org_role[]));
create policy maintenance_update on public.maintenance_tickets
  for update
  using (
    has_org_write_role(organization_id, array['owner', 'network_manager', 'station_manager']::org_role[])
    or reported_by = auth.uid()
  )
  with check (is_org_member(organization_id));
create policy maintenance_delete on public.maintenance_tickets
  for delete using (has_org_write_role(organization_id, array['owner', 'network_manager']::org_role[]));

-- ---------------------------------------------------------------------
-- operational_alerts
-- ---------------------------------------------------------------------
alter table public.operational_alerts enable row level security;

create policy alerts_select on public.operational_alerts
  for select using (is_org_member(organization_id) or is_super_admin());
create policy alerts_insert on public.operational_alerts
  for insert with check (has_org_write_role(organization_id, array['owner', 'network_manager', 'station_manager']::org_role[]));
create policy alerts_update on public.operational_alerts
  for update
  using (has_org_write_role(organization_id, array['owner', 'network_manager', 'station_manager']::org_role[]))
  with check (has_org_write_role(organization_id, array['owner', 'network_manager', 'station_manager']::org_role[]));
create policy alerts_delete on public.operational_alerts
  for delete using (has_org_write_role(organization_id, array['owner', 'network_manager']::org_role[]));

-- ---------------------------------------------------------------------
-- contact_requests / demo_requests: public can insert, nobody but a
-- super admin can read submissions back out.
-- ---------------------------------------------------------------------
alter table public.contact_requests enable row level security;
alter table public.demo_requests enable row level security;

create policy contact_requests_insert on public.contact_requests
  for insert to anon, authenticated with check (true);
create policy contact_requests_select on public.contact_requests
  for select using (is_super_admin());

create policy demo_requests_insert on public.demo_requests
  for insert to anon, authenticated with check (true);
create policy demo_requests_select on public.demo_requests
  for select using (is_super_admin());

-- ---------------------------------------------------------------------
-- audit_logs: written only by SECURITY DEFINER functions/triggers,
-- readable by org owners/managers and super admins.
-- ---------------------------------------------------------------------
alter table public.audit_logs enable row level security;

create policy audit_logs_select on public.audit_logs
  for select using (
    is_super_admin()
    or (organization_id is not null and has_org_write_role(organization_id, array['owner', 'network_manager']::org_role[]))
  );
