"use client";

import { motion } from "framer-motion";

const easeOut = [0.16, 1, 0.3, 1] as const;

export function AuthCard({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: easeOut }}
      className="rounded-xl border border-navy-100 bg-white p-7 shadow-card sm:p-9"
    >
      {eyebrow ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-panoryx-blue"
        >
          {eyebrow}
        </motion.p>
      ) : null}
      <h1 className="text-2xl font-bold tracking-tight text-navy">{title}</h1>
      {description ? <p className="mt-2 text-sm leading-relaxed text-navy-500">{description}</p> : null}
      <div className="mt-7">{children}</div>
      {footer ? <div className="mt-7 border-t border-navy-100 pt-5 text-center text-sm">{footer}</div> : null}
    </motion.div>
  );
}
