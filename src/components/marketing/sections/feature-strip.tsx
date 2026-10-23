import { Layers, Zap, Target, TrendingUp } from "lucide-react";
import { Container } from "@/components/ui/container";
import { FadeIn } from "@/components/motion/reveal";

const dots = [
  "var(--color-panoryx-blue)",
  "var(--color-signal-cyan)",
  "var(--color-flow-violet)",
  "var(--color-action-coral)",
  "var(--color-pulse-orange)",
];

const items = [
  { icon: Layers, label: "Données unifiées" },
  { icon: Zap, label: "Processus automatisés" },
  { icon: Target, label: "Décisions plus rapides" },
  { icon: TrendingUp, label: "Performance durable" },
];

export function FeatureStrip() {
  return (
    <section className="border-t border-navy-100 py-6">
      <Container>
        <FadeIn>
          <div className="flex flex-col gap-6 rounded-xl border border-navy-100 bg-navy-50/50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-8">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1" aria-hidden="true">
                {dots.map((c) => (
                  <span
                    key={c}
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </span>
              <p className="text-sm font-bold text-navy sm:text-base">
                Une plateforme. Une vue. Toute votre activité.
              </p>
            </div>

            <ul className="flex flex-wrap items-center gap-x-6 gap-y-3">
              {items.map((item) => (
                <li key={item.label} className="flex items-center gap-2 text-sm text-navy-500">
                  <item.icon size={16} className="text-navy-400" aria-hidden="true" />
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
