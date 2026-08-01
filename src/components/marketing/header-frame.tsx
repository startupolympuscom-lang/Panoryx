"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

/** Adds a soft shadow to the sticky header once the page has scrolled. */
export function HeaderFrame({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={false}
      animate={{
        boxShadow: scrolled
          ? "0 8px 24px -12px rgba(17,24,44,0.16)"
          : "0 0px 0px 0px rgba(17,24,44,0)",
      }}
      transition={{ duration: 0.25 }}
      className="sticky top-0 z-40 border-b border-navy-100 bg-white/85 backdrop-blur-md"
    >
      {children}
    </motion.header>
  );
}
