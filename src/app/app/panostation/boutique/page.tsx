import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { AddShopProductForm } from "@/components/app/panostation/add-shop-product-form";
import { RecordShopSaleForm } from "@/components/app/panostation/record-shop-sale-form";
import { KpiCard } from "@/components/app/panostation/kpi-card";
import { Package, TrendingUp, Percent } from "lucide-react";
import { formatMAD, formatNumberFr, formatDateTimeFr } from "@/lib/utils";

export const metadata: Metadata = { title: "PanoStation — Boutique" };

export default async function BoutiquePage() {
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

  const [{ data: products }, { data: sales }] = stationIds.length
    ? await Promise.all([
        supabase
          .from("shop_products")
          .select("id, station_id, name, cost_price, retail_price, stock_quantity")
          .in("station_id", stationIds)
          .eq("category", "boutique")
          .order("name"),
        supabase
          .from("shop_sales")
          .select("id, station_id, quantity, unit_price, total_amount, total_profit, sold_at, shop_products!inner(name, category)")
          .in("station_id", stationIds)
          .eq("shop_products.category", "boutique")
          .order("sold_at", { ascending: false })
          .limit(20),
      ])
    : [{ data: [] }, { data: [] }];

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { data: monthSales } = stationIds.length
    ? await supabase
        .from("shop_sales")
        .select("total_amount, total_profit, shop_products!inner(category)")
        .in("station_id", stationIds)
        .eq("shop_products.category", "boutique")
        .gte("sold_at", thirtyDaysAgo.toISOString())
    : { data: [] };

  const profitLast30Days = (monthSales ?? []).reduce((sum, s) => sum + Number(s.total_profit), 0);
  const turnoverLast30Days = (monthSales ?? []).reduce((sum, s) => sum + Number(s.total_amount), 0);

  const margins = (products ?? []).map(
    (p) => ((Number(p.retail_price) - Number(p.cost_price)) / Number(p.retail_price)) * 100
  );
  const averageMargin = margins.length ? margins.reduce((a, b) => a + b, 0) / margins.length : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Boutique</h1>
        <p className="mt-1 text-sm text-navy-500">
          Gérez le catalogue de votre supérette et suivez sa marge, en complément des ventes de carburant.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Produits au catalogue" value={String(products?.length ?? 0)} icon={Package} />
        <KpiCard label="Marge moyenne" value={`${formatNumberFr(averageMargin, 1)} %`} icon={Percent} />
        <KpiCard
          label="Profit boutique (30 jours)"
          value={formatMAD(profitLast30Days)}
          icon={TrendingUp}
          tone="positive"
          hint={`Chiffre d'affaires : ${formatMAD(turnoverLast30Days)}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-navy-100 bg-white p-5">
          <h2 className="text-sm font-semibold text-navy">Ajouter un produit</h2>
          <div className="mt-4">
            <AddShopProductForm stations={stations ?? []} />
          </div>
        </div>

        <div className="rounded-lg border border-navy-100 bg-white p-5">
          <h2 className="text-sm font-semibold text-navy">Enregistrer une vente</h2>
          <div className="mt-4">
            <RecordShopSaleForm
              userId={user.id}
              stations={stations ?? []}
              products={(products ?? []).map((p) => ({
                id: p.id,
                stationId: p.station_id,
                name: p.name,
                retailPrice: Number(p.retail_price),
              }))}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Catalogue ({products?.length ?? 0})</h2>
        {!products || products.length === 0 ? (
          <p className="mt-4 text-sm text-navy-500">Aucun produit enregistré.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-xs uppercase tracking-wide text-navy-500">
                  <th className="pb-2 font-semibold">Produit</th>
                  <th className="pb-2 font-semibold">Station</th>
                  <th className="pb-2 font-semibold">Prix d&apos;achat</th>
                  <th className="pb-2 font-semibold">Prix de vente</th>
                  <th className="pb-2 font-semibold">Marge unitaire</th>
                  <th className="pb-2 font-semibold">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {products.map((p) => {
                  const cost = Number(p.cost_price);
                  const retail = Number(p.retail_price);
                  const profit = retail - cost;
                  const marginPct = retail > 0 ? (profit / retail) * 100 : 0;
                  return (
                    <tr key={p.id}>
                      <td className="py-2.5 font-medium text-navy">{p.name}</td>
                      <td className="py-2.5 text-navy-700">{stationNameById.get(p.station_id)}</td>
                      <td className="py-2.5 text-navy-700">{formatMAD(cost)}</td>
                      <td className="py-2.5 text-navy-700">{formatMAD(retail)}</td>
                      <td className="py-2.5 text-signal-cyan font-medium">
                        {formatMAD(profit)} ({formatNumberFr(marginPct, 0)} %)
                      </td>
                      <td className="py-2.5 text-navy-700">{formatNumberFr(Number(p.stock_quantity))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Ventes récentes</h2>
        {!sales || sales.length === 0 ? (
          <p className="mt-4 text-sm text-navy-500">Aucune vente enregistrée.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-xs uppercase tracking-wide text-navy-500">
                  <th className="pb-2 font-semibold">Date</th>
                  <th className="pb-2 font-semibold">Produit</th>
                  <th className="pb-2 font-semibold">Quantité</th>
                  <th className="pb-2 font-semibold">Montant</th>
                  <th className="pb-2 font-semibold">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {sales.map((s) => {
                  const productName = Array.isArray(s.shop_products)
                    ? s.shop_products[0]?.name
                    : (s.shop_products as { name: string } | null)?.name;
                  return (
                    <tr key={s.id}>
                      <td className="py-2.5 text-navy-700">{formatDateTimeFr(s.sold_at)}</td>
                      <td className="py-2.5 font-medium text-navy">{productName}</td>
                      <td className="py-2.5 text-navy-700">{formatNumberFr(Number(s.quantity))}</td>
                      <td className="py-2.5 text-navy-700">{formatMAD(Number(s.total_amount))}</td>
                      <td className="py-2.5 text-signal-cyan font-medium">
                        {formatMAD(Number(s.total_profit))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
