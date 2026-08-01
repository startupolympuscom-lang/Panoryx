import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { OpenShiftForm } from "@/components/app/panostation/open-shift-form";
import { ShiftRow } from "@/components/app/panostation/shift-row";
import { Badge } from "@/components/ui/card";
import { formatDateTimeFr } from "@/lib/utils";

export const metadata: Metadata = { title: "PanoStation — Quarts" };

export default async function QuartsPage() {
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

  const { data: nozzles } = stationIds.length
    ? await supabase
        .from("nozzles")
        .select("id, station_id, label, fuel_type, last_index_liters")
        .in("station_id", stationIds)
    : { data: [] };

  const { data: shifts } = stationIds.length
    ? await supabase
        .from("shifts")
        .select("id, station_id, status, opened_at, closed_at")
        .in("station_id", stationIds)
        .order("opened_at", { ascending: false })
        .limit(30)
    : { data: [] };

  const openShifts = (shifts ?? []).filter((s) => s.status === "open");
  const closedShifts = (shifts ?? []).filter((s) => s.status === "closed");

  const openShiftIds = openShifts.map((s) => s.id);
  const { data: openReadings } = openShiftIds.length
    ? await supabase
        .from("shift_readings")
        .select("id, shift_id, opening_index, nozzles!inner(label)")
        .in("shift_id", openShiftIds)
    : { data: [] };

  const readingsByShift = new Map<string, { readingId: string; nozzleLabel: string; openingIndex: number }[]>();
  for (const r of openReadings ?? []) {
    const nozzleLabel = Array.isArray(r.nozzles) ? r.nozzles[0]?.label : (r.nozzles as { label: string } | null)?.label;
    const list = readingsByShift.get(r.shift_id) ?? [];
    list.push({ readingId: r.id, nozzleLabel: nozzleLabel ?? "", openingIndex: Number(r.opening_index) });
    readingsByShift.set(r.shift_id, list);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Quarts</h1>
        <p className="mt-1 text-sm text-navy-500">Ouvrez et clôturez les quarts de vos stations.</p>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Ouvrir un quart</h2>
        <div className="mt-4">
          <OpenShiftForm
            userId={user.id}
            stations={stations ?? []}
            nozzles={(nozzles ?? []).map((n) => ({
              id: n.id,
              label: n.label,
              fuelType: n.fuel_type,
              stationId: n.station_id,
              lastIndexLiters: Number(n.last_index_liters),
            }))}
          />
        </div>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Quarts ouverts ({openShifts.length})</h2>
        {openShifts.length === 0 ? (
          <p className="mt-4 text-sm text-navy-500">Aucun quart ouvert actuellement.</p>
        ) : (
          <ul className="mt-2 divide-y divide-navy-100">
            {openShifts.map((s) => (
              <ShiftRow
                key={s.id}
                userId={user.id}
                shiftId={s.id}
                stationName={stationNameById.get(s.station_id) ?? ""}
                openedAt={s.opened_at}
                readings={readingsByShift.get(s.id) ?? []}
              />
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Historique des quarts</h2>
        {closedShifts.length === 0 ? (
          <p className="mt-4 text-sm text-navy-500">Aucun quart clôturé pour le moment.</p>
        ) : (
          <ul className="mt-2 divide-y divide-navy-100">
            {closedShifts.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-navy">{stationNameById.get(s.station_id)}</p>
                  <p className="text-xs text-navy-500">
                    {formatDateTimeFr(s.opened_at)} → {s.closed_at ? formatDateTimeFr(s.closed_at) : "—"}
                  </p>
                </div>
                <Badge tone="neutral">Clôturé</Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
