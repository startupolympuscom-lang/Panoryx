import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { SetFuelPriceTrendForm } from "@/components/app/panostation/set-fuel-price-trend-form";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatNumberFr, formatDateTimeFr } from "@/lib/utils";

export const metadata: Metadata = { title: "PanoStation — Veille des prix" };

const trendLabels: Record<string, { label: string; icon: typeof TrendingUp; className: string }> = {
  rising: { label: "Hausse probable", icon: TrendingUp, className: "bg-red-50 text-action-coral" },
  falling: { label: "Baisse probable", icon: TrendingDown, className: "bg-emerald-50 text-emerald-700" },
  stable: { label: "Stable", icon: Minus, className: "bg-navy-50 text-navy-600" },
};

export default async function VeillePrixPage() {
  const user = await getCurrentUser();
  const org = await getCurrentOrg();
  if (!user || !org) redirect("/app/onboarding");

  const supabase = await createClient();
  const { data: stations } = await supabase
    .from("stations")
    .select("id, name")
    .eq("organization_id", org.organizationId);

  const stationIds = (stations ?? []).map((s) => s.id);
  const stationNameById = new Map((stations ?? []).map((s) => [s.id, s.name] as const));

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const [{ data: tanks }, { data: recentSales }, { data: trendHistory }] = stationIds.length
    ? await Promise.all([
        supabase
          .from("tanks")
          .select("id, station_id, label, fuel_type, current_volume_liters")
          .in("station_id", stationIds)
          .order("label"),
        supabase
          .from("fuel_sales")
          .select("station_id, fuel_type, liters")
          .in("station_id", stationIds)
          .gte("sold_at", fourteenDaysAgo.toISOString()),
        supabase
          .from("fuel_price_trend_settings")
          .select("id, trend, note, set_at, profiles(full_name)")
          .eq("organization_id", org.organizationId)
          .order("set_at", { ascending: false })
          .limit(10),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }];

  const consumptionByKey = new Map<string, number>();
  for (const s of recentSales ?? []) {
    const key = `${s.station_id}:${s.fuel_type}`;
    consumptionByKey.set(key, (consumptionByKey.get(key) ?? 0) + Number(s.liters));
  }

  const currentTrend = trendHistory?.[0]?.trend ?? "stable";
  const trendMeta = trendLabels[currentTrend];
  const TrendIcon = trendMeta.icon;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Veille des prix mondiaux</h1>
        <p className="mt-1 text-sm text-navy-500">
          Tendance des prix carburant et recommandation d&apos;achat croisée avec l&apos;autonomie de
          stock actuelle.
        </p>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Cette page ne se connecte à aucune source d&apos;actualité ou de cours du pétrole en direct : la
        tendance est saisie manuellement par le gérant ou le comptable en fonction de ce qu&apos;ils
        observent (cours du Brent, actualité, taux de change). La recommandation ci-dessous est une{" "}
        <strong>indication</strong>, pas une garantie — la décision finale d&apos;achat reste humaine.
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <div className="flex items-center gap-2">
          <span className={`flex h-9 w-9 items-center justify-center rounded-md ${trendMeta.className}`}>
            <TrendIcon size={18} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-navy">Tendance actuelle : {trendMeta.label}</p>
            {trendHistory?.[0] ? (
              <p className="text-xs text-navy-500">
                Définie le {formatDateTimeFr(trendHistory[0].set_at)}
                {trendHistory[0].note ? ` · ${trendHistory[0].note}` : ""}
              </p>
            ) : null}
          </div>
        </div>
        <div className="mt-4">
          <SetFuelPriceTrendForm organizationId={org.organizationId} userId={user.id} />
        </div>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Autonomie de stock et recommandation</h2>
        {!tanks || tanks.length === 0 ? (
          <p className="mt-4 text-sm text-navy-500">Aucune cuve enregistrée.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-xs uppercase tracking-wide text-navy-500">
                  <th className="pb-2 font-semibold">Cuve</th>
                  <th className="pb-2 font-semibold">Stock actuel</th>
                  <th className="pb-2 font-semibold">Conso. moy./jour (14j)</th>
                  <th className="pb-2 font-semibold">Autonomie</th>
                  <th className="pb-2 font-semibold">Recommandation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {tanks.map((t) => {
                  const totalConsumed = consumptionByKey.get(`${t.station_id}:${t.fuel_type}`) ?? 0;
                  const avgDaily = totalConsumed / 14;
                  const daysOfAutonomy = avgDaily > 0 ? Number(t.current_volume_liters) / avgDaily : null;

                  let recommendation = "Rythme normal";
                  let tone = "text-navy";
                  if (daysOfAutonomy != null && daysOfAutonomy < 3) {
                    recommendation = "Acheter maintenant";
                    tone = "text-action-coral";
                  } else if (currentTrend === "rising" && daysOfAutonomy != null && daysOfAutonomy < 10) {
                    recommendation = "Acheter maintenant (avant hausse)";
                    tone = "text-pulse-orange";
                  } else if (currentTrend === "falling") {
                    recommendation = "Attendre si possible";
                    tone = "text-signal-cyan";
                  }

                  return (
                    <tr key={t.id}>
                      <td className="py-2.5 font-medium text-navy">
                        {t.label} — {stationNameById.get(t.station_id)}
                      </td>
                      <td className="py-2.5 text-navy-700">
                        {formatNumberFr(Number(t.current_volume_liters))} L
                      </td>
                      <td className="py-2.5 text-navy-700">
                        {avgDaily > 0 ? `${formatNumberFr(avgDaily)} L` : "—"}
                      </td>
                      <td className="py-2.5 text-navy-700">
                        {daysOfAutonomy != null ? `${formatNumberFr(daysOfAutonomy, 1)} jours` : "—"}
                      </td>
                      <td className={`py-2.5 font-semibold ${tone}`}>{recommendation}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Historique des tendances</h2>
        {!trendHistory || trendHistory.length === 0 ? (
          <p className="mt-4 text-sm text-navy-500">Aucune tendance enregistrée.</p>
        ) : (
          <ul className="mt-4 divide-y divide-navy-100">
            {trendHistory.map((h) => {
              const meta = trendLabels[h.trend];
              const authorName = Array.isArray(h.profiles)
                ? h.profiles[0]?.full_name
                : (h.profiles as { full_name: string } | null)?.full_name;
              return (
                <li key={h.id} className="py-2.5 text-sm">
                  <p className="font-medium text-navy">{meta.label}</p>
                  <p className="text-xs text-navy-500">
                    {formatDateTimeFr(h.set_at)} · {authorName ?? "—"}
                    {h.note ? ` · ${h.note}` : ""}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
