import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/marketing/auth-card";
import { ForgotPasswordForm } from "@/components/marketing/auth/forgot-password-form";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function MotDePasseOubliePage() {
  return (
    <AuthCard
      eyebrow="Récupération de compte"
      title="Mot de passe oublié"
      description="Indiquez votre adresse e-mail : nous vous enverrons un lien pour choisir un nouveau mot de passe."
      footer={
        <Link href="/connexion" className="font-semibold text-panoryx-blue hover:underline">
          Retour à la connexion
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
