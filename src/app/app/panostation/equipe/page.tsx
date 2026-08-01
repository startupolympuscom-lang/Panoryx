import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { AddEmployeeForm } from "@/components/app/panostation/add-employee-form";
import { Badge } from "@/components/ui/card";

export const metadata: Metadata = { title: "PanoStation — Équipe" };

export default async function EquipePage() {
  const org = await getCurrentOrg();
  if (!org) redirect("/app/onboarding");

  const supabase = await createClient();
  const { data: stations } = await supabase
    .from("stations")
    .select("id, name, city")
    .eq("organization_id", org.organizationId)
    .order("name");

  const { data: employees } = await supabase
    .from("employees")
    .select("id, full_name, role_title, phone, station_id, is_active")
    .eq("organization_id", org.organizationId)
    .order("full_name");

  const stationNameById = new Map((stations ?? []).map((s) => [s.id, s.name] as const));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Équipe</h1>
        <p className="mt-1 text-sm text-navy-500">Gérez les employés affectés à vos stations.</p>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Ajouter un employé</h2>
        <div className="mt-4">
          <AddEmployeeForm organizationId={org.organizationId} stations={stations ?? []} />
        </div>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Employés ({employees?.length ?? 0})</h2>
        {!employees || employees.length === 0 ? (
          <p className="mt-4 text-sm text-navy-500">Aucun employé enregistré.</p>
        ) : (
          <ul className="mt-4 divide-y divide-navy-100">
            {employees.map((e) => (
              <li key={e.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-navy">{e.full_name}</p>
                  <p className="text-xs text-navy-500">
                    {[e.role_title, e.station_id ? stationNameById.get(e.station_id) : null, e.phone]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </p>
                </div>
                <Badge tone={e.is_active ? "success" : "neutral"}>
                  {e.is_active ? "Actif" : "Inactif"}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
