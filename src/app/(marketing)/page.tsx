import { Hero } from "@/components/marketing/sections/hero";
import { FeatureStrip } from "@/components/marketing/sections/feature-strip";
import { ProblemsSection } from "@/components/marketing/sections/problems-section";
import { HowItWorksSection } from "@/components/marketing/sections/how-it-works-section";
import { CapabilitiesSection } from "@/components/marketing/sections/capabilities-section";
import { FeaturedProductSection } from "@/components/marketing/sections/featured-product-section";
import { EcosystemSection } from "@/components/marketing/sections/ecosystem-section";
import { IndustriesSection } from "@/components/marketing/sections/industries-section";
import { PartnersSection } from "@/components/marketing/sections/partners-section";
import { FinalCtaSection } from "@/components/marketing/sections/final-cta-section";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeatureStrip />
      <ProblemsSection />
      <HowItWorksSection />
      <CapabilitiesSection />
      <FeaturedProductSection />
      <EcosystemSection />
      <IndustriesSection />
      <PartnersSection />
      <FinalCtaSection />
    </>
  );
}
