import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { CreatePumpForm, CreateNozzleForm } from "@/components/app/panostation/create-pump-nozzle-forms";
import { fuelTypeLabels } from "@/components/app/panostation/nav-items";
import { formatNumberFr } from "@/lib/utils";

export const metadata: Metadata = { title: "PanoStation — Pompes et compteurs" };

export default async function PompesPage() {
  const org = await getCurrentOrg();
  if (!org) redirect("/app/onboarding");

  const supabase = await createClient();
  const { data: stations } = await supabase
    .from("stations")
    .select("id, name, city")
    .eq("organization_id", org.organizationId)
    .order("name");

  const stationIds = (stations ?? []).map((s) => s.id);

  const [{ data: pumps }, { data: tanks }, { data: nozzles }] = stationIds.length
    ? await Promise.all([
        supabase.from("pumps").select("id, station_id, label").in("station_id", stationIds),
        supabase.from("tanks").select("id, station_id, label").in("station_id", stationIds),
        supabase
          .from("nozzles")
          .select("id, pump_id, station_id, tank_id, label, fuel_type, last_index_liters")
          .in("station_id", stationIds),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }];

  const stationNameById = new Map((stations ?? []).map((s) => [s.id, s.name] as const));
  const pumpLabelById = new Map((pumps ?? []).map((p) => [p.id, p.label] as const));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Pompes et compteurs</h1>
        <p className="mt-1 text-sm text-navy-500">
          Gérez les pompes et les buses de vos stations et leurs index.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-navy-100 bg-white p-5">
          <h2 className="text-sm font-semibold text-navy">Ajouter une pompe</h2>
          <div className="mt-4">
            <CreatePumpForm stations={stations ?? []} />
          </div>
        </div>
        <div className="rounded-lg border border-navy-100 bg-white p-5">
          <h2 className="text-sm font-semibold text-navy">Ajouter une buse</h2>
          <div className="mt-4">
            <CreateNozzleForm
              stations={stations ?? []}
              pumps={(pumps ?? []).map((p) => ({ id: p.id, label: p.label, stationId: p.station_id }))}
              tanks={(tanks ?? []).map((t) => ({ id: t.id, label: t.label, stationId: t.station_id }))}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Buses ({nozzles?.length ?? 0})</h2>
        {!nozzles || nozzles.length === 0 ? (
          <p className="mt-4 text-sm text-navy-500">Aucune buse enregistrée.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-xs uppercase tracking-wide text-navy-500">
                  <th className="pb-2 font-semibold">Buse</th>
                  <th className="pb-2 font-semibold">Pompe</th>
                  <th className="pb-2 font-semibold">Station</th>
                  <th className="pb-2 font-semibold">Carburant</th>
                  <th className="pb-2 font-semibold">Dernier index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {nozzles.map((n) => (
                  <tr key={n.id}>
                    <td className="py-3 font-medium text-navy">{n.label}</td>
                    <td className="py-3 text-navy-700">{pumpLabelById.get(n.pump_id)}</td>
                    <td className="py-3 text-navy-700">{stationNameById.get(n.station_id)}</td>
                    <td className="py-3 text-navy-700">{fuelTypeLabels[n.fuel_type]}</td>
                    <td className="py-3 text-navy-700">{formatNumberFr(Number(n.last_index_liters))} L</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
