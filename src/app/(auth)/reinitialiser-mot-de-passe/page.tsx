import type { Metadata } from "next";
import { AuthCard } from "@/components/marketing/auth-card";
import { ResetPasswordForm } from "@/components/marketing/auth/reset-password-form";

export const metadata: Metadata = { title: "Réinitialiser le mot de passe" };

export default function ReinitialiserMotDePassePage() {
  return (
    <AuthCard
      eyebrow="Récupération de compte"
      title="Choisissez un nouveau mot de passe"
      description="Ce lien de réinitialisation n'est valable qu'une seule fois."
    >
      <ResetPasswordForm />
    </AuthCard>
  );
}
