import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/marketing/auth-card";
import { SignupForm } from "@/components/marketing/auth/signup-form";

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Créez votre compte Panoryx et démarrez votre essai PanoStation.",
};

export default async function InscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <AuthCard
      eyebrow="Nouveau compte"
      title="Créer votre compte Panoryx"
      description="Votre organisation démarre avec un essai PanoStation, activable immédiatement."
      footer={
        <span className="text-navy-500">
          Vous avez déjà un compte ?{" "}
          <Link href="/connexion" className="font-semibold text-panoryx-blue hover:underline">
            Se connecter
          </Link>
        </span>
      }
    >
      <SignupForm next={next ?? "/app"} />
    </AuthCard>
  );
}
