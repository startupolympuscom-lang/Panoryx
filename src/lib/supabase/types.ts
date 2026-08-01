// Minimal hand-written types for the tables/enums this app reads and writes.
// If you regenerate types with `supabase gen types typescript`, this file
// can be replaced by the generated `Database` type without touching callers
// that only rely on the `Database` export shape below.

export type OrgRole =
  | "panoryx_admin"
  | "owner"
  | "network_manager"
  | "station_manager"
  | "accountant"
  | "operator"
  | "viewer";

export type EntitlementStatus = "trial" | "active" | "suspended" | "cancelled";
export type ShiftStatus = "open" | "closed";
export type FuelType = "gasoil" | "sp95" | "sp98";
export type MaintenanceStatus = "open" | "in_progress" | "resolved" | "closed";
export type MaintenancePriority = "low" | "medium" | "high" | "critical";
export type AlertSeverity = "info" | "warning" | "critical";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrgRole;
  created_at: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
}

export interface OrganizationProduct {
  id: string;
  organization_id: string;
  product_id: string;
  status: EntitlementStatus;
  trial_ends_at: string | null;
  created_at: string;
}

export interface Station {
  id: string;
  organization_id: string;
  name: string;
  city: string;
  address: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Tank {
  id: string;
  station_id: string;
  label: string;
  fuel_type: FuelType;
  capacity_liters: number;
  current_volume_liters: number;
}

export interface Pump {
  id: string;
  station_id: string;
  label: string;
}

export interface Nozzle {
  id: string;
  pump_id: string;
  tank_id: string;
  label: string;
  fuel_type: FuelType;
  last_index_liters: number;
}

export interface Shift {
  id: string;
  station_id: string;
  opened_by: string;
  closed_by: string | null;
  status: ShiftStatus;
  opened_at: string;
  closed_at: string | null;
  notes: string | null;
}
