import Image from "next/image";
import { Container } from "@/components/ui/container";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion/reveal";

const partners = [
  {
    name: "Al Akhawayn University",
    src: "/brand/partners/al-akhawayn-university.png",
    width: 250,
    height: 201,
  },
  {
    name: "Startup Olympus",
    src: "/brand/partners/startup-olympus.png",
    width: 1977,
    height: 700,
  },
];

export function PartnersSection() {
  return (
    <section className="border-t border-navy-100 py-16 sm:py-20">
      <Container>
        <FadeIn>
          <p className="text-center text-xs font-bold uppercase tracking-[0.14em] text-navy-400">
            Ils accompagnent Panoryx
          </p>
        </FadeIn>
        <StaggerGroup className="mt-10 flex flex-wrap items-center justify-center gap-x-16 gap-y-10">
          {partners.map((p) => (
            <StaggerItem key={p.name} className="flex items-center justify-center">
              <Image
                src={p.src}
                alt={p.name}
                width={p.width}
                height={p.height}
                className="h-12 w-auto object-contain grayscale opacity-70 transition-all duration-200 hover:grayscale-0 hover:opacity-100 sm:h-14"
              />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
