"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { FadeIn } from "@/components/motion/reveal";
import { Fuel, Store, Warehouse, Building } from "lucide-react";

const industries = [
  { icon: Fuel, label: "Réseaux de stations-service", color: "var(--color-panoryx-blue)" },
  { icon: Store, label: "Commerces & retail multi-sites", color: "var(--color-signal-cyan)" },
  { icon: Warehouse, label: "Distributeurs & grossistes", color: "var(--color-flow-violet)" },
  { icon: Building, label: "Entreprises de services", color: "var(--color-action-coral)" },
];

const track = [...industries, ...industries];

export function IndustriesSection() {
  return (
    <section id="solutions" className="overflow-hidden py-20 sm:py-28">
      <Container>
        <FadeIn>
          <SectionHeading
            eyebrow="Secteurs desservis"
            title="Conçu pour les entreprises multi-sites et à forte cadence opérationnelle."
            align="center"
            className="mx-auto"
          />
        </FadeIn>
      </Container>

      <FadeIn delay={0.1} className="relative mt-14">
        <div
          className="pointer-events-none absolute inset-0 z-10"
          aria-hidden="true"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
          }}
        />
        <motion.div
          className="flex w-max gap-4"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
        >
          {track.map((ind, i) => (
            <div
              key={i}
              className="flex items-center gap-3 whitespace-nowrap rounded-full border border-navy-100 bg-white px-6 py-4 shadow-soft transition-colors hover:border-navy-200"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `color-mix(in srgb, ${ind.color} 12%, white)` }}
              >
                <ind.icon size={17} color={ind.color} strokeWidth={2} aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold text-navy-700">{ind.label}</span>
            </div>
          ))}
        </motion.div>
      </FadeIn>
    </section>
  );
}
