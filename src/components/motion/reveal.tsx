"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const easeOut = [0.16, 1, 0.3, 1] as const;

/** Tags we render StaggerGroup/StaggerItem as — extend if a new one is needed. */
const tagComponents = {
  div: motion.div,
  ol: motion.ol,
  ul: motion.ul,
  li: motion.li,
} as const;

type Tag = keyof typeof tagComponents;

function makeVariants(y: number): Variants {
  return {
    hidden: { opacity: 0, y },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
  };
}

/**
 * Fades + slides content into place once it scrolls into view. Wraps
 * `framer-motion`'s `whileInView`, which — combined with `MotionConfig
 * reducedMotion="user"` in the marketing/auth layouts — automatically
 * collapses to an instant, non-animated state for users who prefer
 * reduced motion.
 */
export function FadeIn({
  children,
  className,
  delay = 0,
  y = 20,
  once = true,
  amount = 0.3,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
  amount?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      variants={makeVariants(y)}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
};

/** Stagger-reveals its direct children as a group scrolls into view. */
export function StaggerGroup({
  children,
  className,
  once = true,
  amount = 0.2,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  once?: boolean;
  amount?: number;
  as?: Tag;
}) {
  const Component = tagComponents[as];
  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      variants={staggerContainer}
    >
      {children}
    </Component>
  );
}

/** A single item inside a `StaggerGroup`. */
export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: Tag;
}) {
  const Component = tagComponents[as];
  return (
    <Component className={className} variants={staggerItem}>
      {children}
    </Component>
  );
}
