import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { PanoramicArcs } from "@/components/brand/graphic-devices";

export function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden border-t border-navy-100 bg-navy py-20 sm:py-28">
      <PanoramicArcs
        strokeWidth={5}
        className="pointer-events-none absolute -left-40 top-1/2 h-[520px] w-[520px] -translate-y-1/2 opacity-30"
      />
      <Container className="relative text-center">
        <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Prêt à centraliser vos opérations ?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-navy-200 sm:text-lg">
          Échangez avec notre équipe pour découvrir comment Panoryx peut s&apos;adapter à votre
          organisation et à votre réseau de sites.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/contact?type=demo" size="lg">
            Demander une démo
          </Button>
          <Button
            href="/inscription"
            size="lg"
            variant="outline"
            className="border-white/20 bg-transparent text-white hover:border-signal-cyan hover:text-signal-cyan"
          >
            Créer un compte
          </Button>
        </div>
      </Container>
    </section>
  );
}
