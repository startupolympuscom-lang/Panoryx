"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LogoLink } from "@/components/brand/logo";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/produits", label: "Produits" },
  { href: "/#pourquoi-panoryx", label: "Pourquoi Panoryx" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

const panelVariants = {
  hidden: { x: "100%" },
  show: { x: 0, transition: { type: "spring" as const, stiffness: 380, damping: 38 } },
  exit: { x: "100%", transition: { duration: 0.2, ease: "easeIn" as const } },
};

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: 16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.25 } },
};

export function MobileNav({ isAuthed }: { isAuthed: boolean }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const overlay = (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50">
          <motion.button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-navy/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-2xl"
            variants={panelVariants}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <div className="flex h-16 items-center justify-between border-b border-navy-100 px-5">
              <LogoLink height={26} />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer le menu"
                className="flex h-10 w-10 items-center justify-center rounded-md text-navy hover:bg-navy-50"
              >
                <X size={22} />
              </button>
            </div>
            <motion.nav
              className="flex flex-1 flex-col gap-1 px-5 py-6"
              variants={listVariants}
              initial="hidden"
              animate="show"
            >
              {links.map((l) => (
                <motion.div key={l.href} variants={itemVariants}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-3 text-base font-semibold text-navy hover:bg-navy-50"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
            </motion.nav>
            <div className="flex flex-col gap-3 border-t border-navy-100 px-5 py-6">
              <Button
                href={isAuthed ? "/app" : "/connexion"}
                variant="outline"
                className="w-full"
                onClick={() => setOpen(false)}
              >
                {isAuthed ? "Mon espace" : "Connexion"}
              </Button>
              <Button href="/contact?type=demo" variant="primary" className="w-full" onClick={() => setOpen(false)}>
                Demander une démo
              </Button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
        className="flex h-10 w-10 items-center justify-center rounded-md text-navy hover:bg-navy-50"
      >
        <Menu size={22} />
      </button>

      {/*
       * Portaled to <body>: a position:fixed descendant of the sticky
       * header would otherwise have its containing block reset to the
       * header's own (short) box in Chromium, capping the overlay's
       * height instead of covering the full viewport.
       */}
      {mounted ? createPortal(overlay, document.body) : null}
    </div>
  );
}
