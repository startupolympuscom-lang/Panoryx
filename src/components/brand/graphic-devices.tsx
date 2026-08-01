import { cn } from "@/lib/utils";

const BRAND_STROKES = [
  "var(--color-panoryx-blue)",
  "var(--color-signal-cyan)",
  "var(--color-flow-violet)",
  "var(--color-action-coral)",
  "var(--color-pulse-orange)",
];

/**
 * Flowlines: parallel lines curving into a corner, echoing the charter's
 * "Flowlines" device. Used as a subtle corner accent on hero/section edges.
 */
export function Flowlines({
  className,
  strokeWidth = 6,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 300 300"
      fill="none"
      className={cn("pointer-events-none", className)}
      aria-hidden="true"
    >
      {BRAND_STROKES.map((color, i) => {
        const offset = i * 22;
        const r = 60 + i * 22;
        return (
          <path
            key={color}
            d={`M ${offset} 300 L ${offset} ${300 - r} A ${r} ${r} 0 0 1 ${offset + r} ${300 - r * 2 + r} L 300 ${300 - r * 2}`}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity={0.9}
          />
        );
      })}
    </svg>
  );
}

/**
 * Panoramic Arcs: concentric partial arcs, echoing the charter's radial
 * "Panoramic Arcs" device. Great as an ambient hero backdrop.
 */
export function PanoramicArcs({
  className,
  strokeWidth = 7,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      className={cn("pointer-events-none", className)}
      aria-hidden="true"
    >
      {BRAND_STROKES.map((color, i) => {
        const r = 40 + i * 34;
        return (
          <circle
            key={color}
            cx="200"
            cy="230"
            r={r}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${r * 3.6} ${r * 6.6}`}
            opacity={0.85}
          />
        );
      })}
    </svg>
  );
}

/**
 * Open Viewports: broken circular rings, echoing the charter's
 * "Open Viewports" device. Useful as a loading spinner shape or icon accent.
 */
export function OpenViewports({
  className,
  strokeWidth = 8,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      className={cn("pointer-events-none", className)}
      aria-hidden="true"
    >
      <circle
        cx="60"
        cy="60"
        r="50"
        stroke="url(#viewport-gradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray="205 100"
      />
      <defs>
        <linearGradient id="viewport-gradient" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="120" y2="120">
          <stop offset="0%" stopColor="var(--color-panoryx-blue)" />
          <stop offset="35%" stopColor="var(--color-flow-violet)" />
          <stop offset="70%" stopColor="var(--color-action-coral)" />
          <stop offset="100%" stopColor="var(--color-pulse-orange)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * Gradient Bands: stacked horizontal bars, echoing the charter's
 * "Gradient Bands" device. Useful for skeleton/loading states and chart legends.
 */
export function GradientBands({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 100"
      fill="none"
      className={cn("pointer-events-none", className)}
      aria-hidden="true"
    >
      {BRAND_STROKES.map((color, i) => (
        <rect
          key={color}
          x="0"
          y={i * 22}
          width={200 - i * 24}
          height="10"
          rx="5"
          fill={color}
          opacity={0.9}
        />
      ))}
    </svg>
  );
}

/** Full-bleed ambient background combining arcs + flowlines, for hero sections. */
export function HeroBackdrop({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      <PanoramicArcs className="absolute -right-24 -top-24 h-[520px] w-[520px] opacity-70 md:h-[640px] md:w-[640px]" />
      <Flowlines className="absolute -bottom-16 -left-16 h-64 w-64 rotate-180 opacity-40" />
    </div>
  );
}
