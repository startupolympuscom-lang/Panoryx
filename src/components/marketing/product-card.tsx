"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/card";
import type { ReactNode } from "react";
import type { ProductDefinition } from "@/lib/data/products";

const MotionLink = motion.create(Link);

/**
 * `icon` is rendered by the caller (a Server Component) and passed down as
 * an element. `product` deliberately excludes `icon` (a `LucideIcon`
 * component reference) — functions can't cross the server/client boundary,
 * so even carrying it unused on the object would break the RSC payload.
 */
export function ProductCard({
  product,
  icon,
}: {
  product: Omit<ProductDefinition, "icon">;
  icon: ReactNode;
}) {
  const isAvailable = product.availability === "disponible";

  const cardContent = (
    <>
      <div className="flex items-start justify-between">
        <motion.div
          className="flex h-12 w-12 items-center justify-center rounded-md"
          style={{ backgroundColor: `color-mix(in srgb, ${product.accentColor} 12%, white)` }}
          whileHover={isAvailable ? { scale: 1.08, rotate: -4 } : undefined}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          {icon}
        </motion.div>
        <Badge tone={isAvailable ? "success" : "coming-soon"}>
          {isAvailable ? "Disponible" : "Bientôt disponible"}
        </Badge>
      </div>

      <h3 className="mt-5 text-lg font-semibold text-navy">{product.name}</h3>
      <p className="mt-1 text-sm font-medium text-navy-500">{product.sector}</p>
      <p className="mt-3 text-sm leading-relaxed text-navy-500">{product.description}</p>

      <ul className="mt-5 flex flex-wrap gap-2">
        {product.modules.slice(0, 4).map((m) => (
          <li
            key={m}
            className="rounded-full bg-navy-50 px-2.5 py-1 text-xs font-medium text-navy-700"
          >
            {m}
          </li>
        ))}
      </ul>

      {isAvailable ? (
        <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-panoryx-blue">
          Découvrir le produit
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </span>
      ) : null}
    </>
  );

  if (!isAvailable) {
    return (
      <div className="relative h-full overflow-hidden rounded-lg border border-dashed border-navy-200 bg-navy-50/40 p-6">
        {cardContent}
      </div>
    );
  }

  return (
    <MotionLink
      href={`/produits/${product.slug}`}
      className="group relative block h-full overflow-hidden rounded-lg border border-navy-100 bg-white p-6"
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 350, damping: 26 }}
      style={{ boxShadow: "0 1px 1px rgba(17,24,44,0.03)" }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
        style={{ backgroundColor: product.accentColor }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 shadow-card transition-opacity duration-300 group-hover:opacity-100"
      />
      <span className="relative">{cardContent}</span>
    </MotionLink>
  );
}
