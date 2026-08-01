"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { PanoStationSidebar } from "./sidebar";

export function PanoStationMobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu PanoStation"
        className="flex h-9 w-9 items-center justify-center rounded-md border border-navy-200 text-navy hover:bg-navy-50"
      >
        <Menu size={18} aria-hidden="true" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-72 overflow-y-auto bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-bold text-navy">PanoStation</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer le menu"
                className="flex h-8 w-8 items-center justify-center rounded-md text-navy hover:bg-navy-50"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div onClick={() => setOpen(false)}>
              <PanoStationSidebar />
            </div>
          </div>
          <button
            type="button"
            aria-label="Fermer le menu"
            className="flex-1 bg-navy/40"
            onClick={() => setOpen(false)}
          />
        </div>
      ) : null}
    </div>
  );
}
