import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Fuel, Gauge, Users } from "lucide-react";
import { Container } from "@/components/ui/container";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { products } from "@/lib/data/products";

const panostationTags = [
  { icon: Fuel, label: "Ventes" },
  { icon: Gauge, label: "Cuves & stocks" },
  { icon: Users, label: "Équipes" },
];

const upcoming = products.filter((p) => p.availability === "bientot-disponible");

export function EcosystemSection() {
  return (
    <section className="border-t border-navy-100 bg-navy-50/50 py-20 sm:py-28">
      <Container>
        <FadeIn>
          <h2 className="mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            Un seul partenaire. Un produit par métier.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-navy-500">
            PanoStation est le premier d&apos;une famille de produits Panoryx, chacun conçu pour
            un domaine opérationnel précis — et tous connectés à la même organisation.
          </p>
        </FadeIn>

        <StaggerGroup className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StaggerItem className="group relative overflow-hidden rounded-xl border border-navy-100 bg-white p-7 shadow-card sm:col-span-2 lg:col-span-2 lg:row-span-2">
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
                className="-ml-2 mt-3 h-14 w-auto"
              />
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-navy-500">
                Le cockpit opérationnel des stations-service : ventes, cuves, équipes et
                fournisseurs, pilotés depuis une seule plateforme.
              </p>
              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2.5">
                {panostationTags.map((tag) => (
                  <li key={tag.label} className="flex items-center gap-2.5 text-sm text-navy-600">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-navy-50 text-navy-500">
                      <tag.icon size={14} aria-hidden="true" />
                    </span>
                    {tag.label}
                  </li>
                ))}
              </ul>
              <Link
                href="/produits/panostation"
                className="group/link mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-panoryx-blue hover:text-[#1e4cf0]"
              >
                Explorer PanoStation
                <ArrowRight
                  size={15}
                  className="transition-transform duration-200 group-hover/link:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </StaggerItem>

          {upcoming.map((p) => (
            <StaggerItem
              key={p.slug}
              className="flex flex-col gap-3 rounded-xl border border-dashed border-navy-200 bg-white/60 p-5 transition-colors hover:border-navy-300 hover:bg-white"
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `color-mix(in srgb, ${p.accentColor} 14%, white)` }}
                >
                  <p.icon size={18} color={p.accentColor} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-snug text-navy-700">{p.name}</p>
                  <p className="text-xs text-navy-400">Bientôt disponible</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-navy-500">{p.tagline}</p>
              <p className="mt-auto text-[11px] font-semibold uppercase tracking-wide text-navy-400">{p.sector}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
