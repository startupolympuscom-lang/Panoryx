import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { RecordCashForm } from "@/components/app/panostation/record-cash-form";
import { formatMAD, formatDateTimeFr } from "@/lib/utils";

export const metadata: Metadata = { title: "PanoStation — Caisse" };

export default async function CaissePage() {
  const user = await getCurrentUser();
  const org = await getCurrentOrg();
  if (!user || !org) redirect("/app/onboarding");

  const supabase = await createClient();
  const { data: stations } = await supabase
    .from("stations")
    .select("id, name")
    .eq("organization_id", org.organizationId)
    .order("name");

  const stationIds = (stations ?? []).map((s) => s.id);
  const stationNameById = new Map((stations ?? []).map((s) => [s.id, s.name] as const));

  const { data: closedShifts } = stationIds.length
    ? await supabase
        .from("shifts")
        .select("id, station_id, closed_at")
        .in("station_id", stationIds)
        .eq("status", "closed")
        .order("closed_at", { ascending: false })
        .limit(30)
    : { data: [] };

  const { data: existingReconciliations } = stationIds.length
    ? await supabase.from("cash_reconciliations").select("shift_id").in("station_id", stationIds)
    : { data: [] };
  const reconciledShiftIds = new Set((existingReconciliations ?? []).map((r) => r.shift_id));

  const pendingShifts = (closedShifts ?? []).filter((s) => !reconciledShiftIds.has(s.id));

  const pendingShiftIds = pendingShifts.map((s) => s.id);
  const { data: cashSales } = pendingShiftIds.length
    ? await supabase
        .from("fuel_sales")
        .select("shift_id, total_amount")
        .in("shift_id", pendingShiftIds)
        .eq("payment_method", "cash")
    : { data: [] };

  const expectedByShift = new Map<string, number>();
  for (const s of cashSales ?? []) {
    expectedByShift.set(s.shift_id, (expectedByShift.get(s.shift_id) ?? 0) + Number(s.total_amount));
  }

  const { data: recentReconciliations } = stationIds.length
    ? await supabase
        .from("cash_reconciliations")
        .select("id, station_id, expected_amount, counted_amount, difference, created_at")
        .in("station_id", stationIds)
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: [] };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Caisse</h1>
        <p className="mt-1 text-sm text-navy-500">
          Rapprochez les totaux de caisse en fin de quart et suivez les écarts.
        </p>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Rapprochement de caisse</h2>
        <div className="mt-4">
          <RecordCashForm
            userId={user.id}
            shifts={pendingShifts.map((s) => ({
              id: s.id,
              stationId: s.station_id,
              stationName: stationNameById.get(s.station_id) ?? "",
              expectedCash: expectedByShift.get(s.id) ?? 0,
            }))}
          />
        </div>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Historique des rapprochements</h2>
        {!recentReconciliations || recentReconciliations.length === 0 ? (
          <p className="mt-4 text-sm text-navy-500">Aucun rapprochement enregistré.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-xs uppercase tracking-wide text-navy-500">
                  <th className="pb-2 font-semibold">Date</th>
                  <th className="pb-2 font-semibold">Station</th>
                  <th className="pb-2 font-semibold">Attendu</th>
                  <th className="pb-2 font-semibold">Compté</th>
                  <th className="pb-2 font-semibold">Écart</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {recentReconciliations.map((r) => {
                  const diff = Number(r.difference);
                  return (
                    <tr key={r.id}>
                      <td className="py-2.5 text-navy-700">{formatDateTimeFr(r.created_at)}</td>
                      <td className="py-2.5 text-navy-700">{stationNameById.get(r.station_id)}</td>
                      <td className="py-2.5 text-navy-700">{formatMAD(Number(r.expected_amount))}</td>
                      <td className="py-2.5 text-navy-700">{formatMAD(Number(r.counted_amount))}</td>
                      <td
                        className={`py-2.5 font-semibold ${diff < 0 ? "text-action-coral" : diff > 0 ? "text-pulse-orange" : "text-emerald-600"}`}
                      >
                        {formatMAD(diff)}
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
