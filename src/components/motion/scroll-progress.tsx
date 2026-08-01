"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** Thin brand-gradient progress bar pinned under the header, tracking scroll. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 40,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-50 h-[2.5px] origin-left bg-[linear-gradient(90deg,var(--color-panoryx-blue),var(--color-flow-violet)_45%,var(--color-action-coral)_100%)]"
    />
  );
}
