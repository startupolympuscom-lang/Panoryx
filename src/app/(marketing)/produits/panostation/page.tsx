import type { Metadata } from "next";
import { PanostationLanding } from "@/components/marketing/panostation/panostation-landing";

export const metadata: Metadata = {
  title: "PanoStation — Le logiciel opérationnel pour vos stations-service",
  description:
    "PanoStation centralise les ventes, les stocks de carburant, les équipes, les fournisseurs et les opérations quotidiennes de votre réseau de stations-service. Disponible en darija, français et anglais.",
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PanoStation",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "PanoStation centralise les ventes, les stocks de carburant, les équipes, les fournisseurs et les opérations quotidiennes des réseaux de stations-service.",
  brand: { "@type": "Brand", name: "Panoryx" },
};

export default function PanoStationPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <PanostationLanding />
    </>
  );
}
