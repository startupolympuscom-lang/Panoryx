import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { AuthCard } from "@/components/marketing/auth-card";

export const metadata: Metadata = { title: "Vérifiez votre e-mail" };

export default function VerificationPage() {
  return (
    <AuthCard eyebrow="Dernière étape" title="Vérifiez votre boîte de réception">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-panoryx-blue/10 text-panoryx-blue">
          <Mail size={22} aria-hidden="true" />
        </div>
        <p className="text-sm leading-relaxed text-navy-500">
          Nous vous avons envoyé un e-mail de confirmation. Cliquez sur le lien qu&apos;il
          contient pour activer votre compte et accéder à votre organisation Panoryx.
        </p>
      </div>
    </AuthCard>
  );
}
