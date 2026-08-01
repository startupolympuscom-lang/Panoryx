"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Fuel, Store, Warehouse, Building } from "lucide-react";

const industries = [
  { icon: Fuel, label: "Réseaux de stations-service" },
  { icon: Store, label: "Commerces & retail multi-sites" },
  { icon: Warehouse, label: "Distributeurs & grossistes" },
  { icon: Building, label: "Entreprises de services" },
];

export function IndustriesSection() {
  return (
    <section id="solutions" className="py-20 sm:py-28">
      <Container>
        <FadeIn>
          <SectionHeading
            eyebrow="Secteurs desservis"
            title="Conçu pour les entreprises multi-sites et à forte cadence opérationnelle."
            align="center"
            className="mx-auto"
          />
        </FadeIn>
        <StaggerGroup className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {industries.map((ind) => (
            <StaggerItem key={ind.label} className="flex flex-col items-center text-center">
              <motion.div
                whileHover={{ scale: 1.08, borderColor: "var(--color-panoryx-blue)" }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="flex h-16 w-16 items-center justify-center rounded-full border border-navy-100 bg-navy-50 text-panoryx-blue"
              >
                <ind.icon size={26} aria-hidden="true" />
              </motion.div>
              <p className="mt-4 text-sm font-medium text-navy-700">{ind.label}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
