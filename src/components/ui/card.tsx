import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-navy-100 bg-white p-6 shadow-card",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Badge({
  className,
  children,
  tone = "neutral",
}: {
  className?: string;
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "info" | "danger" | "coming-soon";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-navy-50 text-navy-700",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    info: "bg-blue-50 text-panoryx-blue",
    danger: "bg-red-50 text-action-coral",
    "coming-soon": "bg-navy-100 text-navy-500",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
