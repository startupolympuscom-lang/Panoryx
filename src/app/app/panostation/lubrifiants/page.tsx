import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { AddLubricantProductForm } from "@/components/app/panostation/add-lubricant-product-form";
import { RecordShopSaleForm } from "@/components/app/panostation/record-shop-sale-form";
import { KpiCard } from "@/components/app/panostation/kpi-card";
import { Droplet, AlertTriangle } from "lucide-react";
import { formatMAD, formatNumberFr } from "@/lib/utils";

export const metadata: Metadata = { title: "PanoStation — Lubrifiants" };

export default async function LubrifiantsPage() {
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

  const { data: products } = stationIds.length
    ? await supabase
        .from("shop_products")
        .select("id, station_id, name, reference, cost_price, retail_price, stock_quantity, photo_path")
        .in("station_id", stationIds)
        .eq("category", "lubricant")
        .order("name")
    : { data: [] };

  const withUrls = await Promise.all(
    (products ?? []).map(async (p) => {
      if (!p.photo_path) return { ...p, photoUrl: null };
      const { data } = await supabase.storage.from("station-documents").createSignedUrl(p.photo_path, 3600);
      return { ...p, photoUrl: data?.signedUrl ?? null };
    })
  );

  const lowStockCount = withUrls.filter((p) => Number(p.stock_quantity) <= 2).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Lubrifiants</h1>
        <p className="mt-1 text-sm text-navy-500">
          Catalogue de lubrifiants avec référence et photo pour une identification rapide.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KpiCard label="Articles au catalogue" value={String(withUrls.length)} icon={Droplet} />
        <KpiCard
          label="Stock bas (≤ 2)"
          value={String(lowStockCount)}
          icon={AlertTriangle}
          tone={lowStockCount > 0 ? "warning" : "positive"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-navy-100 bg-white p-5">
          <h2 className="text-sm font-semibold text-navy">Ajouter un lubrifiant</h2>
          <div className="mt-4">
            <AddLubricantProductForm stations={stations ?? []} />
          </div>
        </div>
        <div className="rounded-lg border border-navy-100 bg-white p-5">
          <h2 className="text-sm font-semibold text-navy">Enregistrer une vente</h2>
          <div className="mt-4">
            <RecordShopSaleForm
              userId={user.id}
              stations={stations ?? []}
              products={withUrls.map((p) => ({
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
        <h2 className="text-sm font-semibold text-navy">Catalogue ({withUrls.length})</h2>
        {withUrls.length === 0 ? (
          <p className="mt-4 text-sm text-navy-500">Aucun lubrifiant enregistré.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {withUrls.map((p) => {
              const profit = Number(p.retail_price) - Number(p.cost_price);
              return (
                <div key={p.id} className="flex gap-3 rounded-md border border-navy-100 p-3.5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-navy-50">
                    {p.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.photoUrl} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <Droplet size={22} className="text-navy-300" aria-hidden="true" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-navy">{p.name}</p>
                    <p className="text-xs text-navy-500">
                      {p.reference ? `Réf. ${p.reference} · ` : ""}
                      {stationNameById.get(p.station_id)}
                    </p>
                    <p className="mt-1 text-xs text-navy-600">
                      {formatMAD(Number(p.cost_price))} → {formatMAD(Number(p.retail_price))}{" "}
                      <span className="font-medium text-signal-cyan">({formatMAD(profit)})</span>
                    </p>
                    <p
                      className={`text-xs font-medium ${
                        Number(p.stock_quantity) <= 2 ? "text-action-coral" : "text-navy-500"
                      }`}
                    >
                      Stock : {formatNumberFr(Number(p.stock_quantity))}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
