import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Fuel, Gauge, Users, Truck } from "lucide-react";

const modules = [
  { icon: Fuel, label: "Ventes carburant" },
  { icon: Gauge, label: "Cuves & compteurs" },
  { icon: Users, label: "Équipes & quarts" },
  { icon: Truck, label: "Livraisons & fournisseurs" },
];

export function FeaturedProductSection() {
  return (
    <section className="border-t border-navy-100 py-20 sm:py-28">
      <Container>
        <FadeIn className="overflow-hidden rounded-xl bg-navy">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 sm:p-12 lg:p-14">
              <Badge tone="info" className="bg-white/10 text-signal-cyan">
                Produit phare
              </Badge>
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                PanoStation
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-navy-200">
                Pilotez chaque station. Maîtrisez chaque opération. PanoStation centralise les
                ventes, les stocks de carburant, les équipes, les fournisseurs et les opérations
                quotidiennes de votre réseau de stations-service.
              </p>

              <StaggerGroup className="mt-8 grid grid-cols-2 gap-4" amount={0.6}>
                {modules.map((m) => (
                  <StaggerItem key={m.label} className="flex items-center gap-2.5 text-sm text-navy-100">
                    <m.icon size={17} className="text-signal-cyan" aria-hidden="true" />
                    {m.label}
                  </StaggerItem>
                ))}
              </StaggerGroup>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button href="/produits/panostation" size="md">
                  Découvrir PanoStation
                </Button>
                <Button
                  href="/contact?type=demo"
                  size="md"
                  variant="outline"
                  className="border-white/20 bg-transparent text-white hover:border-signal-cyan hover:text-signal-cyan"
                >
                  Demander une démo
                </Button>
              </div>
            </div>

            <PanoStationPreview />
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}

function PanoStationPreview() {
  const stations = [
    { name: "Casablanca Centre", sales: "412 800 MAD", status: "En ligne" },
    { name: "Rabat Agdal", sales: "298 150 MAD", status: "En ligne" },
    { name: "Marrakech Guéliz", sales: "356 900 MAD", status: "Alerte stock" },
  ];

  return (
    <div className="relative flex items-center justify-center bg-navy-800/60 p-8 sm:p-12 lg:p-14">
      <div className="w-full max-w-sm rounded-lg border border-white/10 bg-navy-900/80 p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-300">
            Vue réseau
          </p>
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal-cyan/60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-signal-cyan" />
          </span>
        </div>
        <ul className="mt-4 space-y-3">
          {stations.map((s) => (
            <li
              key={s.name}
              className="flex items-center justify-between rounded-md bg-white/[0.04] px-3.5 py-3"
            >
              <div>
                <p className="text-sm font-medium text-white">{s.name}</p>
                <p className="text-xs text-navy-300">{s.sales}</p>
              </div>
              <span
                className={
                  s.status === "Alerte stock"
                    ? "text-xs font-semibold text-pulse-orange"
                    : "text-xs font-semibold text-signal-cyan"
                }
              >
                {s.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
