import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { RecordDeliveryForm } from "@/components/app/panostation/record-delivery-form";
import { MarkInvoiceReceivedButton } from "@/components/app/panostation/mark-invoice-received-button";
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

  const [{ data: tanks }, { data: suppliers }, { data: drivers }, { data: deliveries }] = stationIds.length
    ? await Promise.all([
        supabase.from("tanks").select("id, station_id, label").in("station_id", stationIds),
        supabase.from("suppliers").select("id, name").eq("organization_id", org.organizationId).order("name"),
        supabase
          .from("delivery_drivers")
          .select("id, full_name")
          .eq("organization_id", org.organizationId)
          .order("full_name"),
        supabase
          .from("fuel_deliveries")
          .select(
            "id, station_id, tank_id, liters, ordered_quantity, unit_cost, delivered_at, delivery_note_ref, invoice_received, driver_id, tanks!inner(label), delivery_drivers(full_name)"
          )
          .in("station_id", stationIds)
          .order("delivered_at", { ascending: false })
          .limit(20),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }];

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
            drivers={(drivers ?? []).map((d) => ({ id: d.id, fullName: d.full_name }))}
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
                  <th className="pb-2 font-semibold">Chauffeur</th>
                  <th className="pb-2 font-semibold">Commandé / Livré</th>
                  <th className="pb-2 font-semibold">Facture</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {deliveries.map((d) => {
                  const tankLabel = Array.isArray(d.tanks) ? d.tanks[0]?.label : (d.tanks as { label: string } | null)?.label;
                  const driverName = Array.isArray(d.delivery_drivers)
                    ? d.delivery_drivers[0]?.full_name
                    : (d.delivery_drivers as { full_name: string } | null)?.full_name;
                  const shortfall =
                    d.ordered_quantity != null && Number(d.ordered_quantity) > Number(d.liters);
                  return (
                    <tr key={d.id}>
                      <td className="py-2.5 text-navy-700">{formatDateTimeFr(d.delivered_at)}</td>
                      <td className="py-2.5 text-navy-700">{stationNameById.get(d.station_id)}</td>
                      <td className="py-2.5 text-navy-700">{tankLabel}</td>
                      <td className="py-2.5 text-navy-700">{driverName ?? "—"}</td>
                      <td className={`py-2.5 font-medium ${shortfall ? "text-action-coral" : "text-navy"}`}>
                        {d.ordered_quantity != null ? `${formatNumberFr(Number(d.ordered_quantity))} / ` : ""}
                        {formatNumberFr(Number(d.liters))} L
                        {shortfall ? " ⚠" : ""}
                      </td>
                      <td className="py-2.5">
                        {d.invoice_received ? (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            Reçue
                          </span>
                        ) : (
                          <MarkInvoiceReceivedButton deliveryId={d.id} />
                        )}
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
