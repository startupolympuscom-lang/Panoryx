import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentOrg } from "@/lib/auth/session";
import { OnboardingForm } from "@/components/app/onboarding-form";
import { OpenViewports } from "@/components/brand/graphic-devices";

export const metadata: Metadata = { title: "Créer votre organisation" };

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

  const org = await getCurrentOrg();
  if (org) redirect(next ?? "/app");

  return (
    <main className="flex flex-1 items-center justify-center px-5 py-16">
      <div className="w-full max-w-md rounded-xl border border-navy-100 bg-white p-8 shadow-card">
        <OpenViewports className="mb-6 h-12 w-12" />
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-panoryx-blue">
          Bienvenue sur Panoryx
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-navy">
          Nommez votre organisation
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-navy-500">
          Votre organisation regroupe vos sites, vos équipes et vos produits Panoryx. Elle
          démarre avec un essai PanoStation activé automatiquement.
        </p>
        <div className="mt-7">
          <OnboardingForm next={next ?? "/app"} />
        </div>
      </div>
    </main>
  );
}
