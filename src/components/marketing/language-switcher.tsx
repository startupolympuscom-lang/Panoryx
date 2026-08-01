"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

/**
 * FR is the only routed locale today. EN is shown disabled so the control's
 * final shape (and the affordance for switching) is already in place; wiring
 * it up is just adding `[locale]` routes backed by `dictionaries.en`.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className={cn("relative", className)} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-9 items-center gap-1 rounded-md px-2.5 text-sm font-semibold text-navy-700 hover:bg-navy-50"
      >
        FR
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      {open ? (
        <div
          role="listbox"
          className="absolute right-0 top-full z-30 mt-2 w-40 overflow-hidden rounded-md border border-navy-100 bg-white py-1 shadow-card"
        >
          <div
            role="option"
            aria-selected="true"
            className="flex items-center justify-between px-3 py-2 text-sm font-medium text-navy"
          >
            Français
            <span className="text-panoryx-blue">✓</span>
          </div>
          <div
            role="option"
            aria-selected="false"
            aria-disabled="true"
            title="Bientôt disponible"
            className="flex items-center justify-between px-3 py-2 text-sm text-navy-300"
          >
            English
            <span className="text-[10px] font-semibold uppercase tracking-wide">Bientôt</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
