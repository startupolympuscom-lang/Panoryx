import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  icon: Icon,
  tone = "neutral",
  hint,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "neutral" | "positive" | "negative" | "warning";
  hint?: string;
}) {
  const toneClasses: Record<string, string> = {
    neutral: "bg-panoryx-blue/10 text-panoryx-blue",
    positive: "bg-emerald-50 text-emerald-600",
    negative: "bg-red-50 text-action-coral",
    warning: "bg-orange-50 text-pulse-orange",
  };

  return (
    <div className="rounded-lg border border-navy-100 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">{label}</p>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-md", toneClasses[tone])}>
          <Icon size={16} aria-hidden="true" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold text-navy">{value}</p>
      {hint ? <p className="mt-1 text-xs text-navy-500">{hint}</p> : null}
    </div>
  );
}
