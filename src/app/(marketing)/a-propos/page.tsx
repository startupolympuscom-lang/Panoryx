import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { GradientBands } from "@/components/brand/graphic-devices";
import { Eye, Link2, Zap, Target } from "lucide-react";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Panoryx est une plateforme d'opérations métier modulaire, conçue pour donner aux entreprises une visibilité panoramique et une exécution connectée.",
};

const values = [
  { icon: Eye, title: "Clarté", description: "Une information fiable, présentée simplement, accessible à qui en a besoin." },
  { icon: Link2, title: "Connexion", description: "Des modules qui partagent une même base plutôt que des outils isolés." },
  { icon: Zap, title: "Vivacité", description: "Des données à jour en continu, pour décider sans attendre." },
  { icon: Target, title: "Précision", description: "Des processus standardisés qui réduisent l'erreur et la friction." },
];

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-navy-100 bg-navy-50/50 py-20 sm:py-28">
        <Container>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-panoryx-blue">
            À propos de Panoryx
          </p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-navy sm:text-5xl">
            Panoramique visibilité. Connected operations.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-navy-500">
            Panoryx est né d&apos;un constat simple : les entreprises modernes, en particulier
            celles qui opèrent sur plusieurs sites, s&apos;appuient encore trop souvent sur des
            feuilles de calcul, des documents papier et des outils qui ne communiquent pas entre
            eux. Nous construisons une plateforme d&apos;opérations métier modulaire pour changer
            cela.
          </p>
          <GradientBands className="mt-10 h-12 w-40 opacity-80" />
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-2">
            <div>
              <SectionHeading
                eyebrow="Notre positionnement"
                title="Pas un ERP de plus. Un système d'exploitation d'entreprise."
              />
              <p className="mt-6 text-base leading-relaxed text-navy-500">
                Les ERP traditionnels imposent souvent un cadre rigide, coûteux à mettre en place
                et difficile à faire évoluer. Panoryx prend le parti inverse : une plateforme
                modulaire où chaque entreprise active les produits dont elle a besoin, tout en
                conservant une vue unifiée sur son organisation.
              </p>
              <p className="mt-4 text-base leading-relaxed text-navy-500">
                PanoStation, notre premier produit, s&apos;adresse aux réseaux de
                stations-service. D&apos;autres produits Panoryx viendront progressivement
                étendre la plateforme à d&apos;autres domaines opérationnels.
              </p>
            </div>
            <div>
              <SectionHeading eyebrow="Ce qui nous guide" title="Nos principes de conception" />
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                {values.map((v) => (
                  <div key={v.title} className="rounded-lg border border-navy-100 bg-white p-5">
                    <v.icon size={20} className="text-panoryx-blue" aria-hidden="true" />
                    <h3 className="mt-3 text-sm font-semibold text-navy">{v.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-navy-500">{v.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-navy-100 bg-navy py-20 sm:py-28">
        <Container className="text-center">
          <h2 className="mx-auto max-w-xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Envie d&apos;en discuter avec l&apos;équipe ?
          </h2>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/contact" size="lg">
              Nous contacter
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
