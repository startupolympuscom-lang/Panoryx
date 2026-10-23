import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { RecordCustomerCheckForm } from "@/components/app/panostation/record-customer-check-form";
import { CustomerCheckStatusButtons } from "@/components/app/panostation/customer-check-status-buttons";
import { RecordCompanyCheckForm } from "@/components/app/panostation/record-company-check-form";
import { MarkCompanyCheckClearedButton } from "@/components/app/panostation/mark-company-check-cleared-button";
import { formatMAD, formatDateFr } from "@/lib/utils";

export const metadata: Metadata = { title: "PanoStation — Chèques" };

const statusLabels: Record<string, string> = {
  pending: "En attente",
  cleared: "Encaissé",
  bounced: "Rejeté",
};

export default async function ChequesPage() {
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

  const [{ data: customers }, { data: customerChecks }, { data: companyChecks }] = stationIds.length
    ? await Promise.all([
        supabase.from("credit_customers").select("id, station_id, name").in("station_id", stationIds).order("name"),
        supabase
          .from("customer_checks")
          .select("id, customer_id, station_id, amount, check_number, due_date, status, credit_customers!inner(name)")
          .in("station_id", stationIds)
          .order("created_at", { ascending: false })
          .limit(30),
        supabase
          .from("company_checks")
          .select("id, station_id, beneficiary, category, amount, check_number, issued_date, status")
          .in("station_id", stationIds)
          .order("issued_date", { ascending: false })
          .limit(30),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Chèques</h1>
        <p className="mt-1 text-sm text-navy-500">
          Chèques et traites reçus des clients, et chèques émis par la société pour ses charges.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-navy-100 bg-white p-5">
          <h2 className="text-sm font-semibold text-navy">Chèque / traite client</h2>
          <div className="mt-4">
            <RecordCustomerCheckForm
              userId={user.id}
              stations={stations ?? []}
              customers={(customers ?? []).map((c) => ({ id: c.id, stationId: c.station_id, name: c.name }))}
            />
          </div>
        </div>
        <div className="rounded-lg border border-navy-100 bg-white p-5">
          <h2 className="text-sm font-semibold text-navy">Chèque société (charge)</h2>
          <div className="mt-4">
            <RecordCompanyCheckForm userId={user.id} stations={stations ?? []} />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Chèques clients ({customerChecks?.length ?? 0})</h2>
        {!customerChecks || customerChecks.length === 0 ? (
          <p className="mt-4 text-sm text-navy-500">Aucun chèque client enregistré.</p>
        ) : (
          <ul className="mt-4 divide-y divide-navy-100">
            {customerChecks.map((c) => {
              const customerName = Array.isArray(c.credit_customers)
                ? c.credit_customers[0]?.name
                : (c.credit_customers as { name: string } | null)?.name;
              return (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-navy">{customerName}</p>
                    <p className="text-xs text-navy-500">
                      N°{c.check_number} · {stationNameById.get(c.station_id)}
                      {c.due_date ? ` · Échéance ${formatDateFr(c.due_date)}` : ""}
                    </p>
                  </div>
                  <span className="font-semibold text-navy">{formatMAD(Number(c.amount))}</span>
                  {c.status === "pending" ? (
                    <CustomerCheckStatusButtons userId={user.id} checkId={c.id} />
                  ) : (
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        c.status === "cleared"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-action-coral"
                      }`}
                    >
                      {statusLabels[c.status]}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Chèques société ({companyChecks?.length ?? 0})</h2>
        {!companyChecks || companyChecks.length === 0 ? (
          <p className="mt-4 text-sm text-navy-500">Aucun chèque société enregistré.</p>
        ) : (
          <ul className="mt-4 divide-y divide-navy-100">
            {companyChecks.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-navy">{c.beneficiary}</p>
                  <p className="text-xs text-navy-500">
                    {c.category} · N°{c.check_number} · {formatDateFr(c.issued_date)} ·{" "}
                    {stationNameById.get(c.station_id)}
                  </p>
                </div>
                <span className="font-semibold text-navy">{formatMAD(Number(c.amount))}</span>
                {c.status === "cleared" ? (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    Débité
                  </span>
                ) : (
                  <MarkCompanyCheckClearedButton checkId={c.id} />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
