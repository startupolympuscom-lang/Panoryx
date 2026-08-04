import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { RecordBankDepositForm } from "@/components/app/panostation/record-bank-deposit-form";
import { RecordBankMessageForm } from "@/components/app/panostation/record-bank-message-form";
import { MatchBankDepositButton } from "@/components/app/panostation/match-bank-deposit-button";
import { KpiCard } from "@/components/app/panostation/kpi-card";
import { Clock, CheckCircle2, MessageSquareWarning } from "lucide-react";
import { formatMAD, formatDateFr, formatDateTimeFr } from "@/lib/utils";

export const metadata: Metadata = { title: "PanoStation — Rapprochement bancaire" };

const messageTypeStyle: Record<string, string> = {
  debit: "text-action-coral",
  credit: "text-signal-cyan",
  info: "text-navy-500",
};

const messageTypeLabel: Record<string, string> = {
  debit: "Débit",
  credit: "Crédit",
  info: "Information",
};

export default async function BanquePage() {
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

  const [{ data: deposits }, { data: messages }] = stationIds.length
    ? await Promise.all([
        supabase
          .from("bank_deposits")
          .select("id, station_id, depositor_name, amount, deposit_date, status, created_at")
          .in("station_id", stationIds)
          .order("deposit_date", { ascending: false }),
        supabase
          .from("bank_messages")
          .select("id, station_id, message_type, amount, raw_text, received_at, matched_deposit_id")
          .in("station_id", stationIds)
          .order("received_at", { ascending: false }),
      ])
    : [{ data: [] }, { data: [] }];

  const depositById = new Map((deposits ?? []).map((d) => [d.id, d] as const));
  const pendingDeposits = (deposits ?? []).filter((d) => d.status === "pending");
  const unmatchedMessages = (messages ?? []).filter((m) => !m.matched_deposit_id);
  const pendingTotal = pendingDeposits.reduce((sum, d) => sum + Number(d.amount), 0);

  function suggestionsFor(depositId: string, stationId: string, amount: number) {
    return unmatchedMessages.filter(
      (m) => m.station_id === stationId && m.amount != null && Math.abs(Number(m.amount) - amount) < 0.01
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Rapprochement bancaire</h1>
        <p className="mt-1 text-sm text-navy-500">
          Suivez les versements en banque et rapprochez-les des messages/notifications reçus.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Versements en attente"
          value={String(pendingDeposits.length)}
          icon={Clock}
          tone={pendingDeposits.length > 0 ? "warning" : "positive"}
          hint={formatMAD(pendingTotal)}
        />
        <KpiCard
          label="Versements rapprochés"
          value={String((deposits ?? []).length - pendingDeposits.length)}
          icon={CheckCircle2}
          tone="positive"
        />
        <KpiCard
          label="Messages non rapprochés"
          value={String(unmatchedMessages.length)}
          icon={MessageSquareWarning}
          tone={unmatchedMessages.length > 0 ? "warning" : "neutral"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-navy-100 bg-white p-5">
          <h2 className="text-sm font-semibold text-navy">Nouveau versement</h2>
          <div className="mt-4">
            <RecordBankDepositForm userId={user.id} stations={stations ?? []} />
          </div>
        </div>
        <div className="rounded-lg border border-navy-100 bg-white p-5">
          <h2 className="text-sm font-semibold text-navy">Nouveau message bancaire</h2>
          <div className="mt-4">
            <RecordBankMessageForm userId={user.id} stations={stations ?? []} />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Versements ({deposits?.length ?? 0})</h2>
        {!deposits || deposits.length === 0 ? (
          <p className="mt-4 text-sm text-navy-500">Aucun versement enregistré.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {deposits.map((d) => {
              const suggestions =
                d.status === "pending" ? suggestionsFor(d.id, d.station_id, Number(d.amount)) : [];
              return (
                <div
                  key={d.id}
                  className="flex flex-col gap-3 rounded-md border border-navy-100 p-3.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-navy">
                      {d.depositor_name}{" "}
                      <span className="font-normal text-navy-500">
                        — {stationNameById.get(d.station_id)}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-navy-500">{formatDateFr(d.deposit_date)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-navy">{formatMAD(Number(d.amount))}</span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        d.status === "matched"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-orange-50 text-pulse-orange"
                      }`}
                    >
                      {d.status === "matched" ? "Rapproché" : "En attente"}
                    </span>
                  </div>
                  {suggestions.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-2 sm:ml-4">
                      <span className="text-xs text-navy-500">Message correspondant :</span>
                      {suggestions.map((m) => (
                        <div key={m.id} className="flex items-center gap-2 rounded-md bg-navy-50 px-2.5 py-1.5">
                          <span className="max-w-[220px] truncate text-xs text-navy-700" title={m.raw_text}>
                            {m.raw_text}
                          </span>
                          <MatchBankDepositButton depositId={d.id} messageId={m.id} />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Messages bancaires ({messages?.length ?? 0})</h2>
        {!messages || messages.length === 0 ? (
          <p className="mt-4 text-sm text-navy-500">Aucun message enregistré.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-xs uppercase tracking-wide text-navy-500">
                  <th className="pb-2 font-semibold">Reçu le</th>
                  <th className="pb-2 font-semibold">Type</th>
                  <th className="pb-2 font-semibold">Montant</th>
                  <th className="pb-2 font-semibold">Message</th>
                  <th className="pb-2 font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {messages.map((m) => {
                  const matchedDeposit = m.matched_deposit_id ? depositById.get(m.matched_deposit_id) : null;
                  return (
                    <tr key={m.id} className={m.matched_deposit_id ? "bg-emerald-50/40" : undefined}>
                      <td className="py-2.5 text-navy-700">{formatDateTimeFr(m.received_at)}</td>
                      <td className={`py-2.5 font-semibold ${messageTypeStyle[m.message_type]}`}>
                        {messageTypeLabel[m.message_type]}
                      </td>
                      <td className="py-2.5 text-navy-700">
                        {m.amount != null ? formatMAD(Number(m.amount)) : "—"}
                      </td>
                      <td className="max-w-xs truncate py-2.5 text-navy-500" title={m.raw_text}>
                        {m.raw_text}
                      </td>
                      <td className="py-2.5 text-xs text-navy-500">
                        {matchedDeposit
                          ? `Lié à ${matchedDeposit.depositor_name} (${formatMAD(Number(matchedDeposit.amount))})`
                          : "Non rapproché"}
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
