"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Activity, Workflow, Building2, ShieldCheck } from "lucide-react";

const capabilities = [
  {
    icon: Activity,
    color: "var(--color-panoryx-blue)",
    title: "Visibilité en temps réel",
    description:
      "Les données remontent au fil de l'eau depuis le terrain : ventes, stocks, présence des équipes et incidents sont visibles dès qu'ils se produisent, pas le lendemain.",
    wide: true,
    visual: "live",
  },
  {
    icon: Workflow,
    color: "var(--color-flow-violet)",
    title: "Automatisation et standardisation",
    description:
      "Les processus répétitifs suivent des parcours standardisés, réduisant les erreurs de saisie et les oublis.",
    wide: false,
    visual: "flow",
  },
  {
    icon: Building2,
    color: "var(--color-signal-cyan)",
    title: "Gestion multi-sites",
    description:
      "Comparez la performance de vos différents sites et gardez une gouvernance cohérente sur l'ensemble de votre réseau.",
    wide: false,
    visual: "grid",
  },
  {
    icon: ShieldCheck,
    color: "var(--color-action-coral)",
    title: "Sécurité et contrôle des accès",
    description:
      "Des rôles précis déterminent qui peut voir et faire quoi, à l'échelle de l'organisation, d'un site ou d'un module, avec une traçabilité complète des actions.",
    wide: true,
    visual: "shield",
  },
];

export function CapabilitiesSection() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <FadeIn>
          <SectionHeading
            eyebrow="Ce que Panoryx apporte"
            title="Une vision panoramique, des opérations maîtrisées."
            align="center"
            className="mx-auto"
          />
        </FadeIn>
        <StaggerGroup className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c) => (
            <StaggerItem
              key={c.title}
              className={`group relative overflow-hidden rounded-2xl border border-navy-100 bg-white p-7 transition-shadow hover:shadow-card sm:col-span-2 ${
                c.wide ? "lg:col-span-2" : "lg:col-span-1"
              }`}
            >
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-[0.08] blur-2xl transition-opacity duration-300 group-hover:opacity-[0.16]"
                style={{ background: c.color }}
                aria-hidden="true"
              />
              <div className="relative flex items-start justify-between gap-4">
                <motion.div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `color-mix(in srgb, ${c.color} 12%, white)` }}
                  whileHover={{ scale: 1.08, rotate: -4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <c.icon size={22} color={c.color} strokeWidth={2} aria-hidden="true" />
                </motion.div>
                <CapabilityVisual kind={c.visual} color={c.color} />
              </div>
              <h3 className="relative mt-5 text-lg font-semibold text-navy">{c.title}</h3>
              <p className="relative mt-2.5 max-w-md text-sm leading-relaxed text-navy-500">
                {c.description}
              </p>
              <span
                className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                style={{ backgroundColor: c.color }}
                aria-hidden="true"
              />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}

function CapabilityVisual({ kind, color }: { kind: string; color: string }) {
  if (kind === "live") {
    return (
      <div className="hidden items-center gap-1.5 rounded-full border border-navy-100 bg-navy-50/70 px-2.5 py-1 sm:flex">
        <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
            style={{ backgroundColor: color }}
          />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wide text-navy-400">Live</span>
      </div>
    );
  }

  if (kind === "flow") {
    return (
      <div className="hidden items-center gap-1 sm:flex" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: color }}
            animate={{ opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.25, ease: "easeInOut" }}
          />
        ))}
      </div>
    );
  }

  if (kind === "grid") {
    return (
      <div className="hidden grid-cols-3 gap-1 sm:grid" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-[2px]"
            style={{ backgroundColor: i === 1 || i === 4 ? color : "var(--color-navy-100)" }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="relative hidden h-6 w-6 sm:block" aria-hidden="true">
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{ border: `1.5px solid ${color}` }}
        animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
      />
      <span
        className="absolute inset-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}
