import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { AddDeliveryDriverForm } from "@/components/app/panostation/add-delivery-driver-form";
import { formatNumberFr, formatDateFr } from "@/lib/utils";

export const metadata: Metadata = { title: "PanoStation — Livreurs" };

export default async function LivreursPage() {
  const org = await getCurrentOrg();
  if (!org) redirect("/app/onboarding");

  const supabase = await createClient();
  const [{ data: stations }, { data: suppliers }, { data: drivers }] = await Promise.all([
    supabase.from("stations").select("id, name").eq("organization_id", org.organizationId),
    supabase.from("suppliers").select("id, name").eq("organization_id", org.organizationId).order("name"),
    supabase
      .from("delivery_drivers")
      .select("id, full_name, phone, supplier_id, suppliers(name)")
      .eq("organization_id", org.organizationId)
      .order("full_name"),
  ]);

  const stationIds = (stations ?? []).map((s) => s.id);
  const driverIds = (drivers ?? []).map((d) => d.id);

  const { data: deliveries } =
    stationIds.length && driverIds.length
      ? await supabase
          .from("fuel_deliveries")
          .select("id, driver_id, station_id, delivered_at, ordered_quantity, liters, tanks!inner(label)")
          .in("station_id", stationIds)
          .in("driver_id", driverIds)
          .order("delivered_at", { ascending: false })
      : { data: [] };

  const stationNameById = new Map((stations ?? []).map((s) => [s.id, s.name] as const));

  type DeliveryRow = NonNullable<typeof deliveries>[number];

  const statsByDriver = new Map<
    string,
    { passages: number; comparable: number; totalVariancePct: number; shortfalls: number }
  >();
  const deliveriesByDriver = new Map<string, DeliveryRow[]>();

  for (const d of deliveries ?? []) {
    if (!d.driver_id) continue;
    const list = deliveriesByDriver.get(d.driver_id) ?? [];
    list.push(d);
    deliveriesByDriver.set(d.driver_id, list);

    const stats = statsByDriver.get(d.driver_id) ?? {
      passages: 0,
      comparable: 0,
      totalVariancePct: 0,
      shortfalls: 0,
    };
    stats.passages += 1;
    if (d.ordered_quantity != null && Number(d.ordered_quantity) > 0) {
      const ordered = Number(d.ordered_quantity);
      const variancePct = ((Number(d.liters) - ordered) / ordered) * 100;
      stats.comparable += 1;
      stats.totalVariancePct += variancePct;
      if (variancePct < -0.5) stats.shortfalls += 1;
    }
    statsByDriver.set(d.driver_id, stats);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Livreurs</h1>
        <p className="mt-1 text-sm text-navy-500">
          Historique des passages par chauffeur et écarts entre quantité commandée et livrée.
        </p>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Ajouter un chauffeur</h2>
        <div className="mt-4">
          <AddDeliveryDriverForm organizationId={org.organizationId} suppliers={suppliers ?? []} />
        </div>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Fiabilité par chauffeur</h2>
        {!drivers || drivers.length === 0 ? (
          <p className="mt-4 text-sm text-navy-500">Aucun chauffeur enregistré.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {drivers.map((d) => {
              const supplierName = Array.isArray(d.suppliers)
                ? d.suppliers[0]?.name
                : (d.suppliers as { name: string } | null)?.name;
              const stats = statsByDriver.get(d.id);
              const avgVariancePct = stats && stats.comparable > 0 ? stats.totalVariancePct / stats.comparable : null;
              const driverDeliveries = deliveriesByDriver.get(d.id) ?? [];

              return (
                <details key={d.id} className="rounded-md border border-navy-100 p-3.5">
                  <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-medium text-navy">
                      {d.full_name}
                      {supplierName ? <span className="font-normal text-navy-500"> — {supplierName}</span> : null}
                    </span>
                    <span className="flex items-center gap-3 text-xs">
                      <span className="text-navy-500">{stats?.passages ?? 0} passage(s)</span>
                      {avgVariancePct != null ? (
                        <span
                          className={`rounded-full px-2.5 py-1 font-semibold ${
                            avgVariancePct < -1
                              ? "bg-red-50 text-action-coral"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {avgVariancePct < -1 ? "À surveiller" : "Fiable"} ({avgVariancePct > 0 ? "+" : ""}
                          {formatNumberFr(avgVariancePct, 1)} %)
                        </span>
                      ) : (
                        <span className="text-navy-400">Pas assez de données</span>
                      )}
                    </span>
                  </summary>
                  {driverDeliveries.length > 0 ? (
                    <ul className="mt-3 divide-y divide-navy-100 border-t border-navy-100 pt-2">
                      {driverDeliveries.map((del) => {
                        const tankLabel = Array.isArray(del.tanks)
                          ? del.tanks[0]?.label
                          : (del.tanks as { label: string } | null)?.label;
                        return (
                          <li key={del.id} className="flex items-center justify-between py-1.5 text-xs">
                            <span className="text-navy-600">
                              {formatDateFr(del.delivered_at)} · {stationNameById.get(del.station_id)} · {tankLabel}
                            </span>
                            <span className="font-medium text-navy">
                              {del.ordered_quantity != null ? `${formatNumberFr(Number(del.ordered_quantity))} / ` : ""}
                              {formatNumberFr(Number(del.liters))} L
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </details>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
