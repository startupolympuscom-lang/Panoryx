"use client";

import { useCallback, useSyncExternalStore } from "react";
import { defaultPanostationLocale, type PanostationLocale } from "./panostation-content";

const STORAGE_KEY = "panostation_lang";

function isPanostationLocale(value: string | null): value is PanostationLocale {
  return value === "ary" || value === "fr" || value === "en";
}

function readStoredLocale(): PanostationLocale {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return isPanostationLocale(saved) ? saved : defaultPanostationLocale;
  } catch {
    return defaultPanostationLocale;
  }
}

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function getServerSnapshot(): PanostationLocale {
  return defaultPanostationLocale;
}

/**
 * Reads/writes the visitor's chosen language for the PanoStation landing
 * page via `useSyncExternalStore`, so it stays in sync with localStorage
 * (including across other tabs) without ever setting state inside an
 * effect body. The server snapshot is always Darija, so the first paint
 * matches SSR; a returning visitor's saved language then applies on the
 * client's next read.
 */
export function usePanostationLocale(): [PanostationLocale, (next: PanostationLocale) => void] {
  const locale = useSyncExternalStore(subscribe, readStoredLocale, getServerSnapshot);

  const setLocale = useCallback((next: PanostationLocale) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Non-fatal; the choice just won't persist across visits.
    }
    listeners.forEach((listener) => listener());
  }, []);

  return [locale, setLocale];
}
