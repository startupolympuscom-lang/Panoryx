"use client";

import Image from "next/image";
import Link from "next/link";
import { Cairo } from "next/font/google";
import {
  Fuel,
  Gauge,
  Users,
  Truck,
  Wallet,
  Wrench,
  AlertTriangle,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { PanoramicArcs } from "@/components/brand/graphic-devices";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { formatMAD } from "@/lib/utils";
import { panostationCopy, panostationLocales } from "@/lib/i18n/panostation-content";
import { usePanostationLocale } from "@/lib/i18n/use-panostation-locale";
import { PanostationLanguageSwitcher } from "./language-switcher";
import { cn } from "@/lib/utils";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const moduleIcons = [Fuel, Gauge, Gauge, Truck, Wallet, Users, Truck, Wrench, AlertTriangle, BarChart3];

export function PanostationLanding() {
  // Reads/writes the visitor's language choice via useSyncExternalStore, so
  // the server snapshot (Darija) matches first paint and a returning
  // visitor's saved language applies as soon as the client reads it.
  const [locale, handleChangeLocale] = usePanostationLocale();

  const t = panostationCopy[locale];
  const meta = panostationLocales.find((l) => l.code === locale)!;
  const isRtl = meta.dir === "rtl";
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div dir={meta.dir} className={cn(isRtl && cairo.variable)}>
      <section className="relative overflow-hidden bg-navy py-20 sm:py-28">
        <PanoramicArcs
          strokeWidth={5}
          className={cn(
            "pointer-events-none absolute -top-32 h-[520px] w-[520px] opacity-50",
            isRtl ? "-left-32" : "-right-32"
          )}
        />
        <Container className="relative">
          <div className="mb-8 flex justify-end">
            <PanostationLanguageSwitcher value={locale} onChange={handleChangeLocale} />
          </div>
          <StaggerGroup once amount={0.6}>
            <StaggerItem>
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.16em] text-signal-cyan">
                {t.hero.eyebrow}
              </p>
            </StaggerItem>
            <StaggerItem>
              <Image
                src="/brand/panostation/panostation-logo-dark.png"
                alt="PanoStation"
                width={1744}
                height={887}
                priority
                className="h-10 w-auto sm:h-12"
              />
            </StaggerItem>
            <StaggerItem>
              <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
                {t.hero.title}
              </h1>
            </StaggerItem>
            <StaggerItem>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-navy-200">{t.hero.subtitle}</p>
            </StaggerItem>
            <StaggerItem>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button href="/contact?type=demo" size="lg">
                  {t.hero.ctaDemo}
                </Button>
                <Button
                  href="/app/panostation"
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-transparent text-white hover:border-signal-cyan hover:text-signal-cyan"
                >
                  {t.hero.ctaAccess}
                </Button>
              </div>
            </StaggerItem>
          </StaggerGroup>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <FadeIn>
            <SectionHeading eyebrow={t.benefits.eyebrow} title={t.benefits.title} />
          </FadeIn>
          <StaggerGroup className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {t.benefits.items.map((b) => (
              <StaggerItem
                key={b.title}
                className="rounded-lg border border-navy-100 bg-white p-6 transition-shadow hover:shadow-card"
              >
                <h3 className="text-base font-semibold text-navy">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-500">{b.description}</p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </section>

      <section className="border-t border-navy-100 bg-navy-50/50 py-20 sm:py-28">
        <Container>
          <FadeIn>
            <SectionHeading eyebrow={t.modules.eyebrow} title={t.modules.title} />
          </FadeIn>
          <StaggerGroup className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {t.modules.items.map((m, i) => {
              const Icon = moduleIcons[i];
              return (
                <StaggerItem
                  key={m.title}
                  className="flex gap-4 rounded-lg border border-navy-100 bg-white p-5 transition-shadow hover:shadow-card"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-panoryx-blue/10 text-panoryx-blue">
                    <Icon size={18} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-navy">{m.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-navy-500">{m.description}</p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <FadeIn>
              <SectionHeading
                eyebrow={t.dashboardSection.eyebrow}
                title={t.dashboardSection.title}
                description={t.dashboardSection.description}
              />
              <ul className="mt-8 space-y-3">
                {t.dashboardSection.bullets.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm font-medium text-navy-700">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-panoryx-blue" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </FadeIn>
            <FadeIn delay={0.15} y={30}>
              <DashboardPreview label={t.dashboardPreview.label} change={t.dashboardPreview.change} />
            </FadeIn>
          </div>
        </Container>
      </section>

      <section className="border-t border-navy-100 bg-navy-50/50 py-20 sm:py-28">
        <Container>
          <FadeIn>
            <SectionHeading eyebrow={t.workflow.eyebrow} title={t.workflow.title} />
          </FadeIn>
          <StaggerGroup as="ol" className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {t.workflow.steps.map((step, i) => (
              <StaggerItem
                key={step}
                as="li"
                className="rounded-lg border border-navy-100 bg-white p-5 transition-shadow hover:shadow-card"
              >
                <span className="brand-gradient-text text-xl font-extrabold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 text-sm font-medium text-navy-700">{step}</p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <FadeIn>
              <SectionHeading
                eyebrow={t.roles.eyebrow}
                title={t.roles.title}
                description={t.roles.description}
              />
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="mb-6 flex items-center gap-2 text-sm font-semibold text-navy">
                <ShieldCheck size={18} className="text-panoryx-blue" aria-hidden="true" />
                {t.roles.accessBasedOnRoles}
              </div>
              <div className="overflow-hidden rounded-lg border border-navy-100">
                <table className="w-full text-sm">
                  <tbody>
                    {t.roles.items.map((r, i) => (
                      <tr key={r.role} className={i % 2 === 0 ? "bg-white" : "bg-navy-50/50"}>
                        <td className="px-4 py-3 font-medium text-navy">{r.role}</td>
                        <td className="px-4 py-3 text-navy-500">{r.access}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      <section className="border-t border-navy-100 bg-navy py-20 sm:py-28">
        <Container className="text-center">
          <FadeIn amount={0.6}>
            <h2 className="mx-auto max-w-xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t.finalCta.title}
            </h2>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href="/contact?type=demo" size="lg">
                {t.finalCta.ctaDemo}
              </Button>
              <Link
                href="/app/panostation"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-signal-cyan hover:underline"
              >
                {t.finalCta.ctaAccess}
                <ArrowIcon size={15} aria-hidden="true" />
              </Link>
            </div>
          </FadeIn>
        </Container>
      </section>
    </div>
  );
}

function DashboardPreview({ label, change }: { label: string; change: string }) {
  const stations = [
    { name: "Casablanca Centre", sales: 412800, margin: "8,4 %" },
    { name: "Rabat Agdal", sales: 298150, margin: "7,9 %" },
    { name: "Marrakech Guéliz", sales: 356900, margin: "8,1 %" },
    { name: "Tanger Centre", sales: 231400, margin: "7,6 %" },
  ];

  return (
    <div className="rounded-xl border border-navy-100 bg-white p-5 shadow-card sm:p-6">
      <div className="flex items-center justify-between border-b border-navy-100 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-navy" dir="ltr">
            {formatMAD(1299250)}
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          {change}
        </span>
      </div>
      <ul className="mt-4 divide-y divide-navy-100">
        {stations.map((s) => (
          <li key={s.name} className="flex items-center justify-between py-3">
            <span className="text-sm font-medium text-navy">{s.name}</span>
            <div className="flex items-center gap-4" dir="ltr">
              <span className="text-sm text-navy-500">{formatMAD(s.sales)}</span>
              <span className="w-14 text-right text-sm font-semibold text-panoryx-blue">{s.margin}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
