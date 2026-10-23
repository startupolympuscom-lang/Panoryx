import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { AddCreditCustomerForm } from "@/components/app/panostation/add-credit-customer-form";
import { RecordCreditTransactionForm } from "@/components/app/panostation/record-credit-transaction-form";
import { KpiCard } from "@/components/app/panostation/kpi-card";
import { Users, Wallet, AlertTriangle } from "lucide-react";
import { formatMAD, formatDateTimeFr } from "@/lib/utils";

export const metadata: Metadata = { title: "PanoStation — Crédits clients" };

export default async function CreditsPage() {
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

  const [{ data: customers }, { data: transactions }] = stationIds.length
    ? await Promise.all([
        supabase
          .from("credit_customers")
          .select("id, station_id, name, phone, credit_limit, balance")
          .in("station_id", stationIds)
          .order("name"),
        supabase
          .from("credit_transactions")
          .select("id, customer_id, station_id, type, amount, note, created_at, credit_customers!inner(name)")
          .in("station_id", stationIds)
          .order("created_at", { ascending: false })
          .limit(20),
      ])
    : [{ data: [] }, { data: [] }];

  const totalOutstanding = (customers ?? []).reduce((sum, c) => sum + Number(c.balance), 0);
  const overLimitCount = (customers ?? []).filter(
    (c) => c.credit_limit != null && Number(c.balance) > Number(c.credit_limit)
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Crédits clients</h1>
        <p className="mt-1 text-sm text-navy-500">
          Suivez les clients qui consomment à crédit, leurs avances et leur solde restant dû.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Clients à crédit" value={String(customers?.length ?? 0)} icon={Users} />
        <KpiCard
          label="Total des crédits en cours"
          value={formatMAD(totalOutstanding)}
          icon={Wallet}
          tone={totalOutstanding > 0 ? "warning" : "neutral"}
        />
        <KpiCard
          label="Clients au-dessus du plafond"
          value={String(overLimitCount)}
          icon={AlertTriangle}
          tone={overLimitCount > 0 ? "negative" : "positive"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-navy-100 bg-white p-5">
          <h2 className="text-sm font-semibold text-navy">Ajouter un client à crédit</h2>
          <div className="mt-4">
            <AddCreditCustomerForm stations={stations ?? []} />
          </div>
        </div>

        <div className="rounded-lg border border-navy-100 bg-white p-5">
          <h2 className="text-sm font-semibold text-navy">Enregistrer une opération</h2>
          <div className="mt-4">
            <RecordCreditTransactionForm
              userId={user.id}
              stations={stations ?? []}
              customers={(customers ?? []).map((c) => ({ id: c.id, stationId: c.station_id, name: c.name }))}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Clients ({customers?.length ?? 0})</h2>
        {!customers || customers.length === 0 ? (
          <p className="mt-4 text-sm text-navy-500">Aucun client à crédit enregistré.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-xs uppercase tracking-wide text-navy-500">
                  <th className="pb-2 font-semibold">Client</th>
                  <th className="pb-2 font-semibold">Station</th>
                  <th className="pb-2 font-semibold">Téléphone</th>
                  <th className="pb-2 font-semibold">Plafond</th>
                  <th className="pb-2 font-semibold">Solde dû</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {customers.map((c) => {
                  const overLimit = c.credit_limit != null && Number(c.balance) > Number(c.credit_limit);
                  return (
                    <tr key={c.id}>
                      <td className="py-2.5 font-medium text-navy">{c.name}</td>
                      <td className="py-2.5 text-navy-700">{stationNameById.get(c.station_id)}</td>
                      <td className="py-2.5 text-navy-700">{c.phone || "—"}</td>
                      <td className="py-2.5 text-navy-700">
                        {c.credit_limit != null ? formatMAD(Number(c.credit_limit)) : "Aucun"}
                      </td>
                      <td
                        className={`py-2.5 font-semibold ${
                          overLimit ? "text-action-coral" : "text-navy"
                        }`}
                      >
                        {formatMAD(Number(c.balance))}
                        {overLimit ? " ⚠" : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Opérations récentes</h2>
        {!transactions || transactions.length === 0 ? (
          <p className="mt-4 text-sm text-navy-500">Aucune opération enregistrée.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-xs uppercase tracking-wide text-navy-500">
                  <th className="pb-2 font-semibold">Date</th>
                  <th className="pb-2 font-semibold">Client</th>
                  <th className="pb-2 font-semibold">Type</th>
                  <th className="pb-2 font-semibold">Montant</th>
                  <th className="pb-2 font-semibold">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {transactions.map((t) => {
                  const customerName = Array.isArray(t.credit_customers)
                    ? t.credit_customers[0]?.name
                    : (t.credit_customers as { name: string } | null)?.name;
                  return (
                    <tr key={t.id}>
                      <td className="py-2.5 text-navy-700">{formatDateTimeFr(t.created_at)}</td>
                      <td className="py-2.5 font-medium text-navy">{customerName}</td>
                      <td className="py-2.5 text-navy-700">
                        {t.type === "charge" ? "Consommation" : "Avance / paiement"}
                      </td>
                      <td
                        className={`py-2.5 font-semibold ${
                          t.type === "charge" ? "text-action-coral" : "text-signal-cyan"
                        }`}
                      >
                        {t.type === "charge" ? "+" : "-"}
                        {formatMAD(Number(t.amount))}
                      </td>
                      <td className="py-2.5 text-navy-500">{t.note || "—"}</td>
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
