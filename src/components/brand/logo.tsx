import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoVariant = "primary" | "reversed" | "mono";

const VARIANT_SRC: Record<LogoVariant, string> = {
  primary: "/brand/panoryx-logo-primary.png",
  reversed: "/brand/panoryx-logo-reversed.png",
  mono: "/brand/panoryx-logo-mono.png",
};

// Intrinsic aspect ratio of the supplied lockup artwork (width / height)
const LOCKUP_RATIO = 1413 / 554;

export function PanoryxLogo({
  variant = "primary",
  height = 32,
  className,
  priority,
}: {
  variant?: LogoVariant;
  height?: number;
  className?: string;
  priority?: boolean;
}) {
  const width = Math.round(height * LOCKUP_RATIO);
  return (
    <Image
      src={VARIANT_SRC[variant]}
      alt="Panoryx"
      width={width}
      height={height}
      priority={priority}
      className={cn("h-auto w-auto object-contain", className)}
      style={{ height, width: "auto" }}
    />
  );
}

const MARK_RATIO = 339 / 456;

export function PanoryxMark({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const width = Math.round(size * MARK_RATIO);
  return (
    <Image
      src="/brand/panoryx-mark.png"
      alt="Panoryx"
      width={width}
      height={size}
      className={cn("h-auto w-auto object-contain", className)}
      style={{ height: size, width: "auto" }}
    />
  );
}

export function LogoLink({
  variant = "primary",
  height = 30,
  className,
  href = "/",
}: {
  variant?: LogoVariant;
  height?: number;
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4",
        className
      )}
      aria-label="Panoryx — retour à l'accueil"
    >
      <PanoryxLogo variant={variant} height={height} priority />
    </Link>
  );
}
