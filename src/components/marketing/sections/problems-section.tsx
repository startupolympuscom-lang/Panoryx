import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { X, Check } from "lucide-react";

const rowColors = [
  "var(--color-panoryx-blue)",
  "var(--color-signal-cyan)",
  "var(--color-flow-violet)",
  "var(--color-action-coral)",
];

const rows = [
  {
    before: "Fichiers Excel dispersés, mis à jour manuellement, sans historique fiable.",
    after: "Une source de données unique, à jour en permanence.",
  },
  {
    before: "Relevés papier et formulaires physiques qui se perdent facilement.",
    after: "Formulaires numériques accessibles depuis le terrain.",
  },
  {
    before: "Des logiciels déconnectés qui multiplient les ressaisies.",
    after: "Une seule plateforme connectée, du terrain à la direction.",
  },
  {
    before: "Des chiffres consolidés a posteriori, une fois par semaine ou par mois.",
    after: "Une visibilité en temps réel, à chaque instant.",
  },
];

export function ProblemsSection() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <FadeIn>
          <SectionHeading
            eyebrow="Ce que Panoryx remplace"
            title="Vos opérations méritent mieux qu'un patchwork d'outils."
            description="Panoryx remplace les processus fragmentés par une plateforme unique, connectée et à jour en permanence."
            align="center"
            className="mx-auto"
          />
        </FadeIn>

        <div className="relative mt-14 grid grid-cols-1 overflow-hidden rounded-2xl border border-navy-100 shadow-card lg:grid-cols-2">
          <div className="bg-navy-50/70 p-8 sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-navy-400">
              Sans Panoryx
            </p>
            <StaggerGroup as="ul" className="mt-7 space-y-6">
              {rows.map((r) => (
                <StaggerItem key={r.before} as="li" className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-200/70 text-navy-500">
                    <X size={13} strokeWidth={2.5} aria-hidden="true" />
                  </span>
                  <p className="text-sm leading-relaxed text-navy-500">{r.before}</p>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>

          <div className="relative bg-navy p-8 sm:p-10">
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              aria-hidden="true"
              style={{
                background:
                  "radial-gradient(ellipse 80% 60% at 100% 0%, rgba(40,92,255,0.35), transparent)",
              }}
            />
            <p className="relative text-xs font-bold uppercase tracking-[0.14em] text-signal-cyan">
              Avec Panoryx
            </p>
            <StaggerGroup as="ul" className="relative mt-7 space-y-6">
              {rows.map((r, i) => (
                <StaggerItem key={r.after} as="li" className="flex items-start gap-3.5">
                  <span
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: rowColors[i] }}
                  >
                    <Check size={13} strokeWidth={2.5} className="text-white" aria-hidden="true" />
                  </span>
                  <p className="text-sm font-medium leading-relaxed text-white">{r.after}</p>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>

          <div
            className="pointer-events-none absolute left-1/2 top-1/2 hidden h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-white shadow-card lg:flex"
            aria-hidden="true"
          >
            <span className="text-xs font-extrabold uppercase tracking-wide text-navy-400">
              vs
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
