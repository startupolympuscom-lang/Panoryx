import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductCard } from "@/components/marketing/product-card";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { products } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Produits",
  description:
    "Découvrez les produits Panoryx : PanoStation pour les réseaux de stations-service, et les prochains modules de la plateforme.",
};

export default function ProduitsPage() {
  return (
    <>
      <section className="border-b border-navy-100 bg-navy-50/50 py-16 sm:py-20">
        <Container>
          <FadeIn>
            <SectionHeading
              eyebrow="Écosystème de produits"
              title="Une plateforme, plusieurs produits spécialisés."
              description="Chaque produit Panoryx répond à un domaine opérationnel précis, tout en partageant la même organisation, les mêmes utilisateurs et une vue toujours unifiée."
            />
          </FadeIn>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <StaggerGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map(({ icon: Icon, ...p }) => (
              <StaggerItem key={p.slug}>
                <ProductCard product={p} icon={<Icon size={22} color={p.accentColor} aria-hidden="true" />} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </section>
    </>
  );
}
