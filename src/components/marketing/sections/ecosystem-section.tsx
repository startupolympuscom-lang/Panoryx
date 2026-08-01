import { ArrowRight, Plus } from "lucide-react";
import { Container } from "@/components/ui/container";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion/reveal";

const panostationTags = ["Ventes", "Cuves & stocks", "Équipes"];

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

          <StaggerGroup className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-0 lg:flex-1 lg:grid-cols-4">
            <StaggerItem className="rounded-xl border border-navy-100 bg-white p-6 shadow-card">
              <p className="text-xl font-bold tracking-tight">
                <span className="text-navy">Pano</span>
                <span className="text-panoryx-blue">Station</span>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-navy-500">
                Le cockpit opérationnel des stations-service
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {panostationTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-navy-100 bg-navy-50 px-2.5 py-1 text-xs font-medium text-navy-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <a
                href="/produits/panostation"
                className="group mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-panoryx-blue hover:text-[#1e4cf0]"
              >
                Explorer PanoStation
                <ArrowRight
                  size={15}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </a>
            </StaggerItem>

            {[0, 1, 2].map((i) => (
              <StaggerItem
                key={i}
                className="flex flex-col items-center justify-center rounded-xl border border-dashed border-navy-200 bg-white/60 p-6 text-center transition-colors hover:border-navy-300 hover:bg-white"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-navy-200 text-navy-400">
                  <Plus size={18} aria-hidden="true" />
                </div>
                <p className="mt-4 text-sm font-semibold text-navy-700">Prochain module</p>
                <p className="mt-1 text-xs text-navy-400">Bientôt disponible</p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </Container>
    </section>
  );
}
