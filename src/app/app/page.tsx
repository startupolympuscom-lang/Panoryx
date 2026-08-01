import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Fuel } from "lucide-react";
import { getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/card";
import { products as marketingProducts } from "@/lib/data/products";

export const metadata: Metadata = { title: "Mon espace" };

interface Entitlement {
  status: "trial" | "active" | "suspended" | "cancelled";
  trial_ends_at: string | null;
  products: { slug: string; name: string; description: string | null };
}

const statusLabel: Record<Entitlement["status"], string> = {
  trial: "Essai en cours",
  active: "Actif",
  suspended: "Suspendu",
  cancelled: "Annulé",
};

const statusTone: Record<Entitlement["status"], "success" | "warning" | "neutral"> = {
  trial: "warning",
  active: "success",
  suspended: "neutral",
  cancelled: "neutral",
};

export default async function AppHubPage() {
  const org = await getCurrentOrg();
  if (!org) redirect("/app/onboarding");

  const supabase = await createClient();
  const { data } = await supabase
    .from("organization_products")
    .select("status, trial_ends_at, products!inner(slug, name, description)")
    .eq("organization_id", org.organizationId);

  const entitlements = (data ?? []) as unknown as Entitlement[];
  const comingSoon = marketingProducts.filter((p) => p.availability === "bientot-disponible");

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-panoryx-blue">
          {org.organizationName}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy">Vos produits Panoryx</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-navy-500">
          Retrouvez ici les produits activés pour votre organisation et accédez-y directement.
        </p>
      </div>

      {entitlements.length === 0 ? (
        <div className="rounded-lg border border-dashed border-navy-200 bg-white p-10 text-center">
          <p className="text-sm text-navy-500">
            Aucun produit n&apos;est encore activé pour votre organisation.
          </p>
          <Link
            href="/produits"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-panoryx-blue hover:underline"
          >
            Découvrir les produits Panoryx
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {entitlements.map((e) => (
            <Link
              key={e.products.slug}
              href={`/app/${e.products.slug}`}
              className="group rounded-lg border border-navy-100 bg-white p-6 transition-shadow hover:shadow-card"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-panoryx-blue/10 text-panoryx-blue">
                  <Fuel size={22} aria-hidden="true" />
                </div>
                <Badge tone={statusTone[e.status]}>{statusLabel[e.status]}</Badge>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-navy">{e.products.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-500">
                {e.products.description}
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-panoryx-blue">
                Ouvrir
                <ArrowRight size={15} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      )}

      {comingSoon.length > 0 ? (
        <div className="mt-14">
          <h2 className="text-sm font-bold uppercase tracking-wider text-navy-500">
            Prochainement sur Panoryx
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {comingSoon.map((p) => (
              <div
                key={p.slug}
                className="rounded-lg border border-dashed border-navy-200 bg-white/60 p-5"
              >
                <p className="text-sm font-semibold text-navy-700">{p.name}</p>
                <Badge tone="coming-soon" className="mt-3">
                  Bientôt disponible
                </Badge>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </main>
  );
}
