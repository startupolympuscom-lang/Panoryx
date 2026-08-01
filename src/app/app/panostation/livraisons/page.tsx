import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { RecordDeliveryForm } from "@/components/app/panostation/record-delivery-form";
import { formatNumberFr, formatDateTimeFr } from "@/lib/utils";

export const metadata: Metadata = { title: "PanoStation — Livraisons" };

export default async function LivraisonsPage() {
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

  const [{ data: tanks }, { data: suppliers }, { data: deliveries }] = stationIds.length
    ? await Promise.all([
        supabase.from("tanks").select("id, station_id, label").in("station_id", stationIds),
        supabase.from("suppliers").select("id, name").eq("organization_id", org.organizationId).order("name"),
        supabase
          .from("fuel_deliveries")
          .select("id, station_id, tank_id, liters, unit_cost, delivered_at, delivery_note_ref, tanks!inner(label)")
          .in("station_id", stationIds)
          .order("delivered_at", { ascending: false })
          .limit(20),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Livraisons</h1>
        <p className="mt-1 text-sm text-navy-500">
          Enregistrez les livraisons de carburant reçues sur vos stations.
        </p>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Nouvelle livraison</h2>
        <div className="mt-4">
          <RecordDeliveryForm
            userId={user.id}
            stations={stations ?? []}
            tanks={(tanks ?? []).map((t) => ({ id: t.id, label: t.label, stationId: t.station_id }))}
            suppliers={suppliers ?? []}
          />
        </div>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Livraisons récentes</h2>
        {!deliveries || deliveries.length === 0 ? (
          <p className="mt-4 text-sm text-navy-500">Aucune livraison enregistrée.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-xs uppercase tracking-wide text-navy-500">
                  <th className="pb-2 font-semibold">Date</th>
                  <th className="pb-2 font-semibold">Station</th>
                  <th className="pb-2 font-semibold">Cuve</th>
                  <th className="pb-2 font-semibold">Volume</th>
                  <th className="pb-2 font-semibold">Référence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {deliveries.map((d) => {
                  const tankLabel = Array.isArray(d.tanks) ? d.tanks[0]?.label : (d.tanks as { label: string } | null)?.label;
                  return (
                    <tr key={d.id}>
                      <td className="py-2.5 text-navy-700">{formatDateTimeFr(d.delivered_at)}</td>
                      <td className="py-2.5 text-navy-700">{stationNameById.get(d.station_id)}</td>
                      <td className="py-2.5 text-navy-700">{tankLabel}</td>
                      <td className="py-2.5 font-medium text-navy">{formatNumberFr(Number(d.liters))} L</td>
                      <td className="py-2.5 text-navy-500">{d.delivery_note_ref ?? "—"}</td>
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
