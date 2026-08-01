import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Wallet, Fuel, TrendingUp, Scale, Clock, Truck, AlertTriangle } from "lucide-react";
import { getCurrentOrg } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/data/panostation-dashboard";
import { formatMAD, formatNumberFr } from "@/lib/utils";
import { KpiCard } from "@/components/app/panostation/kpi-card";
import { SalesTrendChart, FuelMixChart } from "@/components/app/panostation/charts";
import { ActivityFeed, AlertCenter } from "@/components/app/panostation/activity-alerts";
import { Badge } from "@/components/ui/card";
import { fuelTypeLabels } from "@/components/app/panostation/nav-items";

export const metadata: Metadata = { title: "PanoStation — Vue d'ensemble" };

export default async function PanoStationOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ station?: string }>;
}) {
  const { station } = await searchParams;
  const org = await getCurrentOrg();
  if (!org) redirect("/app/onboarding");

  const data = await getDashboardData(org.organizationId, station);

  if (data.stations.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-navy-200 bg-white p-10 text-center">
        <h1 className="text-lg font-semibold text-navy">Aucune station pour le moment</h1>
        <p className="mt-2 text-sm text-navy-500">
          Ajoutez votre première station pour commencer à suivre vos opérations.
        </p>
        <a
          href="/app/panostation/parametres"
          className="mt-5 inline-flex h-10 items-center rounded-md bg-panoryx-blue px-5 text-sm font-semibold text-white hover:bg-[#1e4cf0]"
        >
          Créer une station
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Vue d&apos;ensemble</h1>
        <p className="mt-1 text-sm text-navy-500">
          Indicateurs du jour {station ? "pour la station sélectionnée" : "sur l'ensemble du réseau"}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Ventes du jour" value={formatMAD(data.totalSalesToday)} icon={Wallet} />
        <KpiCard
          label="Volume vendu"
          value={`${formatNumberFr(data.totalLitersToday)} L`}
          icon={Fuel}
        />
        <KpiCard
          label="Marge brute estimée"
          value={data.grossMarginToday === null ? "—" : formatMAD(data.grossMarginToday)}
          icon={TrendingUp}
          hint={data.grossMarginToday === null ? "Aucun coût de livraison enregistré" : undefined}
        />
        <KpiCard
          label="Écart de caisse"
          value={formatMAD(data.cashVarianceToday)}
          icon={Scale}
          tone={data.cashVarianceToday < 0 ? "negative" : "positive"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Quarts ouverts" value={String(data.openShiftsCount)} icon={Clock} tone="warning" />
        <KpiCard
          label="Livraisons en attente"
          value={String(data.pendingDeliveriesCount)}
          icon={Truck}
        />
        <KpiCard
          label="Incidents ouverts"
          value={String(data.openIncidentsCount)}
          icon={AlertTriangle}
          tone={data.openIncidentsCount > 0 ? "negative" : "neutral"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-navy-100 bg-white p-5">
          <h2 className="text-sm font-semibold text-navy">Tendance des ventes (7 jours)</h2>
          <div className="mt-4">
            <SalesTrendChart data={data.salesTrend} />
          </div>
        </div>
        <div className="rounded-lg border border-navy-100 bg-white p-5">
          <h2 className="text-sm font-semibold text-navy">Mix carburant (7 jours)</h2>
          <div className="mt-4">
            <FuelMixChart data={data.fuelMix} />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Niveaux de cuves</h2>
        {data.tanks.length === 0 ? (
          <p className="mt-4 text-sm text-navy-500">Aucune cuve enregistrée.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.tanks.map((t) => {
              const pct = Math.min(100, Math.round((t.currentVolumeLiters / t.capacityLiters) * 100));
              return (
                <div key={t.id} className="rounded-md border border-navy-100 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-navy">{t.label}</p>
                    {t.isLow ? <Badge tone="warning">Stock bas</Badge> : null}
                  </div>
                  <p className="mt-1 text-xs text-navy-500">
                    {fuelTypeLabels[t.fuelType]} · {t.stationName}
                  </p>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-navy-100">
                    <div
                      className={`h-full rounded-full ${t.isLow ? "bg-pulse-orange" : "bg-panoryx-blue"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-navy-500">
                    {formatNumberFr(t.currentVolumeLiters)} L / {formatNumberFr(t.capacityLiters)} L
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Comparatif des stations — aujourd&apos;hui</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-navy-100 text-xs uppercase tracking-wide text-navy-500">
                <th className="pb-2 font-semibold">Station</th>
                <th className="pb-2 font-semibold">Ventes</th>
                <th className="pb-2 font-semibold">Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {data.stationComparison.map((row) => (
                <tr key={row.stationId}>
                  <td className="py-2.5 font-medium text-navy">{row.stationName}</td>
                  <td className="py-2.5 text-navy-700">{formatMAD(row.totalAmount)}</td>
                  <td className="py-2.5 text-navy-700">{formatNumberFr(row.liters)} L</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-navy-100 bg-white p-5">
          <h2 className="text-sm font-semibold text-navy">Activité récente</h2>
          <div className="mt-2">
            <ActivityFeed items={data.recentActivity} />
          </div>
        </div>
        <div className="rounded-lg border border-navy-100 bg-white p-5">
          <h2 className="text-sm font-semibold text-navy">Centre d&apos;alertes</h2>
          <div className="mt-3">
            <AlertCenter alerts={data.alerts} />
          </div>
        </div>
      </div>
    </div>
  );
}
