import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { AccountingSettingRow } from "@/components/app/panostation/accounting-setting-row";
import { formatDateTimeFr } from "@/lib/utils";

export const metadata: Metadata = { title: "PanoStation — Paramètres comptables" };

const SETTING_DEFS = [
  { key: "target_margin_fuel", label: "Marge cible carburant" },
  { key: "target_margin_boutique", label: "Marge cible boutique" },
  { key: "target_margin_lubricant", label: "Marge cible lubrifiants" },
  { key: "cash_variance_tolerance", label: "Tolérance d'écart de caisse" },
];

export default async function ParametresComptablesPage() {
  const user = await getCurrentUser();
  const org = await getCurrentOrg();
  if (!user || !org) redirect("/app/onboarding");

  const allowedToView = ["owner", "accountant", "panoryx_admin"].includes(org.role);
  if (!allowedToView) {
    return (
      <div className="rounded-lg border border-navy-100 bg-white p-6 text-sm text-navy-500">
        Cette section est réservée au Gérant et au Comptable.
      </div>
    );
  }

  const isAccountant = org.role === "accountant" || org.role === "panoryx_admin";
  const supabase = await createClient();

  const [{ data: settings }, { data: history }] = await Promise.all([
    supabase
      .from("accounting_settings")
      .select("setting_key, label, value, updated_at")
      .eq("organization_id", org.organizationId),
    supabase
      .from("accounting_settings_history")
      .select("id, setting_key, old_value, new_value, created_at, profiles(full_name)")
      .eq("organization_id", org.organizationId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const settingByKey = new Map((settings ?? []).map((s) => [s.setting_key, s] as const));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Paramètres comptables</h1>
        <p className="mt-1 text-sm text-navy-500">
          Marges et ratios cibles — visibles uniquement par le Gérant et le Comptable, modifiables
          uniquement par le Comptable.
        </p>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Marges et ratios cibles</h2>
        <div className="mt-2 divide-y divide-navy-100">
          {SETTING_DEFS.map((def) => {
            const existing = settingByKey.get(def.key);
            return (
              <AccountingSettingRow
                key={def.key}
                organizationId={org.organizationId}
                userId={user.id}
                settingKey={def.key}
                label={def.label}
                value={existing ? Number(existing.value) : null}
                updatedAt={existing?.updated_at ?? null}
                editable={isAccountant}
              />
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Historique des modifications</h2>
        {!history || history.length === 0 ? (
          <p className="mt-4 text-sm text-navy-500">Aucune modification enregistrée.</p>
        ) : (
          <ul className="mt-4 divide-y divide-navy-100">
            {history.map((h) => {
              const actorName = Array.isArray(h.profiles)
                ? h.profiles[0]?.full_name
                : (h.profiles as { full_name: string } | null)?.full_name;
              const def = SETTING_DEFS.find((d) => d.key === h.setting_key);
              return (
                <li key={h.id} className="py-2.5 text-sm">
                  <p className="text-navy">
                    <span className="font-medium">{def?.label ?? h.setting_key}</span> :{" "}
                    {h.old_value != null ? `${h.old_value} % → ` : ""}
                    {h.new_value} %
                  </p>
                  <p className="text-xs text-navy-500">
                    {formatDateTimeFr(h.created_at)} · {actorName ?? "—"}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
