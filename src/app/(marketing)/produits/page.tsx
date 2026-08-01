import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductCard } from "@/components/marketing/product-card";
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
          <SectionHeading
            eyebrow="Écosystème de produits"
            title="Une plateforme, plusieurs produits spécialisés."
            description="Chaque produit Panoryx répond à un domaine opérationnel précis, tout en partageant la même organisation, les mêmes utilisateurs et une vue toujours unifiée."
          />
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
