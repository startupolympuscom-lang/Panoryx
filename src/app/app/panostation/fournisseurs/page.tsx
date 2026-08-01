import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { AddSupplierForm } from "@/components/app/panostation/add-supplier-form";

export const metadata: Metadata = { title: "PanoStation — Fournisseurs" };

export default async function FournisseursPage() {
  const org = await getCurrentOrg();
  if (!org) redirect("/app/onboarding");

  const supabase = await createClient();
  const { data: suppliers } = await supabase
    .from("suppliers")
    .select("id, name, contact_name, phone, email")
    .eq("organization_id", org.organizationId)
    .order("name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Fournisseurs</h1>
        <p className="mt-1 text-sm text-navy-500">Gérez le répertoire de vos fournisseurs de carburant.</p>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Ajouter un fournisseur</h2>
        <div className="mt-4">
          <AddSupplierForm organizationId={org.organizationId} />
        </div>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Fournisseurs ({suppliers?.length ?? 0})</h2>
        {!suppliers || suppliers.length === 0 ? (
          <p className="mt-4 text-sm text-navy-500">Aucun fournisseur enregistré.</p>
        ) : (
          <ul className="mt-4 divide-y divide-navy-100">
            {suppliers.map((s) => (
              <li key={s.id} className="py-3">
                <p className="text-sm font-medium text-navy">{s.name}</p>
                <p className="text-xs text-navy-500">
                  {[s.contact_name, s.phone, s.email].filter(Boolean).join(" · ") || "—"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
