import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { RecordEmployeeAdvanceForm } from "@/components/app/panostation/record-employee-advance-form";
import { RecordEmployeeFuelVoucherForm } from "@/components/app/panostation/record-employee-fuel-voucher-form";
import { MarkVoucherReimbursedButton } from "@/components/app/panostation/mark-voucher-reimbursed-button";
import { formatMAD, formatDateFr } from "@/lib/utils";

export const metadata: Metadata = { title: "PanoStation — Salaires et Bons employés" };

export default async function SalairesPage() {
  const user = await getCurrentUser();
  const org = await getCurrentOrg();
  if (!user || !org) redirect("/app/onboarding");

  const supabase = await createClient();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthStartIso = monthStart.toISOString().slice(0, 10);

  const [{ data: stations }, { data: employees }] = await Promise.all([
    supabase.from("stations").select("id, name, city").eq("organization_id", org.organizationId).order("name"),
    supabase
      .from("employees")
      .select("id, full_name, salary, station_id")
      .eq("organization_id", org.organizationId)
      .eq("is_active", true)
      .order("full_name"),
  ]);

  const employeeIds = (employees ?? []).map((e) => e.id);

  const [{ data: advances }, { data: vouchers }] = employeeIds.length
    ? await Promise.all([
        supabase
          .from("employee_advances")
          .select("id, employee_id, amount, note, created_at")
          .in("employee_id", employeeIds)
          .eq("period_month", monthStartIso)
          .order("created_at", { ascending: false }),
        supabase
          .from("employee_fuel_vouchers")
          .select(
            "id, employee_id, station_id, amount, product_description, beneficiary_name, is_reimbursed, voucher_date"
          )
          .in("employee_id", employeeIds)
          .gte("voucher_date", monthStartIso)
          .order("voucher_date", { ascending: false }),
      ])
    : [{ data: [] }, { data: [] }];

  const employeeNameById = new Map((employees ?? []).map((e) => [e.id, e.full_name] as const));
  const stationNameById = new Map((stations ?? []).map((s) => [s.id, s.name] as const));

  const takenByEmployee = new Map<string, number>();
  for (const a of advances ?? []) {
    takenByEmployee.set(a.employee_id, (takenByEmployee.get(a.employee_id) ?? 0) + Number(a.amount));
  }
  for (const v of vouchers ?? []) {
    if (v.is_reimbursed) continue;
    takenByEmployee.set(v.employee_id, (takenByEmployee.get(v.employee_id) ?? 0) + Number(v.amount));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Salaires et Bons employés</h1>
        <p className="mt-1 text-sm text-navy-500">
          Avances sur salaire et bons carburant donnés par les employés — plafonnés au salaire mensuel.
        </p>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Solde du mois par employé</h2>
        {!employees || employees.length === 0 ? (
          <p className="mt-4 text-sm text-navy-500">Aucun employé actif.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-xs uppercase tracking-wide text-navy-500">
                  <th className="pb-2 font-semibold">Employé</th>
                  <th className="pb-2 font-semibold">Salaire de base</th>
                  <th className="pb-2 font-semibold">Pris ce mois-ci</th>
                  <th className="pb-2 font-semibold">Solde restant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {employees.map((e) => {
                  const taken = takenByEmployee.get(e.id) ?? 0;
                  const salary = e.salary != null ? Number(e.salary) : null;
                  const remaining = salary != null ? salary - taken : null;
                  return (
                    <tr key={e.id}>
                      <td className="py-2.5 font-medium text-navy">{e.full_name}</td>
                      <td className="py-2.5 text-navy-700">{salary != null ? formatMAD(salary) : "—"}</td>
                      <td className="py-2.5 text-navy-700">{formatMAD(taken)}</td>
                      <td
                        className={`py-2.5 font-semibold ${
                          remaining != null && remaining < 0 ? "text-action-coral" : "text-navy"
                        }`}
                      >
                        {remaining != null ? formatMAD(remaining) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-navy-100 bg-white p-5">
          <h2 className="text-sm font-semibold text-navy">Enregistrer une avance</h2>
          <div className="mt-4">
            <RecordEmployeeAdvanceForm
              organizationId={org.organizationId}
              userId={user.id}
              employees={(employees ?? []).map((e) => ({ id: e.id, fullName: e.full_name }))}
            />
          </div>
        </div>
        <div className="rounded-lg border border-navy-100 bg-white p-5">
          <h2 className="text-sm font-semibold text-navy">Enregistrer un bon carburant</h2>
          <div className="mt-4">
            <RecordEmployeeFuelVoucherForm
              organizationId={org.organizationId}
              userId={user.id}
              employees={(employees ?? []).map((e) => ({ id: e.id, fullName: e.full_name }))}
              stations={stations ?? []}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Avances du mois ({advances?.length ?? 0})</h2>
        {!advances || advances.length === 0 ? (
          <p className="mt-4 text-sm text-navy-500">Aucune avance ce mois-ci.</p>
        ) : (
          <ul className="mt-4 divide-y divide-navy-100">
            {advances.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <p className="font-medium text-navy">{employeeNameById.get(a.employee_id)}</p>
                  <p className="text-xs text-navy-500">
                    {formatDateFr(a.created_at)}
                    {a.note ? ` · ${a.note}` : ""}
                  </p>
                </div>
                <span className="font-semibold text-navy">{formatMAD(Number(a.amount))}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Bons carburant du mois ({vouchers?.length ?? 0})</h2>
        {!vouchers || vouchers.length === 0 ? (
          <p className="mt-4 text-sm text-navy-500">Aucun bon carburant ce mois-ci.</p>
        ) : (
          <ul className="mt-4 divide-y divide-navy-100">
            {vouchers.map((v) => (
              <li key={v.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-navy">{employeeNameById.get(v.employee_id)}</p>
                  <p className="truncate text-xs text-navy-500">
                    {formatDateFr(v.voucher_date)} · {v.product_description} ·{" "}
                    {stationNameById.get(v.station_id)}
                    {v.beneficiary_name ? ` · Pour ${v.beneficiary_name}` : ""}
                  </p>
                </div>
                <span className="font-semibold text-navy">{formatMAD(Number(v.amount))}</span>
                {v.is_reimbursed ? (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    Remboursé
                  </span>
                ) : (
                  <MarkVoucherReimbursedButton voucherId={v.id} />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
