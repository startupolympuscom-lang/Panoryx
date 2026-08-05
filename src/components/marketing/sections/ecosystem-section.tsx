import Image from "next/image";
import { ArrowRight, Fuel, Gauge, Users, Plus } from "lucide-react";
import { Container } from "@/components/ui/container";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion/reveal";

const panostationTags = [
  { icon: Fuel, label: "Ventes" },
  { icon: Gauge, label: "Cuves & stocks" },
  { icon: Users, label: "Équipes" },
];

export function EcosystemSection() {
  return (
    <section className="border-t border-navy-100 bg-navy-50/50 py-20 sm:py-28">
      <Container>
        <div className="lg:flex lg:items-stretch lg:gap-8">
          <FadeIn className="lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:justify-center">
            <h2 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              Un écosystème conçu pour chaque opération.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-navy-500">
              Des produits modulaires et connectés pour piloter l&apos;ensemble de votre
              activité, de bout en bout.
            </p>
          </FadeIn>

          <StaggerGroup className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-0 lg:flex-1 lg:grid-cols-3">
            <StaggerItem className="group relative overflow-hidden rounded-xl border border-navy-100 bg-white p-7 shadow-card sm:col-span-2 lg:col-span-2 lg:row-span-3">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--color-panoryx-blue),var(--color-signal-cyan),var(--color-flow-violet),var(--color-action-coral))]"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-panoryx-blue/10 blur-3xl transition-opacity duration-300 group-hover:opacity-80"
              />
              <div className="relative">
                <span className="inline-flex items-center rounded-full bg-panoryx-blue/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-panoryx-blue">
                  Produit disponible
                </span>
                <Image
                  src="/brand/panostation/panostation-logo-light.png"
                  alt="PanoStation"
                  width={1744}
                  height={887}
                  className="mt-4 h-9 w-auto"
                />
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-navy-500">
                  Le cockpit opérationnel des stations-service : ventes, cuves, équipes et
                  fournisseurs, pilotés depuis une seule plateforme.
                </p>
                <ul className="mt-6 space-y-2.5">
                  {panostationTags.map((tag) => (
                    <li key={tag.label} className="flex items-center gap-2.5 text-sm text-navy-600">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-navy-50 text-navy-500">
                        <tag.icon size={14} aria-hidden="true" />
                      </span>
                      {tag.label}
                    </li>
                  ))}
                </ul>
                <a
                  href="/produits/panostation"
                  className="group/link mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-panoryx-blue hover:text-[#1e4cf0]"
                >
                  Explorer PanoStation
                  <ArrowRight
                    size={15}
                    className="transition-transform duration-200 group-hover/link:translate-x-1"
                    aria-hidden="true"
                  />
                </a>
              </div>
            </StaggerItem>

            {[0, 1, 2].map((i) => (
              <StaggerItem
                key={i}
                className="flex items-center gap-4 rounded-xl border border-dashed border-navy-200 bg-white/60 p-5 transition-colors hover:border-navy-300 hover:bg-white"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-navy-200 text-navy-400">
                  <Plus size={16} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy-700">Prochain module</p>
                  <p className="text-xs text-navy-400">Bientôt disponible</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </Container>
    </section>
  );
}
