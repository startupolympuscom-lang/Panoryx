import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Conditions d'utilisation" };

export default function ConditionsPage() {
  return (
    <LegalPage title="Conditions d'utilisation">
      <p>
        <strong className="text-navy">Contenu à finaliser.</strong> Cette page présentera les
        conditions générales d&apos;utilisation de la plateforme Panoryx et de ses produits,
        dont PanoStation, applicables aux organisations et à leurs utilisateurs.
      </p>
    </LegalPage>
  );
}
