import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AccessRequest({
  productName,
  organizationName,
}: {
  productName: string;
  organizationName: string;
}) {
  return (
    <main className="flex flex-1 items-center justify-center px-5 py-16">
      <div className="w-full max-w-md rounded-xl border border-navy-100 bg-white p-8 text-center shadow-card">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-navy-100 text-navy-500">
          <Lock size={22} aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-xl font-bold tracking-tight text-navy">
          {productName} n&apos;est pas activé
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-navy-500">
          <strong className="text-navy">{organizationName}</strong> n&apos;a pas encore accès à
          ce produit. Contactez notre équipe pour activer {productName} ou démarrer un essai.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button href="/contact?type=demo" size="md">
            Demander l&apos;accès
          </Button>
          <Button href="/app" size="md" variant="outline">
            Retour à mon espace
          </Button>
        </div>
        <p className="mt-6 text-xs text-navy-500">
          Vous pensez qu&apos;il s&apos;agit d&apos;une erreur ?{" "}
          <Link href="/contact" className="font-medium text-panoryx-blue hover:underline">
            Contactez-nous
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
