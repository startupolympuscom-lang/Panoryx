"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const links = [
  { href: "/produits", label: "Produits" },
  { href: "/#solutions", label: "Solutions" },
  { href: "/#pourquoi-panoryx", label: "Pourquoi Panoryx" },
  { href: "/a-propos", label: "Ressources" },
];

function isActiveRoute(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Desktop nav with a shared-layout pill that glides to whichever link is
 * hovered (falling back to the active route when nothing is hovered).
 */
export function NavLinks() {
  const pathname = usePathname();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <nav
      className="hidden items-center gap-1 md:flex"
      aria-label="Navigation principale"
      onMouseLeave={() => setHovered(null)}
    >
      {links.map((l) => {
        const isActive = l.href.includes("#") ? false : isActiveRoute(pathname, l.href);
        const isHighlighted = hovered ? hovered === l.href : isActive;

        return (
          <Link
            key={l.href}
            href={l.href}
            onMouseEnter={() => setHovered(l.href)}
            className={cn(
              "relative rounded-md px-3.5 py-2 text-sm font-semibold transition-colors",
              isHighlighted ? "text-navy" : "text-navy-700 hover:text-navy"
            )}
          >
            <AnimatePresence>
              {isHighlighted ? (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-md bg-navy-50"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              ) : null}
            </AnimatePresence>
            <span className="relative">{l.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
