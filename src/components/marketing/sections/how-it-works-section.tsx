import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { OpenViewports } from "@/components/brand/graphic-devices";

const steps = [
  {
    number: "01",
    title: "Activez les modules dont vous avez besoin",
    description:
      "Chaque produit Panoryx couvre un domaine opérationnel précis. Vous activez uniquement ce qui est utile à votre activité, sans complexité superflue.",
  },
  {
    number: "02",
    title: "Connectez vos équipes et vos sites",
    description:
      "Les modules partagent une même base de données organisationnelle : utilisateurs, sites, rôles et permissions sont centralisés une fois pour toutes.",
  },
  {
    number: "03",
    title: "Pilotez depuis une vision unifiée",
    description:
      "Quel que soit le nombre de produits activés, vous gardez une vue d'ensemble cohérente de votre entreprise, en temps réel.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="pourquoi-panoryx" className="border-t border-navy-100 bg-navy-50/50 py-20 sm:py-28">
      <Container>
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Comment fonctionne la plateforme"
              title="Une plateforme modulaire, pas un ERP monolithique."
              description="Panoryx n'impose pas un bloc unique et rigide. Vous construisez progressivement votre système d'exploitation d'entreprise, module après module."
            />
            <ol className="mt-10 space-y-8">
              {steps.map((s) => (
                <li key={s.number} className="flex gap-5">
                  <span className="brand-gradient-text text-2xl font-extrabold">{s.number}</span>
                  <div>
                    <h3 className="text-base font-semibold text-navy">{s.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-navy-500">{s.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="relative flex items-center justify-center">
            <OpenViewports className="h-64 w-64 animate-[spin_18s_linear_infinite] motion-reduce:animate-none sm:h-80 sm:w-80" />
            <div className="absolute flex flex-col items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-navy-500">
                Panoryx
              </span>
              <span className="mt-1 text-sm font-semibold text-navy">Vue unifiée</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
