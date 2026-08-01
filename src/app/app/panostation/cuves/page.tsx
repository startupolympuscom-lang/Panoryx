import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { CreateTankForm } from "@/components/app/panostation/create-tank-form";
import { TankMeasurementForm } from "@/components/app/panostation/tank-measurement-form";
import { fuelTypeLabels } from "@/components/app/panostation/nav-items";
import { Badge } from "@/components/ui/card";
import { formatNumberFr } from "@/lib/utils";

export const metadata: Metadata = { title: "PanoStation — Cuves et stocks" };

export default async function CuvesPage() {
  const org = await getCurrentOrg();
  if (!org) redirect("/app/onboarding");

  const supabase = await createClient();
  const { data: stations } = await supabase
    .from("stations")
    .select("id, name, city")
    .eq("organization_id", org.organizationId)
    .order("name");

  const stationIds = (stations ?? []).map((s) => s.id);
  const { data: tanks } = stationIds.length
    ? await supabase
        .from("tanks")
        .select("id, station_id, label, fuel_type, capacity_liters, current_volume_liters, low_level_threshold_liters")
        .in("station_id", stationIds)
        .order("label")
    : { data: [] };

  const stationNameById = new Map((stations ?? []).map((s) => [s.id, s.name] as const));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Cuves et stocks</h1>
        <p className="mt-1 text-sm text-navy-500">
          Suivez les niveaux de cuves et enregistrez vos mesures.
        </p>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Ajouter une cuve</h2>
        <div className="mt-4">
          <CreateTankForm stations={stations ?? []} />
        </div>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Cuves ({tanks?.length ?? 0})</h2>
        {!tanks || tanks.length === 0 ? (
          <p className="mt-4 text-sm text-navy-500">Aucune cuve enregistrée.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-xs uppercase tracking-wide text-navy-500">
                  <th className="pb-2 font-semibold">Cuve</th>
                  <th className="pb-2 font-semibold">Station</th>
                  <th className="pb-2 font-semibold">Carburant</th>
                  <th className="pb-2 font-semibold">Niveau</th>
                  <th className="pb-2 font-semibold">Mesure manuelle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {tanks.map((t) => {
                  const isLow = Number(t.current_volume_liters) <= Number(t.low_level_threshold_liters);
                  return (
                    <tr key={t.id}>
                      <td className="py-3 font-medium text-navy">{t.label}</td>
                      <td className="py-3 text-navy-700">{stationNameById.get(t.station_id)}</td>
                      <td className="py-3 text-navy-700">{fuelTypeLabels[t.fuel_type]}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-navy-700">
                            {formatNumberFr(Number(t.current_volume_liters))} /{" "}
                            {formatNumberFr(Number(t.capacity_liters))} L
                          </span>
                          {isLow ? <Badge tone="warning">Stock bas</Badge> : null}
                        </div>
                      </td>
                      <td className="py-3">
                        <TankMeasurementForm
                          tankId={t.id}
                          currentVolumeLiters={Number(t.current_volume_liters)}
                        />
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
