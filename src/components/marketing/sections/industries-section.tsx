import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Fuel, Store, Warehouse, Building } from "lucide-react";

const industries = [
  { icon: Fuel, label: "Réseaux de stations-service" },
  { icon: Store, label: "Commerces & retail multi-sites" },
  { icon: Warehouse, label: "Distributeurs & grossistes" },
  { icon: Building, label: "Entreprises de services" },
];

export function IndustriesSection() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Secteurs desservis"
          title="Conçu pour les entreprises multi-sites et à forte cadence opérationnelle."
          align="center"
          className="mx-auto"
        />
        <div className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {industries.map((ind) => (
            <div key={ind.label} className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-navy-100 bg-navy-50 text-panoryx-blue">
                <ind.icon size={26} aria-hidden="true" />
              </div>
              <p className="mt-4 text-sm font-medium text-navy-700">{ind.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
