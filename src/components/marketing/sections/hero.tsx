"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PanoryxMark } from "@/components/brand/logo";
import { products } from "@/lib/data/products";
import {
  ArrowRight,
  LayoutDashboard,
  LineChart,
  Box,
  ShoppingCart,
  DollarSign,
  Users,
  Settings,
  SlidersHorizontal,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

const easeOut = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: easeOut } },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const letterVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
};

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div
        className="absolute inset-0 opacity-[0.5]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--color-navy-200) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 70% 60% at 70% 35%, black, transparent)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          className="absolute -right-24 top-10 h-[420px] w-[420px] rounded-full opacity-[0.25] blur-[110px]"
          style={{
            background: "radial-gradient(circle, var(--color-panoryx-blue), transparent 70%)",
          }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.22, 0.3, 0.22] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-40 bottom-0 h-[360px] w-[360px] rounded-full opacity-[0.18] blur-[100px]"
          style={{
            background: "radial-gradient(circle, var(--color-flow-violet), transparent 70%)",
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.24, 0.15] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />
      </div>

      <Container className="relative pt-14 pb-16 sm:pt-20 sm:pb-24 xl:pt-24 xl:pb-28">
        <div className="grid grid-cols-1 items-center gap-14 xl:grid-cols-[29rem_minmax(0,1fr)] xl:gap-10">
          <motion.div className="max-w-xl" variants={container} initial="hidden" animate="show">
            <motion.p
              variants={fadeUp}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-panoryx-blue/15 bg-panoryx-blue/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-panoryx-blue"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-panoryx-blue" aria-hidden="true" />
              Une famille de logiciels métier
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="text-5xl font-bold tracking-tight text-navy sm:text-6xl xl:text-[3.5rem] xl:leading-[1.04]"
            >
              {"Voyez tout.".split("").map((char, i) => (
                <motion.span key={`l1-${i}`} variants={letterVariants} className="inline-block">
                  {char === " " ? "\u00a0" : char}
                </motion.span>
              ))}
              <br />
              <motion.span
                className="brand-gradient-text inline-block"
                variants={{
                  hidden: { opacity: 0, y: 14 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut, delay: 0.25 } },
                }}
              >
                Pilotez mieux.
              </motion.span>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 text-lg leading-relaxed text-navy-500">
              Panoryx est le système d&apos;exploitation de votre entreprise&nbsp;: un logiciel
              taillé pour chaque métier, tous reliés à la même organisation et à la même vue
              d&apos;ensemble.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Button href="/contact?type=demo" size="lg" className="shrink-0">
                Demander une démo
              </Button>
              <Button
                href="/produits"
                size="lg"
                variant="ghost"
                className="group shrink-0 gap-2 px-1 text-panoryx-blue hover:bg-transparent hover:text-[#1e4cf0]"
              >
                Découvrir nos produits
                <ArrowRight
                  size={17}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Button>
            </motion.div>
            <motion.div variants={fadeUp} className="mt-10 border-t border-navy-100 pt-6">
              <ProductStrip />
            </motion.div>
          </motion.div>

          <motion.div
            className="xl:hidden"
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.45, ease: easeOut }}
          >
            <MobileDashboard />
          </motion.div>

          <motion.div
            className="hidden xl:block"
            initial={{ opacity: 0, x: 30, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.45, ease: easeOut }}
          >
            <DesktopOperationsVisual />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

/**
 * Makes the "family of products, not one tool" claim concrete in the fold:
 * PanoStation shown live, the rest of the roadmap right next to it.
 */
function ProductStrip() {
  const live = products.filter((p) => p.availability === "disponible");
  const upcoming = products.filter((p) => p.availability !== "disponible");

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 text-sm">
      {live.map((p) => (
        <Link
          key={p.slug}
          href={`/produits/${p.slug}`}
          className="inline-flex items-center gap-2 rounded-full border border-panoryx-blue/20 bg-white px-3 py-1.5 font-semibold text-navy shadow-soft transition-colors hover:border-panoryx-blue/40"
        >
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          {p.shortName}
          <span className="text-xs font-medium text-emerald-600">Disponible</span>
        </Link>
      ))}
      <Link href="/produits" className="group inline-flex flex-wrap items-center gap-x-2 text-navy-400">
        <span className="text-xs font-bold uppercase tracking-[0.12em]">Bientôt</span>
        {upcoming.map((p, i) => (
          <span key={p.slug} className="font-medium text-navy-500 transition-colors group-hover:text-navy-700">
            {p.shortName}
            {i < upcoming.length - 1 ? <span className="ml-2 text-navy-200">·</span> : null}
          </span>
        ))}
      </Link>
    </div>
  );
}

const feederBadges: { label: string; icon: LucideIcon; color: string }[] = [
  { label: "Ventes", icon: TrendingUp, color: "var(--color-panoryx-blue)" },
  { label: "Stocks", icon: Box, color: "var(--color-signal-cyan)" },
  { label: "Finance", icon: DollarSign, color: "var(--color-pulse-orange)" },
  { label: "Équipes", icon: Users, color: "var(--color-flow-violet)" },
  { label: "Opérations", icon: Settings, color: "var(--color-action-coral)" },
];

function MobileDashboard() {
  return (
    <div className="mx-auto max-w-2xl">
      <DashboardMockup />
    </div>
  );
}

/**
 * Every domain feeds one screen: a column of module badges on the left,
 * each wired into the dashboard by an animated connector. Badges live in
 * their own gutter so they never cover the dashboard's figures.
 */
function DesktopOperationsVisual() {
  return (
    <div className="relative flex items-center">
      <ul className="relative z-10 flex w-[136px] shrink-0 flex-col gap-5">
        {feederBadges.map((b, i) => (
          <motion.li
            key={b.label}
            className="relative flex items-center"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.9 + i * 0.1, ease: easeOut }}
          >
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3.4 + i * 0.35, repeat: Infinity, ease: "easeInOut", delay: 1.4 + i * 0.1 }}
              className="flex w-[136px] items-center gap-2 rounded-full border border-navy-100 bg-white py-2 pl-2 pr-3 shadow-card"
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `color-mix(in srgb, ${b.color} 14%, white)` }}
              >
                <b.icon size={14} color={b.color} strokeWidth={2.25} aria-hidden="true" />
              </span>
              <span className="text-[13px] font-semibold text-navy">{b.label}</span>
            </motion.div>
            <span className="pointer-events-none absolute left-full top-1/2 h-[2px] w-9 -translate-y-1/2 overflow-hidden" aria-hidden="true">
              <motion.span
                className="block h-full w-[200%]"
                style={{
                  backgroundImage: `repeating-linear-gradient(90deg, ${b.color} 0 6px, transparent 6px 12px)`,
                  opacity: 0.7,
                }}
                animate={{ x: ["-50%", "0%"] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              />
            </span>
          </motion.li>
        ))}
      </ul>
      <TiltCard className="relative ml-9 min-w-0 flex-1">
        <DashboardMockup />
      </TiltCard>
    </div>
  );
}

/**
 * Wraps the dashboard mockup with a subtle pointer-driven 3D tilt —
 * a small "alive" interaction that a flat screenshot can't convey.
 */
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });
  const rotateX = useTransform(springY, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-8, 8]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ perspective: 1200 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

const railIcons: { icon: LucideIcon; active?: boolean }[] = [
  { icon: LayoutDashboard, active: true },
  { icon: LineChart },
  { icon: Box },
  { icon: ShoppingCart },
  { icon: DollarSign },
  { icon: Users },
  { icon: Settings },
  { icon: SlidersHorizontal },
];

const kpiTilesRow1 = [
  { label: "Ventes", value: "+12,4 %", hint: "vs mois dernier", color: "var(--color-panoryx-blue)" },
  { label: "Stocks", value: "90 % sain", hint: "Taux de disponibilité", color: "var(--color-signal-cyan)" },
  { label: "Alertes", value: "3", hint: "Prioritaires", color: "var(--color-action-coral)" },
];

const kpiTilesRow2 = [
  { label: "Chiffre d'affaires", value: "1 284 320 MAD", hint: "+12,4 %", positive: true },
  { label: "Marge brute", value: "32,8 %", hint: "+2,1 pts", positive: true },
  { label: "Valeur du stock", value: "864 200 MAD", hint: "Sain", positive: true },
  { label: "Effectif actif", value: "124", hint: "8 sites", positive: true },
];

const siteRows = [
  { name: "Casablanca Centre", status: "Dans les objectifs", tone: "good" as const },
  { name: "Rabat Agdal", status: "À surveiller", tone: "warn" as const },
  { name: "Marrakech Guéliz", status: "Sain", tone: "good" as const },
  { name: "Tanger Centre", status: "À risque", tone: "bad" as const },
];

const statusTone: Record<"good" | "warn" | "bad", string> = {
  good: "text-signal-cyan",
  warn: "text-pulse-orange",
  bad: "text-action-coral",
};

function DashboardMockup() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-2xl"
      style={{ boxShadow: "0 30px 70px -20px rgba(40, 92, 255, 0.25), 0 12px 28px -10px rgba(17, 24, 44, 0.15)" }}
    >
      <div className="flex">
        <aside
          className="hidden w-14 shrink-0 flex-col items-center gap-4 bg-navy py-5 sm:flex"
          aria-hidden="true"
        >
          <PanoryxMark size={20} className="mb-2 brightness-0 invert" />
          {railIcons.map(({ icon: Icon, active }, i) => (
            <span
              key={i}
              className={`flex h-8 w-8 items-center justify-center rounded-md ${
                active ? "bg-panoryx-blue text-white" : "text-navy-300"
              }`}
            >
              <Icon size={15} aria-hidden="true" />
            </span>
          ))}
        </aside>

        <div className="min-w-0 flex-1 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-bold text-navy">Vue opérationnelle</p>
            <div className="flex gap-2">
              <span className="rounded-md border border-navy-100 px-2.5 py-1 text-[11px] font-medium text-navy-500">
                Tous les sites
              </span>
              <span className="hidden rounded-md border border-navy-100 px-2.5 py-1 text-[11px] font-medium text-navy-500 sm:inline">
                Ce mois-ci
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <div className="rounded-lg border border-navy-100 bg-navy-50/60 p-3">
              <p className="text-[11px] font-medium text-navy-500">Indice opérationnel</p>
              <p className="mt-1 text-lg font-bold text-navy">
                87<span className="text-xs font-medium text-navy-300"> / 100</span>
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-signal-cyan">Performance solide</p>
            </div>
            {kpiTilesRow1.map((t) => (
              <div key={t.label} className="rounded-lg border border-navy-100 bg-navy-50/60 p-3">
                <p className="text-[11px] font-medium text-navy-500">{t.label}</p>
                <p className="mt-1 text-lg font-bold text-navy">{t.value}</p>
                <p className="mt-0.5 text-[11px] font-medium" style={{ color: t.color }}>
                  {t.hint}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {kpiTilesRow2.map((t) => (
              <div key={t.label} className="rounded-lg border border-navy-100 p-3">
                <p className="text-[11px] font-medium text-navy-500">{t.label}</p>
                <p className="mt-1 text-base font-bold text-navy">{t.value}</p>
                <p className="mt-0.5 text-[11px] font-medium text-signal-cyan">{t.hint}</p>
              </div>
            ))}
          </div>

          <div className="mt-2.5 hidden gap-2.5 sm:grid sm:grid-cols-3">
            <div className="rounded-lg border border-navy-100 p-3">
              <p className="text-[11px] font-semibold text-navy">Ventes et marge</p>
              <svg viewBox="0 0 160 60" className="mt-2 h-14 w-full" aria-hidden="true">
                <polyline
                  points="0,45 25,30 50,38 75,20 100,28 125,10 160,16"
                  fill="none"
                  stroke="var(--color-panoryx-blue)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="rounded-lg border border-navy-100 p-3">
              <p className="text-[11px] font-semibold text-navy">État des stocks</p>
              <div className="mt-2 flex items-center gap-3">
                <div
                  className="h-12 w-12 shrink-0 rounded-full"
                  style={{
                    background:
                      "conic-gradient(var(--color-signal-cyan) 0% 72%, var(--color-pulse-orange) 72% 90%, var(--color-action-coral) 90% 100%)",
                  }}
                />
                <div className="space-y-0.5 text-[10px] font-medium text-navy-500">
                  <p>Sain 72 %</p>
                  <p>Faible 18 %</p>
                  <p>Critique 10 %</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-navy-100 p-3">
              <p className="text-[11px] font-semibold text-navy">Performance par site</p>
              <ul className="mt-2 space-y-1.5">
                {siteRows.map((s) => (
                  <li key={s.name} className="flex items-center justify-between gap-2">
                    <span className="truncate text-[10px] text-navy-500">{s.name}</span>
                    <span className={`shrink-0 text-[10px] font-semibold ${statusTone[s.tone]}`}>
                      {s.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
