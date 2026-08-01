import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PanoramicArcs, Flowlines } from "@/components/brand/graphic-devices";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy">
      <div className="absolute inset-0" aria-hidden="true">
        <PanoramicArcs
          strokeWidth={5}
          className="absolute -right-32 -top-40 h-[560px] w-[560px] opacity-60 sm:h-[720px] sm:w-[720px]"
        />
        <Flowlines
          strokeWidth={5}
          className="absolute -bottom-24 -left-24 h-72 w-72 -scale-x-100 opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/0 via-navy/40 to-navy" />
      </div>

      <Container className="relative py-24 sm:py-32 lg:py-36">
        <div className="max-w-3xl">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-signal-cyan">
            Plateforme d&apos;opérations métier
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Le système d&apos;exploitation des entreprises modernes.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-navy-200">
            Panoryx réunit vos équipes, vos processus et vos données dans une plateforme
            modulaire conçue pour vous donner une visibilité complète sur vos opérations.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button href="/contact?type=demo" size="lg">
              Demander une démo
            </Button>
            <Button
              href="/produits/panostation"
              size="lg"
              variant="outline"
              className="border-white/20 bg-transparent text-white hover:border-signal-cyan hover:text-signal-cyan"
            >
              Découvrir PanoStation
            </Button>
          </div>
        </div>

        <div className="relative mt-20">
          <OperationsVisual />
        </div>
      </Container>
    </section>
  );
}

/**
 * Original branded visual representing connected operational modules,
 * real-time data flow, and panoramic visibility — built from the charter's
 * flowline / open-viewport language rather than a generic 3D illustration.
 */
function OperationsVisual() {
  const modules = [
    { label: "Ventes", value: "1 284 320 MAD", color: "var(--color-panoryx-blue)" },
    { label: "Stocks carburant", value: "94 300 L", color: "var(--color-signal-cyan)" },
    { label: "Quarts actifs", value: "12", color: "var(--color-flow-violet)" },
    { label: "Alertes", value: "3", color: "var(--color-action-coral)" },
  ];

  return (
    <div className="relative rounded-xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm sm:p-8">
      <svg
        viewBox="0 0 800 220"
        fill="none"
        className="absolute inset-0 h-full w-full opacity-40"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 180 C 150 140, 250 200, 400 120 S 650 40, 800 90"
          stroke="var(--color-panoryx-blue)"
          strokeWidth="2"
        />
        <path
          d="M0 140 C 150 180, 300 100, 450 150 S 650 200, 800 130"
          stroke="var(--color-signal-cyan)"
          strokeWidth="2"
        />
        <path
          d="M0 100 C 200 60, 300 160, 500 100 S 700 60, 800 60"
          stroke="var(--color-flow-violet)"
          strokeWidth="2"
        />
      </svg>
      <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
        {modules.map((m) => (
          <div
            key={m.label}
            className="rounded-lg border border-white/10 bg-navy-800/60 p-4"
          >
            <span
              className="mb-3 block h-1.5 w-8 rounded-full"
              style={{ backgroundColor: m.color }}
            />
            <p className="text-xs font-medium text-navy-300">{m.label}</p>
            <p className="mt-1 text-lg font-bold text-white">{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
