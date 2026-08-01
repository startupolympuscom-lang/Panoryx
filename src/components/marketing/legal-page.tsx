import { Container } from "@/components/ui/container";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-16 sm:py-24">
      <Container className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">{title}</h1>
        <div className="mt-8 space-y-4 text-sm leading-relaxed text-navy-500">{children}</div>
      </Container>
    </section>
  );
}
