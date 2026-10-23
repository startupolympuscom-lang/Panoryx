"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { PanoramicArcs } from "@/components/brand/graphic-devices";
import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";

export function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden border-t border-navy-100 bg-navy py-20 sm:py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        aria-hidden="true"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.14) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 60% 80% at 50% 50%, black, transparent)",
        }}
      />
      <PanoramicArcs
        strokeWidth={5}
        className="pointer-events-none absolute -left-40 top-1/2 h-[520px] w-[520px] -translate-y-1/2 opacity-30"
      />
      <PanoramicArcs
        strokeWidth={5}
        className="pointer-events-none absolute -right-40 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rotate-180 opacity-20"
      />
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.22] blur-[110px]"
        aria-hidden="true"
        style={{ background: "radial-gradient(circle, var(--color-panoryx-blue), transparent 70%)" }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.18, 0.28, 0.18] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      <Container className="relative text-center">
        <StaggerGroup amount={0.6}>
          <StaggerItem>
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Prêt à centraliser vos opérations ?
            </h2>
          </StaggerItem>
          <StaggerItem>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-navy-200 sm:text-lg">
              Échangez avec notre équipe pour découvrir comment Panoryx peut s&apos;adapter à
              votre organisation et à votre réseau de sites.
            </p>
          </StaggerItem>
          <StaggerItem>
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
          </StaggerItem>
        </StaggerGroup>
      </Container>
    </section>
  );
}
