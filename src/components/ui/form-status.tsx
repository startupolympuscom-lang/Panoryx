"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle } from "lucide-react";
import type { ReactNode } from "react";

/** Error banner that gives a brief shake on appearance to draw the eye. */
export function ErrorAlert({ children }: { children: ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={String(children)}
        initial={{ opacity: 0, x: 0 }}
        animate={{ opacity: 1, x: [0, -6, 6, -4, 4, 0] }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start gap-2 rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-action-coral"
        role="alert"
      >
        <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span>{children}</span>
      </motion.p>
    </AnimatePresence>
  );
}

/** Success banner with a spring-scaled checkmark. */
export function SuccessAlert({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex items-start gap-2.5 rounded-md bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
      role="status"
    >
      <motion.span
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.1 }}
        className="mt-0.5 shrink-0"
      >
        <CheckCircle2 size={16} aria-hidden="true" />
      </motion.span>
      <span>{children}</span>
    </motion.div>
  );
}
