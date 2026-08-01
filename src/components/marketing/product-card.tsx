import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/card";
import type { ProductDefinition } from "@/lib/data/products";

export function ProductCard({ product }: { product: ProductDefinition }) {
  const isAvailable = product.availability === "disponible";

  const cardContent = (
    <>
      <div className="flex items-start justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-md"
          style={{ backgroundColor: `color-mix(in srgb, ${product.accentColor} 12%, white)` }}
        >
          <product.icon size={22} color={product.accentColor} aria-hidden="true" />
        </div>
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
          <ArrowRight size={15} aria-hidden="true" />
        </span>
      ) : null}
    </>
  );

  if (!isAvailable) {
    return (
      <div className="rounded-lg border border-dashed border-navy-200 bg-navy-50/40 p-6">
        {cardContent}
      </div>
    );
  }

  return (
    <Link
      href={`/produits/${product.slug}`}
      className="group rounded-lg border border-navy-100 bg-white p-6 transition-shadow hover:shadow-card"
    >
      {cardContent}
    </Link>
  );
}
