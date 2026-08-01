import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/card";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Users2, Calculator, Package } from "lucide-react";

const upcoming = [
  { icon: Users2, domain: "Ressources humaines" },
  { icon: Calculator, domain: "Comptabilité & finance" },
  { icon: Package, domain: "Logistique & inventaire" },
];

export function EcosystemSection() {
  return (
    <section className="border-t border-navy-100 bg-navy-50/50 py-20 sm:py-28">
      <Container>
        <FadeIn>
          <SectionHeading
            eyebrow="Écosystème Panoryx"
            title="PanoStation est le premier d'une famille de produits Panoryx."
            description="Chaque nouveau produit Panoryx s'ajoute à la même plateforme, avec la même organisation, les mêmes utilisateurs et une vue toujours unifiée."
          />
        </FadeIn>

        <StaggerGroup className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {upcoming.map((u) => (
            <StaggerItem
              key={u.domain}
              className="flex flex-col items-start rounded-lg border border-dashed border-navy-200 bg-white/60 p-6 transition-colors hover:border-navy-300 hover:bg-white"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-navy-100 text-navy-500">
                <u.icon size={20} aria-hidden="true" />
              </div>
              <p className="mt-5 text-base font-semibold text-navy-700">{u.domain}</p>
              <Badge tone="coming-soon" className="mt-3">
                Bientôt disponible
              </Badge>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
