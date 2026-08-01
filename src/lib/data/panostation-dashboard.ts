import { createClient } from "@/lib/supabase/server";
import type { FuelType } from "@/lib/supabase/types";

export interface DashboardStation {
  id: string;
  name: string;
  city: string;
}

export interface TankSummary {
  id: string;
  stationId: string;
  stationName: string;
  label: string;
  fuelType: FuelType;
  capacityLiters: number;
  currentVolumeLiters: number;
  lowLevelThresholdLiters: number;
  isLow: boolean;
}

export interface SalesTrendPoint {
  date: string;
  totalAmount: number;
}

export interface FuelMixPoint {
  fuelType: FuelType;
  liters: number;
}

export interface StationComparisonRow {
  stationId: string;
  stationName: string;
  totalAmount: number;
  liters: number;
}

export interface ActivityItem {
  id: string;
  type: "sale" | "shift_open" | "shift_close" | "delivery" | "incident";
  label: string;
  timestamp: string;
}

export interface AlertItem {
  id: string;
  severity: "info" | "warning" | "critical";
  message: string;
  stationName?: string;
}

export interface DashboardData {
  stations: DashboardStation[];
  totalSalesToday: number;
  totalLitersToday: number;
  grossMarginToday: number | null;
  cashVarianceToday: number;
  openShiftsCount: number;
  pendingDeliveriesCount: number;
  openIncidentsCount: number;
  tanks: TankSummary[];
  salesTrend: SalesTrendPoint[];
  fuelMix: FuelMixPoint[];
  stationComparison: StationComparisonRow[];
  recentActivity: ActivityItem[];
  alerts: AlertItem[];
}

function startOfDayIso(daysAgo = 0) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

export async function getDashboardData(
  organizationId: string,
  stationFilter?: string
): Promise<DashboardData> {
  const supabase = await createClient();

  const { data: allStations } = await supabase
    .from("stations")
    .select("id, name, city")
    .eq("organization_id", organizationId)
    .order("name");

  const stations: DashboardStation[] = allStations ?? [];
  const stationIds = stationFilter ? [stationFilter] : stations.map((s) => s.id);

  if (stationIds.length === 0) {
    return {
      stations,
      totalSalesToday: 0,
      totalLitersToday: 0,
      grossMarginToday: null,
      cashVarianceToday: 0,
      openShiftsCount: 0,
      pendingDeliveriesCount: 0,
      openIncidentsCount: 0,
      tanks: [],
      salesTrend: [],
      fuelMix: [],
      stationComparison: [],
      recentActivity: [],
      alerts: [],
    };
  }

  const todayStart = startOfDayIso(0);
  const weekStart = startOfDayIso(6);

  const [
    { data: salesToday },
    { data: salesWeek },
    { data: tanksRaw },
    { data: openShifts },
    { data: pendingPOs },
    { data: openTickets },
    { data: cashToday },
    { data: recentSales },
    { data: recentShifts },
    { data: recentDeliveries },
    { data: recentTickets },
    { data: storedAlerts },
  ] = await Promise.all([
    supabase
      .from("fuel_sales")
      .select("total_amount, liters, fuel_type, station_id")
      .in("station_id", stationIds)
      .gte("sold_at", todayStart),
    supabase
      .from("fuel_sales")
      .select("total_amount, liters, fuel_type, station_id, sold_at")
      .in("station_id", stationIds)
      .gte("sold_at", weekStart),
    supabase
      .from("tanks")
      .select("id, station_id, label, fuel_type, capacity_liters, current_volume_liters, low_level_threshold_liters")
      .in("station_id", stationIds),
    supabase.from("shifts").select("id, station_id").in("station_id", stationIds).eq("status", "open"),
    supabase
      .from("purchase_orders")
      .select("id")
      .eq("organization_id", organizationId)
      .in("station_id", stationIds)
      .eq("status", "ordered"),
    supabase
      .from("maintenance_tickets")
      .select("id")
      .eq("organization_id", organizationId)
      .in("station_id", stationIds)
      .in("status", ["open", "in_progress"]),
    supabase
      .from("cash_reconciliations")
      .select("difference, station_id")
      .in("station_id", stationIds)
      .gte("created_at", todayStart),
    supabase
      .from("fuel_sales")
      .select("id, sold_at, liters, fuel_type, station_id")
      .in("station_id", stationIds)
      .order("sold_at", { ascending: false })
      .limit(5),
    supabase
      .from("shifts")
      .select("id, opened_at, closed_at, status, station_id")
      .in("station_id", stationIds)
      .order("opened_at", { ascending: false })
      .limit(5),
    supabase
      .from("fuel_deliveries")
      .select("id, delivered_at, liters, station_id")
      .in("station_id", stationIds)
      .order("delivered_at", { ascending: false })
      .limit(5),
    supabase
      .from("maintenance_tickets")
      .select("id, created_at, title, station_id")
      .in("station_id", stationIds)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("operational_alerts")
      .select("id, severity, message, station_id")
      .eq("organization_id", organizationId)
      .eq("is_resolved", false)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const stationNameById = new Map(stations.map((s) => [s.id, s.name] as const));

  const totalSalesToday = (salesToday ?? []).reduce((sum, s) => sum + Number(s.total_amount), 0);
  const totalLitersToday = (salesToday ?? []).reduce((sum, s) => sum + Number(s.liters), 0);
  const cashVarianceToday = (cashToday ?? []).reduce((sum, c) => sum + Number(c.difference), 0);

  const tanks: TankSummary[] = (tanksRaw ?? []).map((t) => ({
    id: t.id,
    stationId: t.station_id,
    stationName: stationNameById.get(t.station_id) ?? "",
    label: t.label,
    fuelType: t.fuel_type,
    capacityLiters: Number(t.capacity_liters),
    currentVolumeLiters: Number(t.current_volume_liters),
    lowLevelThresholdLiters: Number(t.low_level_threshold_liters),
    isLow: Number(t.current_volume_liters) <= Number(t.low_level_threshold_liters),
  }));

  // Gross margin: best-effort estimate using the most recent delivery cost
  // per (station, fuel_type); stations/fuels with no delivery cost on file
  // are simply excluded rather than guessed at.
  const { data: costRows } = await supabase
    .from("fuel_deliveries")
    .select("station_id, tank_id, unit_cost, delivered_at, tanks!inner(fuel_type)")
    .in("station_id", stationIds)
    .not("unit_cost", "is", null)
    .order("delivered_at", { ascending: false });

  const costByKey = new Map<string, number>();
  for (const row of costRows ?? []) {
    const fuelType = Array.isArray(row.tanks) ? row.tanks[0]?.fuel_type : (row.tanks as { fuel_type: string } | null)?.fuel_type;
    if (!fuelType) continue;
    const key = `${row.station_id}:${fuelType}`;
    if (!costByKey.has(key)) costByKey.set(key, Number(row.unit_cost));
  }

  let grossMarginToday: number | null = null;
  if (costByKey.size > 0) {
    let margin = 0;
    let matched = false;
    for (const s of salesToday ?? []) {
      const key = `${s.station_id}:${s.fuel_type}`;
      const cost = costByKey.get(key);
      if (cost !== undefined) {
        margin += Number(s.total_amount) - cost * Number(s.liters);
        matched = true;
      }
    }
    grossMarginToday = matched ? margin : null;
  }

  // Sales trend: last 7 days, summed by calendar day
  const trendMap = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    trendMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const s of salesWeek ?? []) {
    const day = String(s.sold_at).slice(0, 10);
    if (trendMap.has(day)) {
      trendMap.set(day, (trendMap.get(day) ?? 0) + Number(s.total_amount));
    }
  }
  const salesTrend: SalesTrendPoint[] = Array.from(trendMap.entries()).map(([date, totalAmount]) => ({
    date,
    totalAmount,
  }));

  // Fuel mix over the last 7 days
  const mixMap = new Map<FuelType, number>();
  for (const s of salesWeek ?? []) {
    mixMap.set(s.fuel_type as FuelType, (mixMap.get(s.fuel_type as FuelType) ?? 0) + Number(s.liters));
  }
  const fuelMix: FuelMixPoint[] = Array.from(mixMap.entries()).map(([fuelType, liters]) => ({
    fuelType,
    liters,
  }));

  // Station comparison (today), always across all org stations regardless
  // of the selected filter, so the table stays useful even when a single
  // station is selected.
  const { data: allSalesToday } = await supabase
    .from("fuel_sales")
    .select("total_amount, liters, station_id")
    .in(
      "station_id",
      stations.map((s) => s.id)
    )
    .gte("sold_at", todayStart);

  const comparisonMap = new Map<string, { totalAmount: number; liters: number }>();
  for (const s of allSalesToday ?? []) {
    const entry = comparisonMap.get(s.station_id) ?? { totalAmount: 0, liters: 0 };
    entry.totalAmount += Number(s.total_amount);
    entry.liters += Number(s.liters);
    comparisonMap.set(s.station_id, entry);
  }
  const stationComparison: StationComparisonRow[] = stations.map((s) => ({
    stationId: s.id,
    stationName: s.name,
    totalAmount: comparisonMap.get(s.id)?.totalAmount ?? 0,
    liters: comparisonMap.get(s.id)?.liters ?? 0,
  }));

  const recentActivity: ActivityItem[] = [
    ...(recentSales ?? []).map((s) => ({
      id: `sale-${s.id}`,
      type: "sale" as const,
      label: `Vente ${s.fuel_type} — ${Number(s.liters).toFixed(0)} L — ${stationNameById.get(s.station_id) ?? ""}`,
      timestamp: s.sold_at,
    })),
    ...(recentShifts ?? []).map((sh) => ({
      id: `shift-${sh.id}`,
      type: (sh.status === "open" ? "shift_open" : "shift_close") as "shift_open" | "shift_close",
      label: `Quart ${sh.status === "open" ? "ouvert" : "clôturé"} — ${stationNameById.get(sh.station_id) ?? ""}`,
      timestamp: sh.closed_at ?? sh.opened_at,
    })),
    ...(recentDeliveries ?? []).map((d) => ({
      id: `delivery-${d.id}`,
      type: "delivery" as const,
      label: `Livraison de ${Number(d.liters).toFixed(0)} L — ${stationNameById.get(d.station_id) ?? ""}`,
      timestamp: d.delivered_at,
    })),
    ...(recentTickets ?? []).map((t) => ({
      id: `ticket-${t.id}`,
      type: "incident" as const,
      label: `Incident : ${t.title} — ${stationNameById.get(t.station_id) ?? ""}`,
      timestamp: t.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);

  const lowStockAlerts: AlertItem[] = tanks
    .filter((t) => t.isLow)
    .map((t) => ({
      id: `low-${t.id}`,
      severity: "warning" as const,
      message: `Stock bas — ${t.label} (${t.stationName})`,
      stationName: t.stationName,
    }));

  const alerts: AlertItem[] = [
    ...lowStockAlerts,
    ...(storedAlerts ?? []).map((a) => ({
      id: a.id,
      severity: a.severity as AlertItem["severity"],
      message: a.message,
      stationName: a.station_id ? stationNameById.get(a.station_id) : undefined,
    })),
  ];

  return {
    stations,
    totalSalesToday,
    totalLitersToday,
    grossMarginToday,
    cashVarianceToday,
    openShiftsCount: openShifts?.length ?? 0,
    pendingDeliveriesCount: pendingPOs?.length ?? 0,
    openIncidentsCount: openTickets?.length ?? 0,
    tanks,
    salesTrend,
    fuelMix,
    stationComparison,
    recentActivity,
    alerts,
  };
}
