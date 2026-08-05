import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { AddVoucherCompanyForm } from "@/components/app/panostation/add-voucher-company-form";
import { IssueCompanyVoucherForm } from "@/components/app/panostation/issue-company-voucher-form";
import { RecordVignetteUsageForm } from "@/components/app/panostation/record-vignette-usage-form";
import { MarkVoucherPaidForm } from "@/components/app/panostation/mark-voucher-paid-form";
import { formatMAD, formatDateFr } from "@/lib/utils";

export const metadata: Metadata = { title: "PanoStation — Bons Société et Vignettes" };

export default async function BonsPage() {
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

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [{ data: companies }, { data: vouchers }, { data: vignettes }] = stationIds.length
    ? await Promise.all([
        supabase
          .from("voucher_companies")
          .select("id, station_id, name, phone")
          .in("station_id", stationIds)
          .order("name"),
        supabase
          .from("company_vouchers")
          .select("id, company_id, station_id, amount, product_description, status, payment_method, issued_at")
          .in("station_id", stationIds)
          .order("issued_at", { ascending: false })
          .limit(30),
        supabase
          .from("vignette_usages")
          .select("id, company_id, station_id, vignette_type, amount, used_at")
          .in("station_id", stationIds)
          .gte("used_at", monthStart.toISOString()),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }];

  const companyNameById = new Map((companies ?? []).map((c) => [c.id, c.name] as const));

  const reportByCompany = new Map<string, { fuel: number; cafeBoutique: number }>();
  for (const v of vignettes ?? []) {
    const entry = reportByCompany.get(v.company_id) ?? { fuel: 0, cafeBoutique: 0 };
    if (v.vignette_type === "fuel") entry.fuel += Number(v.amount);
    else entry.cafeBoutique += Number(v.amount);
    reportByCompany.set(v.company_id, entry);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Bons Société et Vignettes</h1>
        <p className="mt-1 text-sm text-navy-500">
          Bons à paiement différé et vignettes d&apos;entreprise (carburant et café/boutique).
        </p>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Ajouter une entreprise</h2>
        <div className="mt-4">
          <AddVoucherCompanyForm stations={stations ?? []} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-navy-100 bg-white p-5">
          <h2 className="text-sm font-semibold text-navy">Émettre un Bon Société</h2>
          <div className="mt-4">
            <IssueCompanyVoucherForm
              userId={user.id}
              stations={stations ?? []}
              companies={(companies ?? []).map((c) => ({ id: c.id, stationId: c.station_id, name: c.name }))}
            />
          </div>
        </div>
        <div className="rounded-lg border border-navy-100 bg-white p-5">
          <h2 className="text-sm font-semibold text-navy">Enregistrer une utilisation de vignette</h2>
          <div className="mt-4">
            <RecordVignetteUsageForm
              userId={user.id}
              stations={stations ?? []}
              companies={(companies ?? []).map((c) => ({ id: c.id, stationId: c.station_id, name: c.name }))}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Rapport vignettes du mois par entreprise</h2>
        {reportByCompany.size === 0 ? (
          <p className="mt-4 text-sm text-navy-500">Aucune vignette utilisée ce mois-ci.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-xs uppercase tracking-wide text-navy-500">
                  <th className="pb-2 font-semibold">Entreprise</th>
                  <th className="pb-2 font-semibold">Vignettes carburant</th>
                  <th className="pb-2 font-semibold">Vignettes café/boutique</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {Array.from(reportByCompany.entries()).map(([companyId, r]) => (
                  <tr key={companyId}>
                    <td className="py-2.5 font-medium text-navy">{companyNameById.get(companyId)}</td>
                    <td className="py-2.5 text-navy-700">{formatMAD(r.fuel)}</td>
                    <td className="py-2.5 text-navy-700">{formatMAD(r.cafeBoutique)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Bons récents ({vouchers?.length ?? 0})</h2>
        {!vouchers || vouchers.length === 0 ? (
          <p className="mt-4 text-sm text-navy-500">Aucun bon émis.</p>
        ) : (
          <ul className="mt-4 divide-y divide-navy-100">
            {vouchers.map((v) => (
              <li key={v.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-navy">{companyNameById.get(v.company_id)}</p>
                  <p className="truncate text-xs text-navy-500">
                    {formatDateFr(v.issued_at)} · {v.product_description} · {stationNameById.get(v.station_id)}
                  </p>
                </div>
                <span className="font-semibold text-navy">{formatMAD(Number(v.amount))}</span>
                {v.status === "paid" ? (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    Payé
                  </span>
                ) : (
                  <MarkVoucherPaidForm voucherId={v.id} />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
