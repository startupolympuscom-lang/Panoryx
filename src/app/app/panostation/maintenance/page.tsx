import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { CreateTicketForm, TicketStatusSelect } from "@/components/app/panostation/maintenance-forms";
import { Badge } from "@/components/ui/card";
import { formatDateTimeFr } from "@/lib/utils";

export const metadata: Metadata = { title: "PanoStation — Maintenance et incidents" };

const priorityTone: Record<string, "neutral" | "warning" | "danger"> = {
  low: "neutral",
  medium: "neutral",
  high: "warning",
  critical: "danger",
};

const priorityLabels: Record<string, string> = {
  low: "Basse",
  medium: "Moyenne",
  high: "Haute",
  critical: "Critique",
};

export default async function MaintenancePage() {
  const user = await getCurrentUser();
  const org = await getCurrentOrg();
  if (!user || !org) redirect("/app/onboarding");

  const supabase = await createClient();
  const { data: stations } = await supabase
    .from("stations")
    .select("id, name, city")
    .eq("organization_id", org.organizationId)
    .order("name");

  const { data: tickets } = await supabase
    .from("maintenance_tickets")
    .select("id, station_id, title, description, status, priority, created_at")
    .eq("organization_id", org.organizationId)
    .order("created_at", { ascending: false })
    .limit(50);

  const stationNameById = new Map((stations ?? []).map((s) => [s.id, s.name] as const));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Maintenance et incidents</h1>
        <p className="mt-1 text-sm text-navy-500">
          Signalez et suivez les incidents opérationnels de vos stations.
        </p>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Signaler un incident</h2>
        <div className="mt-4">
          <CreateTicketForm organizationId={org.organizationId} userId={user.id} stations={stations ?? []} />
        </div>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Tickets ({tickets?.length ?? 0})</h2>
        {!tickets || tickets.length === 0 ? (
          <p className="mt-4 text-sm text-navy-500">Aucun incident signalé.</p>
        ) : (
          <ul className="mt-4 divide-y divide-navy-100">
            {tickets.map((t) => (
              <li key={t.id} className="py-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-navy">{t.title}</p>
                    <p className="text-xs text-navy-500">
                      {stationNameById.get(t.station_id)} · {formatDateTimeFr(t.created_at)}
                    </p>
                    {t.description ? (
                      <p className="mt-1 text-sm text-navy-500">{t.description}</p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={priorityTone[t.priority]}>{priorityLabels[t.priority]}</Badge>
                    <TicketStatusSelect ticketId={t.id} status={t.status} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
