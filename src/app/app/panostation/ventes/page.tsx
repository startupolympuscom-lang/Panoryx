import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { RecordSaleForm } from "@/components/app/panostation/record-sale-form";
import { fuelTypeLabels } from "@/components/app/panostation/nav-items";
import { formatMAD, formatNumberFr, formatDateTimeFr } from "@/lib/utils";

export const metadata: Metadata = { title: "PanoStation — Ventes" };

export default async function VentesPage() {
  const user = await getCurrentUser();
  const org = await getCurrentOrg();
  if (!user || !org) redirect("/app/onboarding");

  const supabase = await createClient();
  const { data: stations } = await supabase
    .from("stations")
    .select("id, name")
    .eq("organization_id", org.organizationId)
    .order("name");

  const stationIds = (stations ?? []).map((s) => s.id);
  const stationNameById = new Map((stations ?? []).map((s) => [s.id, s.name] as const));

  const { data: openShifts } = stationIds.length
    ? await supabase.from("shifts").select("id, station_id").in("station_id", stationIds).eq("status", "open")
    : { data: [] };

  const { data: nozzles } = stationIds.length
    ? await supabase.from("nozzles").select("id, station_id, label, fuel_type").in("station_id", stationIds)
    : { data: [] };

  const { data: recentSales } = stationIds.length
    ? await supabase
        .from("fuel_sales")
        .select("id, station_id, fuel_type, liters, unit_price, total_amount, payment_method, sold_at")
        .in("station_id", stationIds)
        .order("sold_at", { ascending: false })
        .limit(20)
    : { data: [] };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Ventes</h1>
        <p className="mt-1 text-sm text-navy-500">Enregistrez les ventes carburant du quart en cours.</p>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Nouvelle vente</h2>
        <div className="mt-4">
          <RecordSaleForm
            userId={user.id}
            openShifts={(openShifts ?? []).map((s) => ({
              id: s.id,
              stationId: s.station_id,
              stationName: stationNameById.get(s.station_id) ?? "",
            }))}
            nozzles={(nozzles ?? []).map((n) => ({
              id: n.id,
              label: n.label,
              fuelType: n.fuel_type,
              stationId: n.station_id,
            }))}
          />
        </div>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Ventes récentes</h2>
        {!recentSales || recentSales.length === 0 ? (
          <p className="mt-4 text-sm text-navy-500">Aucune vente enregistrée.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-xs uppercase tracking-wide text-navy-500">
                  <th className="pb-2 font-semibold">Date</th>
                  <th className="pb-2 font-semibold">Station</th>
                  <th className="pb-2 font-semibold">Carburant</th>
                  <th className="pb-2 font-semibold">Volume</th>
                  <th className="pb-2 font-semibold">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {recentSales.map((s) => (
                  <tr key={s.id}>
                    <td className="py-2.5 text-navy-700">{formatDateTimeFr(s.sold_at)}</td>
                    <td className="py-2.5 text-navy-700">{stationNameById.get(s.station_id)}</td>
                    <td className="py-2.5 text-navy-700">{fuelTypeLabels[s.fuel_type]}</td>
                    <td className="py-2.5 text-navy-700">{formatNumberFr(Number(s.liters))} L</td>
                    <td className="py-2.5 font-medium text-navy">{formatMAD(Number(s.total_amount))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
