import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { RecordTankGaugeForm } from "@/components/app/panostation/record-tank-gauge-form";
import { RecordDeliveryShortfallForm } from "@/components/app/panostation/record-delivery-shortfall-form";
import { MarkInvoiceReceivedButton } from "@/components/app/panostation/mark-invoice-received-button";
import { KpiCard } from "@/components/app/panostation/kpi-card";
import { Gauge, FileWarning, Clock } from "lucide-react";
import { formatNumberFr, formatDateFr, formatDateTimeFr } from "@/lib/utils";

export const metadata: Metadata = { title: "PanoStation — La Jauge" };

export default async function JaugePage() {
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
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [{ data: tanks }, { data: certificates }, { data: candidateDeliveries }, { data: pendingInvoices }, { data: shortfalls }] =
    stationIds.length
      ? await Promise.all([
          supabase.from("tanks").select("id, station_id, label").in("station_id", stationIds).order("label"),
          supabase
            .from("tank_gauge_certificates")
            .select("id, tank_id, station_id, measured_quantity, theoretical_quantity, variance, certified_at, tanks!inner(label)")
            .in("station_id", stationIds)
            .order("certified_at", { ascending: false })
            .limit(15),
          supabase
            .from("fuel_deliveries")
            .select("id, station_id, delivered_at, ordered_quantity, liters, tanks!inner(label), delivery_drivers(full_name)")
            .in("station_id", stationIds)
            .not("ordered_quantity", "is", null)
            .order("delivered_at", { ascending: false })
            .limit(15),
          supabase
            .from("fuel_deliveries")
            .select("id, station_id, delivered_at, liters, delivery_note_ref, tanks!inner(label)")
            .in("station_id", stationIds)
            .eq("invoice_received", false)
            .order("delivered_at", { ascending: true })
            .limit(20),
          supabase
            .from("delivery_shortfall_reports")
            .select("id, station_id, missing_quantity, driver_name, report_date, signature_note")
            .in("station_id", stationIds)
            .order("report_date", { ascending: false })
            .limit(15),
        ])
      : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }, { data: [] }];

  const overdueInvoices = (pendingInvoices ?? []).filter(
    (d) => new Date(d.delivered_at) < sevenDaysAgo
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">La Jauge</h1>
        <p className="mt-1 text-sm text-navy-500">
          Certificats de jauge par cuve, factures manque en cas de livraison incomplète, et suivi des
          factures fournisseur en attente.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Certificats enregistrés" value={String(certificates?.length ?? 0)} icon={Gauge} />
        <KpiCard
          label="Factures manque"
          value={String(shortfalls?.length ?? 0)}
          icon={FileWarning}
          tone={shortfalls && shortfalls.length > 0 ? "warning" : "positive"}
        />
        <KpiCard
          label="Factures fournisseur en retard (+7j)"
          value={String(overdueInvoices.length)}
          icon={Clock}
          tone={overdueInvoices.length > 0 ? "negative" : "positive"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-navy-100 bg-white p-5">
          <h2 className="text-sm font-semibold text-navy">Nouveau certificat de jauge</h2>
          <div className="mt-4">
            <RecordTankGaugeForm
              userId={user.id}
              tanks={(tanks ?? []).map((t) => ({
                id: t.id,
                label: t.label,
                stationId: t.station_id,
                stationName: stationNameById.get(t.station_id) ?? "",
              }))}
            />
          </div>
        </div>
        <div className="rounded-lg border border-navy-100 bg-white p-5">
          <h2 className="text-sm font-semibold text-navy">Créer une facture manque</h2>
          <div className="mt-4">
            <RecordDeliveryShortfallForm
              userId={user.id}
              deliveries={(candidateDeliveries ?? []).map((d) => {
                const tankLabel = Array.isArray(d.tanks) ? d.tanks[0]?.label : (d.tanks as { label: string } | null)?.label;
                const driverName = Array.isArray(d.delivery_drivers)
                  ? d.delivery_drivers[0]?.full_name
                  : (d.delivery_drivers as { full_name: string } | null)?.full_name;
                return {
                  id: d.id,
                  stationId: d.station_id,
                  tankLabel: tankLabel ?? "",
                  deliveredAt: d.delivered_at,
                  orderedQuantity: Number(d.ordered_quantity),
                  liters: Number(d.liters),
                  driverName: driverName ?? null,
                };
              })}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Factures fournisseur en attente ({pendingInvoices?.length ?? 0})</h2>
        {!pendingInvoices || pendingInvoices.length === 0 ? (
          <p className="mt-4 text-sm text-navy-500">Toutes les livraisons ont leur facture.</p>
        ) : (
          <ul className="mt-4 divide-y divide-navy-100">
            {pendingInvoices.map((d) => {
              const tankLabel = Array.isArray(d.tanks) ? d.tanks[0]?.label : (d.tanks as { label: string } | null)?.label;
              const overdue = new Date(d.delivered_at) < sevenDaysAgo;
              return (
                <li key={d.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-navy">
                      {stationNameById.get(d.station_id)} — {tankLabel}
                    </p>
                    <p className={`text-xs ${overdue ? "font-semibold text-action-coral" : "text-navy-500"}`}>
                      Livré le {formatDateFr(d.delivered_at)}
                      {overdue ? " · en retard" : ""}
                      {d.delivery_note_ref ? ` · BL ${d.delivery_note_ref}` : ""}
                    </p>
                  </div>
                  <MarkInvoiceReceivedButton deliveryId={d.id} />
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-navy-100 bg-white p-5">
          <h2 className="text-sm font-semibold text-navy">Derniers certificats</h2>
          {!certificates || certificates.length === 0 ? (
            <p className="mt-4 text-sm text-navy-500">Aucun certificat enregistré.</p>
          ) : (
            <ul className="mt-4 divide-y divide-navy-100">
              {certificates.map((c) => {
                const tankLabel = Array.isArray(c.tanks) ? c.tanks[0]?.label : (c.tanks as { label: string } | null)?.label;
                const variance = Number(c.variance);
                return (
                  <li key={c.id} className="py-2.5 text-sm">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-navy">
                        {tankLabel} — {stationNameById.get(c.station_id)}
                      </p>
                      <span className={`font-semibold ${variance < 0 ? "text-action-coral" : "text-signal-cyan"}`}>
                        {variance > 0 ? "+" : ""}
                        {formatNumberFr(variance)} L
                      </span>
                    </div>
                    <p className="text-xs text-navy-500">
                      {formatDateTimeFr(c.certified_at)} · mesuré {formatNumberFr(Number(c.measured_quantity))} L /
                      théorique {formatNumberFr(Number(c.theoretical_quantity))} L
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-navy-100 bg-white p-5">
          <h2 className="text-sm font-semibold text-navy">Factures manque</h2>
          {!shortfalls || shortfalls.length === 0 ? (
            <p className="mt-4 text-sm text-navy-500">Aucune facture manque enregistrée.</p>
          ) : (
            <ul className="mt-4 divide-y divide-navy-100">
              {shortfalls.map((s) => (
                <li key={s.id} className="py-2.5 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-navy">{stationNameById.get(s.station_id)}</p>
                    <span className="font-semibold text-action-coral">
                      -{formatNumberFr(Number(s.missing_quantity))} L
                    </span>
                  </div>
                  <p className="text-xs text-navy-500">
                    {formatDateFr(s.report_date)} · Chauffeur : {s.driver_name}
                    {s.signature_note ? ` · ${s.signature_note}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
