import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Mentions légales" };

export default function MentionsLegalesPage() {
  return (
    <LegalPage title="Mentions légales">
      <p>
        <strong className="text-navy">Contenu à finaliser.</strong> Cette page est un
        emplacement réservé pour les mentions légales de Panoryx (raison sociale, forme
        juridique, siège social, immatriculation, directeur de publication, hébergeur). Elle
        sera complétée avec les informations officielles de l&apos;entreprise avant mise en
        production.
      </p>
      <p>Pour toute question, contactez-nous à contact@panoryx.com.</p>
    </LegalPage>
  );
}
