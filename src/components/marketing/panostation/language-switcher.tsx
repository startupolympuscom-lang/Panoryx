"use client";

import { panostationLocales, type PanostationLocale } from "@/lib/i18n/panostation-content";
import { cn } from "@/lib/utils";

export function PanostationLanguageSwitcher({
  value,
  onChange,
  className,
}: {
  value: PanostationLocale;
  onChange: (locale: PanostationLocale) => void;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label="Langue / Language / اللغة"
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1 backdrop-blur-sm",
        className
      )}
    >
      {panostationLocales.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => onChange(l.code)}
          aria-pressed={value === l.code}
          dir={l.dir}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
            value === l.code ? "bg-white text-navy" : "text-navy-200 hover:text-white"
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
