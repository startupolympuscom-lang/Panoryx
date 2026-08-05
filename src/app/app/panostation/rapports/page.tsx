import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatMAD, formatNumberFr } from "@/lib/utils";
import { fuelTypeLabels } from "@/components/app/panostation/nav-items";

export const metadata: Metadata = { title: "PanoStation — Rapports" };

function startOfDay(daysAgo = 0) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return d;
}

export default async function RapportsPage() {
  const org = await getCurrentOrg();
  if (!org) redirect("/app/onboarding");

  const supabase = await createClient();
  const { data: stations } = await supabase
    .from("stations")
    .select("id, name")
    .eq("organization_id", org.organizationId)
    .order("name");

  const stationIds = (stations ?? []).map((s) => s.id);
  const stationNameById = new Map((stations ?? []).map((s) => [s.id, s.name] as const));

  const thirtyDaysAgo = startOfDay(29);

  const [{ data: sales }, { data: shopSales }] = stationIds.length
    ? await Promise.all([
        supabase
          .from("fuel_sales")
          .select("station_id, fuel_type, liters, total_amount, sold_at")
          .in("station_id", stationIds)
          .gte("sold_at", thirtyDaysAgo.toISOString()),
        supabase
          .from("shop_sales")
          .select("station_id, total_amount, sold_at")
          .in("station_id", stationIds)
          .gte("sold_at", thirtyDaysAgo.toISOString()),
      ])
    : [{ data: [] }, { data: [] }];

  // Turnover by period: fuel + boutique revenue combined, bucketed from the
  // same 30-day fetch rather than re-querying per period.
  const todayStart = startOfDay(0);
  const weekStart = startOfDay(6);
  const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);

  function turnoverSince(since: Date) {
    const fuelSum = (sales ?? [])
      .filter((s) => new Date(s.sold_at) >= since)
      .reduce((sum, s) => sum + Number(s.total_amount), 0);
    const shopSum = (shopSales ?? [])
      .filter((s) => new Date(s.sold_at) >= since)
      .reduce((sum, s) => sum + Number(s.total_amount), 0);
    return fuelSum + shopSum;
  }

  const periods = [
    { label: "Aujourd'hui", value: turnoverSince(todayStart) },
    { label: "Cette semaine (7 j)", value: turnoverSince(weekStart) },
    { label: "Ce mois-ci", value: turnoverSince(monthStart) },
    { label: "30 derniers jours", value: turnoverSince(thirtyDaysAgo) },
  ];

  const byFuel = new Map<string, { liters: number; amount: number }>();
  const byStation = new Map<string, { liters: number; amount: number }>();
  let totalAmount = 0;
  let totalLiters = 0;

  for (const s of sales ?? []) {
    totalAmount += Number(s.total_amount);
    totalLiters += Number(s.liters);

    const fuelEntry = byFuel.get(s.fuel_type) ?? { liters: 0, amount: 0 };
    fuelEntry.liters += Number(s.liters);
    fuelEntry.amount += Number(s.total_amount);
    byFuel.set(s.fuel_type, fuelEntry);

    const stationEntry = byStation.get(s.station_id) ?? { liters: 0, amount: 0 };
    stationEntry.liters += Number(s.liters);
    stationEntry.amount += Number(s.total_amount);
    byStation.set(s.station_id, stationEntry);
  }

  const shopTurnoverByStation = new Map<string, number>();
  for (const s of shopSales ?? []) {
    shopTurnoverByStation.set(
      s.station_id,
      (shopTurnoverByStation.get(s.station_id) ?? 0) + Number(s.total_amount)
    );
  }
  const shopTurnover30Days = Array.from(shopTurnoverByStation.values()).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Rapports</h1>
        <p className="mt-1 text-sm text-navy-500">
          Chiffre d&apos;affaires (carburant + boutique) et synthèse des ventes sur les 30 derniers jours.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {periods.map((p) => (
          <div key={p.label} className="rounded-lg border border-navy-100 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">{p.label}</p>
            <p className="mt-2 text-2xl font-bold text-navy">{formatMAD(p.value)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-navy-100 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
            Chiffre d&apos;affaires carburant (30 j)
          </p>
          <p className="mt-2 text-2xl font-bold text-navy">{formatMAD(totalAmount)}</p>
        </div>
        <div className="rounded-lg border border-navy-100 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
            Volume vendu (30 j)
          </p>
          <p className="mt-2 text-2xl font-bold text-navy">{formatNumberFr(totalLiters)} L</p>
        </div>
        <div className="rounded-lg border border-navy-100 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
            Chiffre d&apos;affaires boutique (30 j)
          </p>
          <p className="mt-2 text-2xl font-bold text-navy">{formatMAD(shopTurnover30Days)}</p>
        </div>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Ventes par type de carburant</h2>
        {byFuel.size === 0 ? (
          <p className="mt-4 text-sm text-navy-500">Aucune donnée sur cette période.</p>
        ) : (
          <table className="mt-4 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-navy-100 text-xs uppercase tracking-wide text-navy-500">
                <th className="pb-2 font-semibold">Carburant</th>
                <th className="pb-2 font-semibold">Volume</th>
                <th className="pb-2 font-semibold">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {Array.from(byFuel.entries()).map(([fuelType, v]) => (
                <tr key={fuelType}>
                  <td className="py-2.5 font-medium text-navy">{fuelTypeLabels[fuelType]}</td>
                  <td className="py-2.5 text-navy-700">{formatNumberFr(v.liters)} L</td>
                  <td className="py-2.5 text-navy-700">{formatMAD(v.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Ventes par station</h2>
        {byStation.size === 0 ? (
          <p className="mt-4 text-sm text-navy-500">Aucune donnée sur cette période.</p>
        ) : (
          <table className="mt-4 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-navy-100 text-xs uppercase tracking-wide text-navy-500">
                <th className="pb-2 font-semibold">Station</th>
                <th className="pb-2 font-semibold">Volume</th>
                <th className="pb-2 font-semibold">Carburant</th>
                <th className="pb-2 font-semibold">Boutique</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {Array.from(byStation.entries()).map(([stationId, v]) => (
                <tr key={stationId}>
                  <td className="py-2.5 font-medium text-navy">{stationNameById.get(stationId)}</td>
                  <td className="py-2.5 text-navy-700">{formatNumberFr(v.liters)} L</td>
                  <td className="py-2.5 text-navy-700">{formatMAD(v.amount)}</td>
                  <td className="py-2.5 text-navy-700">
                    {formatMAD(shopTurnoverByStation.get(stationId) ?? 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
