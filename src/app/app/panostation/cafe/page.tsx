import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { AddCafeProductForm } from "@/components/app/panostation/add-cafe-product-form";
import { AddCafeIngredientForm } from "@/components/app/panostation/add-cafe-ingredient-form";
import { CafeRecipeEditor } from "@/components/app/panostation/cafe-recipe-editor";
import { CafePosForm } from "@/components/app/panostation/cafe-pos-form";
import { RecordCafeStockCountForm } from "@/components/app/panostation/record-cafe-stock-count-form";
import { KpiCard } from "@/components/app/panostation/kpi-card";
import { Coffee, Receipt, AlertTriangle, TrendingDown } from "lucide-react";
import { formatMAD, formatNumberFr, formatDateTimeFr } from "@/lib/utils";

export const metadata: Metadata = { title: "PanoStation — Café / Restaurant" };

function startOfDay() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function CafePage() {
  const user = await getCurrentUser();
  const org = await getCurrentOrg();
  if (!user || !org) redirect("/app/onboarding");

  const supabase = await createClient();
  const { data: stations } = await supabase
    .from("stations")
    .select("id, name, city")
    .eq("organization_id", org.organizationId)
    .order("name");

  const stationIds = (stations ?? []).map((s) => s.id);
  const stationNameById = new Map((stations ?? []).map((s) => [s.id, s.name] as const));
  const todayStart = startOfDay();

  const [
    { data: products },
    { data: ingredients },
    { data: recipeItems },
    { data: todayOrders },
    { data: stockCounts },
  ] = stationIds.length
    ? await Promise.all([
        supabase
          .from("cafe_products")
          .select("id, station_id, name, category, price, is_active")
          .in("station_id", stationIds)
          .eq("is_active", true)
          .order("name"),
        supabase
          .from("cafe_ingredients")
          .select("id, station_id, name, unit, stock_quantity, cost_per_unit, low_stock_threshold")
          .in("station_id", stationIds)
          .order("name"),
        supabase
          .from("cafe_recipe_items")
          .select("id, product_id, ingredient_id, quantity_required"),
        supabase
          .from("cafe_orders")
          .select("id, station_id, total_amount, recorded_by, created_at")
          .in("station_id", stationIds)
          .eq("status", "completed")
          .gte("created_at", todayStart.toISOString())
          .order("created_at", { ascending: false }),
        supabase
          .from("cafe_stock_counts")
          .select("id, ingredient_id, station_id, theoretical_quantity, counted_quantity, variance, counted_at, cafe_ingredients!inner(name, unit)")
          .in("station_id", stationIds)
          .order("counted_at", { ascending: false })
          .limit(10),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }, { data: [] }];

  const recordedByIds = [...new Set((todayOrders ?? []).map((o) => o.recorded_by))];
  const { data: staffProfiles } =
    recordedByIds.length > 0
      ? await supabase.from("profiles").select("id, full_name").in("id", recordedByIds)
      : { data: [] };
  const staffNameById = new Map((staffProfiles ?? []).map((p) => [p.id, p.full_name ?? "—"] as const));

  const todayRevenue = (todayOrders ?? []).reduce((sum, o) => sum + Number(o.total_amount), 0);
  const lowStockIngredients = (ingredients ?? []).filter(
    (i) => i.low_stock_threshold != null && Number(i.stock_quantity) <= Number(i.low_stock_threshold)
  );
  const worstVariance = (stockCounts ?? []).reduce<number | null>((worst, c) => {
    const v = Number(c.variance);
    return worst === null || v < worst ? v : worst;
  }, null);

  const employeeBreakdown = new Map<string, { total: number; count: number }>();
  for (const o of todayOrders ?? []) {
    const entry = employeeBreakdown.get(o.recorded_by) ?? { total: 0, count: 0 };
    entry.total += Number(o.total_amount);
    entry.count += 1;
    employeeBreakdown.set(o.recorded_by, entry);
  }

  const recipeByProduct = new Map<string, { ingredientId: string; quantityRequired: number }[]>();
  for (const r of recipeItems ?? []) {
    const list = recipeByProduct.get(r.product_id) ?? [];
    list.push({ ingredientId: r.ingredient_id, quantityRequired: Number(r.quantity_required) });
    recipeByProduct.set(r.product_id, list);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Café / Restaurant</h1>
        <p className="mt-1 text-sm text-navy-500">
          Prise de commande, stock d&apos;ingrédients et écarts entre rendement théorique et stock réel.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <KpiCard label="Chiffre d'affaires du jour" value={formatMAD(todayRevenue)} icon={Coffee} tone="positive" />
        <KpiCard label="Commandes du jour" value={String(todayOrders?.length ?? 0)} icon={Receipt} />
        <KpiCard
          label="Ingrédients en stock bas"
          value={String(lowStockIngredients.length)}
          icon={AlertTriangle}
          tone={lowStockIngredients.length > 0 ? "warning" : "positive"}
        />
        <KpiCard
          label="Écart le plus important"
          value={worstVariance != null ? formatNumberFr(worstVariance, 2) : "—"}
          icon={TrendingDown}
          tone={worstVariance != null && worstVariance < 0 ? "negative" : "neutral"}
          hint="Dernier comptage vs stock théorique"
        />
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Prise de commande</h2>
        <div className="mt-4">
          <CafePosForm
            userId={user.id}
            stations={stations ?? []}
            products={(products ?? []).map((p) => ({
              id: p.id,
              stationId: p.station_id,
              name: p.name,
              category: p.category,
              price: Number(p.price),
            }))}
          />
        </div>
      </div>

      {employeeBreakdown.size > 0 ? (
        <div className="rounded-lg border border-navy-100 bg-white p-5">
          <h2 className="text-sm font-semibold text-navy">Ventes du jour par employé</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-xs uppercase tracking-wide text-navy-500">
                  <th className="pb-2 font-semibold">Employé</th>
                  <th className="pb-2 font-semibold">Commandes</th>
                  <th className="pb-2 font-semibold">Total encaissé</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {Array.from(employeeBreakdown.entries()).map(([profileId, stats]) => (
                  <tr key={profileId}>
                    <td className="py-2.5 font-medium text-navy">{staffNameById.get(profileId) ?? "—"}</td>
                    <td className="py-2.5 text-navy-700">{stats.count}</td>
                    <td className="py-2.5 text-navy-700">{formatMAD(stats.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-navy-100 bg-white p-5">
          <h2 className="text-sm font-semibold text-navy">Ajouter au menu</h2>
          <div className="mt-4">
            <AddCafeProductForm stations={stations ?? []} />
          </div>
        </div>
        <div className="rounded-lg border border-navy-100 bg-white p-5">
          <h2 className="text-sm font-semibold text-navy">Ajouter un ingrédient</h2>
          <div className="mt-4">
            <AddCafeIngredientForm stations={stations ?? []} />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Menu et recettes ({products?.length ?? 0})</h2>
        {!products || products.length === 0 ? (
          <p className="mt-4 text-sm text-navy-500">Aucun produit au menu.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {products.map((p) => {
              const stationIngredients = (ingredients ?? [])
                .filter((i) => i.station_id === p.station_id)
                .map((i) => ({ id: i.id, name: i.name, unit: i.unit }));
              return (
                <details key={p.id} className="rounded-md border border-navy-100 p-3.5">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-sm">
                    <span className="font-medium text-navy">
                      {p.name}{" "}
                      <span className="font-normal text-navy-500">
                        — {stationNameById.get(p.station_id)}
                      </span>
                    </span>
                    <span className="font-semibold text-navy">{formatMAD(Number(p.price))}</span>
                  </summary>
                  <div className="mt-3 border-t border-navy-100 pt-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy-500">
                      Recette (ingrédients consommés par unité vendue)
                    </p>
                    <CafeRecipeEditor
                      productId={p.id}
                      ingredients={stationIngredients}
                      initialItems={recipeByProduct.get(p.id) ?? []}
                    />
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Stock d&apos;ingrédients ({ingredients?.length ?? 0})</h2>
        {!ingredients || ingredients.length === 0 ? (
          <p className="mt-4 text-sm text-navy-500">Aucun ingrédient enregistré.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-xs uppercase tracking-wide text-navy-500">
                  <th className="pb-2 font-semibold">Ingrédient</th>
                  <th className="pb-2 font-semibold">Station</th>
                  <th className="pb-2 font-semibold">Stock théorique</th>
                  <th className="pb-2 font-semibold">Comptage physique</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {ingredients.map((i) => {
                  const isLow =
                    i.low_stock_threshold != null && Number(i.stock_quantity) <= Number(i.low_stock_threshold);
                  return (
                    <tr key={i.id}>
                      <td className="py-2.5 font-medium text-navy">{i.name}</td>
                      <td className="py-2.5 text-navy-700">{stationNameById.get(i.station_id)}</td>
                      <td className={`py-2.5 font-semibold ${isLow ? "text-action-coral" : "text-navy"}`}>
                        {formatNumberFr(Number(i.stock_quantity), 2)} {i.unit}
                        {isLow ? " ⚠" : ""}
                      </td>
                      <td className="py-2.5">
                        <RecordCafeStockCountForm
                          userId={user.id}
                          ingredientId={i.id}
                          stationId={i.station_id}
                          unit={i.unit}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {stockCounts && stockCounts.length > 0 ? (
        <div className="rounded-lg border border-navy-100 bg-white p-5">
          <h2 className="text-sm font-semibold text-navy">Derniers comptages</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-xs uppercase tracking-wide text-navy-500">
                  <th className="pb-2 font-semibold">Date</th>
                  <th className="pb-2 font-semibold">Ingrédient</th>
                  <th className="pb-2 font-semibold">Théorique</th>
                  <th className="pb-2 font-semibold">Compté</th>
                  <th className="pb-2 font-semibold">Écart</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {stockCounts.map((c) => {
                  const ingredient = Array.isArray(c.cafe_ingredients)
                    ? c.cafe_ingredients[0]
                    : (c.cafe_ingredients as { name: string; unit: string } | null);
                  const variance = Number(c.variance);
                  return (
                    <tr key={c.id}>
                      <td className="py-2.5 text-navy-700">{formatDateTimeFr(c.counted_at)}</td>
                      <td className="py-2.5 font-medium text-navy">{ingredient?.name}</td>
                      <td className="py-2.5 text-navy-700">
                        {formatNumberFr(Number(c.theoretical_quantity), 2)} {ingredient?.unit}
                      </td>
                      <td className="py-2.5 text-navy-700">
                        {formatNumberFr(Number(c.counted_quantity), 2)} {ingredient?.unit}
                      </td>
                      <td
                        className={`py-2.5 font-semibold ${
                          variance < 0 ? "text-action-coral" : "text-signal-cyan"
                        }`}
                      >
                        {variance > 0 ? "+" : ""}
                        {formatNumberFr(variance, 2)} {ingredient?.unit}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
