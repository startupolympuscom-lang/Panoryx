import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { CreateSocialPostForm } from "@/components/app/panostation/create-social-post-form";
import { MarkSocialPostPublishedButton } from "@/components/app/panostation/mark-social-post-published-button";
import { formatDateTimeFr } from "@/lib/utils";

export const metadata: Metadata = { title: "PanoStation — Marketing réseaux sociaux" };

const statusLabels: Record<string, { label: string; className: string }> = {
  draft: { label: "Brouillon", className: "bg-navy-50 text-navy-600" },
  scheduled: { label: "Planifiée", className: "bg-amber-50 text-amber-700" },
  published: { label: "Publiée", className: "bg-emerald-50 text-emerald-700" },
};

const platformLabels: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  autre: "Autre",
};

export default async function MarketingPage() {
  const user = await getCurrentUser();
  const org = await getCurrentOrg();
  if (!user || !org) redirect("/app/onboarding");

  const supabase = await createClient();
  const { data: stations } = await supabase
    .from("stations")
    .select("id, name, city")
    .eq("organization_id", org.organizationId)
    .order("name");

  const { data: posts } = await supabase
    .from("social_posts")
    .select("id, station_id, title, content, platform, status, scheduled_for, published_at")
    .eq("organization_id", org.organizationId)
    .order("created_at", { ascending: false })
    .limit(40);

  const stationNameById = new Map((stations ?? []).map((s) => [s.id, s.name] as const));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Marketing réseaux sociaux</h1>
        <p className="mt-1 text-sm text-navy-500">
          Calendrier de publications pour Facebook et Instagram.
        </p>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Cette page prépare et planifie les publications, mais ne se connecte à aucun compte
        Facebook/Instagram (aucune publication automatique) : une fois postée manuellement sur le
        réseau social, marquez-la ici comme &laquo; Publiée &raquo;.
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Nouvelle publication</h2>
        <div className="mt-4">
          <CreateSocialPostForm organizationId={org.organizationId} userId={user.id} stations={stations ?? []} />
        </div>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Publications ({posts?.length ?? 0})</h2>
        {!posts || posts.length === 0 ? (
          <p className="mt-4 text-sm text-navy-500">Aucune publication créée.</p>
        ) : (
          <ul className="mt-4 divide-y divide-navy-100">
            {posts.map((p) => {
              const meta = statusLabels[p.status];
              return (
                <li key={p.id} className="flex flex-wrap items-start justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-navy">{p.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-navy-500">{p.content}</p>
                    <p className="mt-1 text-xs text-navy-400">
                      {platformLabels[p.platform] ?? p.platform}
                      {p.station_id ? ` · ${stationNameById.get(p.station_id)}` : " · Toutes les stations"}
                      {p.scheduled_for ? ` · Prévu le ${formatDateTimeFr(p.scheduled_for)}` : ""}
                      {p.published_at ? ` · Publié le ${formatDateTimeFr(p.published_at)}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}>
                      {meta.label}
                    </span>
                    {p.status !== "published" ? <MarkSocialPostPublishedButton postId={p.id} /> : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
