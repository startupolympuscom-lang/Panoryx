import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function ConfidentialitePage() {
  return (
    <LegalPage title="Politique de confidentialité">
      <p>
        <strong className="text-navy">Contenu à finaliser.</strong> Cette page décrira la
        manière dont Panoryx collecte, utilise et protège les données personnelles des
        visiteurs du site et des utilisateurs de la plateforme, conformément à la
        réglementation applicable.
      </p>
      <p>
        Les informations transmises via nos formulaires de contact et de demande de démo sont
        utilisées exclusivement pour répondre à votre demande et ne sont pas partagées avec des
        tiers à des fins commerciales.
      </p>
    </LegalPage>
  );
}
