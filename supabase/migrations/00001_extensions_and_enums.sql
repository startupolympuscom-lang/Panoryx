-- Panoryx / PanoStation schema
-- 00001: extensions and shared enum types

create extension if not exists "pgcrypto";

create type org_role as enum (
  'owner',
  'network_manager',
  'station_manager',
  'accountant',
  'operator',
  'viewer'
);

create type entitlement_status as enum (
  'trial',
  'active',
  'suspended',
  'cancelled'
);

create type shift_status as enum ('open', 'closed');

create type fuel_type as enum ('gasoil', 'sp95', 'sp98');

create type maintenance_status as enum ('open', 'in_progress', 'resolved', 'closed');

create type maintenance_priority as enum ('low', 'medium', 'high', 'critical');

create type alert_severity as enum ('info', 'warning', 'critical');

create type purchase_order_status as enum ('draft', 'ordered', 'received', 'cancelled');

create type attendance_status as enum ('present', 'absent', 'late', 'leave');

create type payment_method as enum ('cash', 'card', 'credit_account', 'mobile');

-- Generic updated_at trigger, reused by every table with an updated_at column.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
