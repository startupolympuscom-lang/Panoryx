"use client";

import { useRef, type CSSProperties } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PanoryxMark } from "@/components/brand/logo";
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
            background:
              "radial-gradient(circle, var(--color-panoryx-blue), transparent 70%)",
          }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.22, 0.3, 0.22] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-40 bottom-0 h-[360px] w-[360px] rounded-full opacity-[0.18] blur-[100px]"
          style={{
            background:
              "radial-gradient(circle, var(--color-flow-violet), transparent 70%)",
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.24, 0.15] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />
      </div>

      <Container className="relative pt-16 pb-24 sm:pt-20 sm:pb-32 lg:pt-24">
        <motion.div className="max-w-2xl" variants={container} initial="hidden" animate="show">
          <motion.p
            variants={fadeUp}
            className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-panoryx-blue"
          >
            Plateforme d&apos;opérations métier
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="text-5xl font-bold tracking-tight text-navy sm:text-6xl lg:text-[4rem] lg:leading-[1.05]"
          >
            Voyez tout.
            <br />
            <span className="brand-gradient-text">Pilotez mieux.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-6 max-w-lg text-lg leading-relaxed text-navy-500">
            Centralisez vos opérations, automatisez vos processus et prenez de meilleures
            décisions en temps réel.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Button href="/contact?type=demo" size="lg">
              Demander une démo
            </Button>
            <Button
              href="/produits/panostation"
              size="lg"
              variant="ghost"
              className="group gap-2 px-2 text-panoryx-blue hover:bg-transparent hover:text-[#1e4cf0]"
            >
              Découvrir PanoStation
              <ArrowRight
                size={17}
                className="transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          className="relative mt-16 lg:mt-20"
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.45, ease: easeOut }}
        >
          <OperationsVisual />
        </motion.div>
      </Container>
    </section>
  );
}

const leftBadges: { label: string; icon: LucideIcon; color: string; top: number }[] = [
  { label: "Ventes", icon: TrendingUp, color: "var(--color-panoryx-blue)", top: 130 },
  { label: "Stocks", icon: Box, color: "var(--color-signal-cyan)", top: 320 },
];

const rightBadges: { label: string; icon: LucideIcon; color: string; top: number }[] = [
  { label: "Finance", icon: DollarSign, color: "var(--color-pulse-orange)", top: 60 },
  { label: "Équipes", icon: Users, color: "var(--color-flow-violet)", top: 225 },
  { label: "Operations", icon: Settings, color: "var(--color-panoryx-blue)", top: 385 },
];

const leftPaths = [
  "M 175 165 C 200 165, 205 180, 225 180",
  "M 175 350 C 200 350, 205 320, 225 320",
];

const rightPaths = [
  "M 775 150 C 805 150, 795 100, 825 100",
  "M 775 260 C 805 260, 810 260, 825 260",
  "M 775 320 C 805 320, 795 415, 825 415",
];

const pathDraw = {
  hidden: { pathLength: 0, opacity: 0 },
  show: (i: number) => ({
    pathLength: 1,
    opacity: 0.6,
    transition: { duration: 1.4, delay: 0.9 + i * 0.12, ease: easeOut },
  }),
};

const badgeShow = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: easeOut } },
};

function FloatingBadge({
  icon: Icon,
  label,
  color,
  className,
  style,
  delay,
  floatDuration,
}: {
  icon: LucideIcon;
  label: string;
  color: string;
  className?: string;
  style?: CSSProperties;
  delay: number;
  floatDuration: number;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={badgeShow}
      initial="hidden"
      animate="show"
      transition={{ delay }}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: floatDuration, repeat: Infinity, ease: "easeInOut", delay: delay + 0.5 }}
        whileHover={{ y: -4, scale: 1.04 }}
        className="flex w-[168px] items-center gap-2.5 rounded-full border border-navy-100 bg-white px-4 py-2.5 shadow-card transition-shadow hover:shadow-lg"
      >
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `color-mix(in srgb, ${color} 14%, white)` }}
        >
          <Icon size={15} color={color} strokeWidth={2.25} aria-hidden="true" />
        </span>
        <span className="text-sm font-semibold text-navy">{label}</span>
      </motion.div>
    </motion.div>
  );
}

/**
 * Dashboard mockup + connected module badges, echoing the operational
 * "vue panoramique" concept: one screen, everything feeding into it.
 */
function OperationsVisual() {
  const allPaths = [...leftPaths, ...rightPaths];

  return (
    <>
      <div className="mx-auto max-w-lg lg:hidden">
        <DashboardMockup />
      </div>

      <div className="relative hidden h-[500px] lg:block">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1000 500"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          {allPaths.map((d, i) => {
            const color =
              i < leftPaths.length
                ? leftBadges[i]?.color
                : rightBadges[i - leftPaths.length]?.color;
            return (
              <g key={d}>
                <motion.path
                  d={d}
                  stroke={color}
                  strokeWidth="2"
                  custom={i}
                  variants={pathDraw}
                  initial="hidden"
                  animate="show"
                />
                <motion.path
                  d={d}
                  stroke={color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="1 22"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.9, strokeDashoffset: [0, -46] }}
                  transition={{
                    opacity: { duration: 0.6, delay: 1.6 + i * 0.12 },
                    strokeDashoffset: {
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "linear",
                      delay: 1.6 + i * 0.12,
                    },
                  }}
                />
              </g>
            );
          })}
        </svg>

        {leftBadges.map((b, i) => (
          <FloatingBadge
            key={b.label}
            icon={b.icon}
            label={b.label}
            color={b.color}
            className="absolute left-0"
            style={{ top: b.top }}
            delay={1 + i * 0.12}
            floatDuration={3.4 + i * 0.4}
          />
        ))}

        {rightBadges.map((b, i) => (
          <FloatingBadge
            key={b.label}
            icon={b.icon}
            label={b.label}
            color={b.color}
            className="absolute right-0"
            style={{ top: b.top }}
            delay={1.15 + i * 0.12}
            floatDuration={3.8 + i * 0.4}
          />
        ))}

        <TiltCard className="absolute left-1/2 top-1/2 w-[56%] -translate-x-1/2 -translate-y-1/2">
          <DashboardMockup />
        </TiltCard>
      </div>
    </>
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
  { label: "Alertes", value: "3 prioritaires", hint: "À traiter", color: "var(--color-action-coral)" },
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

