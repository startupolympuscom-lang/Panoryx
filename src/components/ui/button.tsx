import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-panoryx-blue text-white hover:bg-[#1e4cf0] shadow-soft focus-visible:outline-cloud-white",
  secondary:
    "bg-navy text-white hover:bg-navy-800 shadow-soft",
  outline:
    "border border-navy-200 text-navy bg-white hover:border-panoryx-blue hover:text-panoryx-blue",
  ghost: "text-navy hover:bg-navy-50",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-4 text-sm rounded-md gap-1.5",
  md: "h-11 px-5 text-sm rounded-md gap-2",
  lg: "h-[3.25rem] px-7 text-base rounded-lg gap-2",
};

const base =
  "inline-flex items-center justify-center font-semibold transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children?: React.ReactNode;
}

type ButtonAsButton = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps & {
  href: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", className, children, ...rest } = props;
  const classes = cn(base, variantClasses[variant], sizeClasses[size], className);

  if ("href" in props && props.href) {
    const { href, ...anchorRest } = rest as Omit<ButtonAsLink, keyof CommonProps>;
    return (
      <Link href={href} className={classes} {...anchorRest}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
