"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-panoryx-blue text-white hover:bg-[#1e4cf0] shadow-soft hover:shadow-[0_8px_24px_-6px_rgba(40,92,255,0.55)] focus-visible:outline-cloud-white",
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
  "inline-flex items-center justify-center font-semibold transition-[background-color,color,border-color,box-shadow] duration-200 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Drag/animation DOM event handlers clash with framer-motion's own prop
 * types for the same names (different event signatures), so they're
 * excluded here — this component never needs native drag or CSS
 * animation/transition event callbacks.
 */
type MotionConflictingProps =
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
  | "onTransitionEnd";

type ButtonAsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, MotionConflictingProps> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps & {
  href: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | MotionConflictingProps>;

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const tapHover = {
  whileHover: { scale: 1.025, y: -1 },
  whileTap: { scale: 0.97, y: 0 },
  transition: { type: "spring" as const, stiffness: 450, damping: 28 },
};

const MotionLink = motion.create(Link);

export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", className, children, ...rest } = props;
  const classes = cn(base, variantClasses[variant], sizeClasses[size], className);

  if ("href" in props && props.href) {
    const { href, ...anchorRest } = rest as Omit<ButtonAsLink, keyof CommonProps>;
    return (
      <MotionLink href={href} className={classes} {...tapHover} {...anchorRest}>
        {children}
      </MotionLink>
    );
  }

  const { disabled, ...buttonRest } = rest as Omit<ButtonAsButton, keyof CommonProps>;

  return (
    <motion.button
      className={classes}
      disabled={disabled}
      {...(disabled ? {} : tapHover)}
      {...buttonRest}
    >
      {children}
    </motion.button>
  );
}
