import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { CreateStationForm } from "@/components/app/panostation/create-station-form";
import { Badge } from "@/components/ui/card";

export const metadata: Metadata = { title: "PanoStation — Paramètres" };

export default async function ParametresPage() {
  const org = await getCurrentOrg();
  if (!org) redirect("/app/onboarding");

  const supabase = await createClient();
  const { data: stations } = await supabase
    .from("stations")
    .select("id, name, city, address, is_active, created_at")
    .eq("organization_id", org.organizationId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Paramètres</h1>
        <p className="mt-1 text-sm text-navy-500">
          Gérez les stations de votre organisation {org.organizationName}.
        </p>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Ajouter une station</h2>
        <div className="mt-4">
          <CreateStationForm organizationId={org.organizationId} />
        </div>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Stations ({stations?.length ?? 0})</h2>
        {!stations || stations.length === 0 ? (
          <p className="mt-4 text-sm text-navy-500">Aucune station pour le moment.</p>
        ) : (
          <ul className="mt-4 divide-y divide-navy-100">
            {stations.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-navy">{s.name}</p>
                  <p className="text-xs text-navy-500">
                    {s.city}
                    {s.address ? ` — ${s.address}` : ""}
                  </p>
                </div>
                <Badge tone={s.is_active ? "success" : "neutral"}>
                  {s.is_active ? "Active" : "Inactive"}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
