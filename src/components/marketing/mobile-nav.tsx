"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoLink } from "@/components/brand/logo";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/produits", label: "Produits" },
  { href: "/#pourquoi-panoryx", label: "Pourquoi Panoryx" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

export function MobileNav({ isAuthed }: { isAuthed: boolean }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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

      {open ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
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
          <nav className="flex flex-1 flex-col gap-1 px-5 py-6">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-base font-semibold text-navy hover:bg-navy-50"
              >
                {l.label}
              </Link>
            ))}
          </nav>
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
        </div>
      ) : null}
    </div>
  );
}
