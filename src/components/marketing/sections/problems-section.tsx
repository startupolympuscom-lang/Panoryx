import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { FileWarning, LayoutGrid, Sheet, Clock } from "lucide-react";

const problems = [
  {
    icon: Sheet,
    title: "Fichiers Excel dispersés",
    description:
      "Des dizaines de feuilles de calcul isolées, mises à jour manuellement, sans historique fiable ni source de vérité commune.",
  },
  {
    icon: FileWarning,
    title: "Paperasse opérationnelle",
    description:
      "Relevés papier, registres et formulaires physiques qui ralentissent les équipes terrain et se perdent facilement.",
  },
  {
    icon: LayoutGrid,
    title: "Outils déconnectés",
    description:
      "Des logiciels différents pour chaque fonction, qui ne communiquent pas entre eux et multiplient les ressaisies.",
  },
  {
    icon: Clock,
    title: "Reporting en retard",
    description:
      "Des chiffres consolidés a posteriori, une fois par semaine ou par mois, quand les décisions doivent se prendre maintenant.",
  },
];

export function ProblemsSection() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Ce que Panoryx remplace"
          title="Vos opérations méritent mieux qu'un patchwork d'outils."
          description="Panoryx remplace les processus fragmentés par une plateforme unique, connectée et à jour en permanence."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map((p) => (
            <div key={p.title} className="rounded-lg border border-navy-100 bg-white p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-action-coral/10 text-action-coral">
                <p.icon size={20} strokeWidth={2} aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-base font-semibold text-navy">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-500">{p.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
