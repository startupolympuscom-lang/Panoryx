import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { AuthCard } from "@/components/marketing/auth-card";
import { LoginForm } from "@/components/marketing/auth/login-form";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre espace Panoryx.",
};

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reset?: string }>;
}) {
  const { next, reset } = await searchParams;

  return (
    <AuthCard
      eyebrow="Espace client"
      title="Connexion à Panoryx"
      description="Accédez à votre organisation et à vos produits."
      footer={
        <span className="text-navy-500">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="font-semibold text-panoryx-blue hover:underline">
            Créer un compte
          </Link>
        </span>
      }
    >
      {reset === "success" ? (
        <div className="mb-6 flex items-center gap-2 rounded-md bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 size={16} aria-hidden="true" />
          Mot de passe mis à jour. Vous pouvez vous connecter.
        </div>
      ) : null}
      <LoginForm next={next ?? "/app"} />
    </AuthCard>
  );
}
