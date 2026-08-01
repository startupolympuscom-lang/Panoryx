import type { Metadata } from "next";
import { Mail, MapPin } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ContactForm } from "@/components/marketing/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez l'équipe Panoryx pour découvrir la plateforme, poser vos questions ou demander une démonstration de PanoStation.",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const isDemo = type === "demo";

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <SectionHeading
              eyebrow={isDemo ? "Demande de démo" : "Contact"}
              title={isDemo ? "Découvrez Panoryx en démonstration." : "Discutons de vos opérations."}
              description={
                isDemo
                  ? "Décrivez-nous votre réseau et vos besoins : notre équipe vous propose une démonstration adaptée, en particulier de PanoStation."
                  : "Que vous souhaitiez une démonstration de PanoStation ou simplement en savoir plus sur Panoryx, notre équipe vous répond rapidement."
              }
            />

            <div className="mt-10 space-y-5">
              <div className="flex items-start gap-3">
                <Mail size={18} className="mt-0.5 text-panoryx-blue" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-navy">E-mail</p>
                  <p className="text-sm text-navy-500">contact@panoryx.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 text-panoryx-blue" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-navy">Bureaux</p>
                  <p className="text-sm text-navy-500">Casablanca, Maroc</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-navy-100 bg-white p-6 shadow-card sm:p-8">
            <ContactForm variant={isDemo ? "demo" : "contact"} />
          </div>
        </div>
      </Container>
    </section>
  );
}
