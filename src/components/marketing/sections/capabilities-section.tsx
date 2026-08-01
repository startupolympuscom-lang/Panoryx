import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Activity, Workflow, Building2, ShieldCheck } from "lucide-react";

const capabilities = [
  {
    icon: Activity,
    color: "var(--color-panoryx-blue)",
    title: "Visibilité en temps réel",
    description:
      "Les données remontent au fil de l'eau depuis le terrain : ventes, stocks, présence des équipes et incidents sont visibles dès qu'ils se produisent, pas le lendemain.",
  },
  {
    icon: Workflow,
    color: "var(--color-flow-violet)",
    title: "Automatisation et standardisation",
    description:
      "Les processus répétitifs — ouverture de quart, relevés, rapprochements — suivent des parcours standardisés, réduisant les erreurs de saisie et les oublis.",
  },
  {
    icon: Building2,
    color: "var(--color-signal-cyan)",
    title: "Gestion multi-sites",
    description:
      "Comparez la performance de vos différents sites, appliquez des règles communes et gardez une gouvernance cohérente sur l'ensemble de votre réseau.",
  },
  {
    icon: ShieldCheck,
    color: "var(--color-action-coral)",
    title: "Sécurité et contrôle des accès",
    description:
      "Des rôles précis déterminent qui peut voir et faire quoi, à l'échelle de l'organisation, d'un site ou d'un module, avec une traçabilité complète des actions.",
  },
];

export function CapabilitiesSection() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Ce que Panoryx apporte"
          title="Une vision panoramique, des opérations maîtrisées."
          align="center"
          className="mx-auto"
        />
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {capabilities.map((c) => (
            <div
              key={c.title}
              className="group relative overflow-hidden rounded-lg border border-navy-100 bg-white p-7"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-md"
                style={{ backgroundColor: `color-mix(in srgb, ${c.color} 12%, white)` }}
              >
                <c.icon size={22} color={c.color} strokeWidth={2} aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-navy">{c.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-navy-500">{c.description}</p>
              <span
                className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                style={{ backgroundColor: c.color }}
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
