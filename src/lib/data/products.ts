import type { LucideIcon } from "lucide-react";
import { Fuel, Users2, Calculator, Package } from "lucide-react";

export interface ProductDefinition {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  sector: string;
  modules: string[];
  availability: "disponible" | "bientot-disponible";
  icon: LucideIcon;
  accentColor: string;
}

/**
 * Source of truth for the product hub and cross-links. Adding a future
 * Panoryx product means appending an entry here — the hub grid, cards, and
 * availability badges all render from this list without further changes.
 */
export const products: ProductDefinition[] = [
  {
    slug: "panostation",
    name: "PanoStation",
    tagline: "Pilotez chaque station. Maîtrisez chaque opération.",
    description:
      "PanoStation centralise les ventes, les stocks de carburant, les équipes, les fournisseurs et les opérations quotidiennes de votre réseau de stations-service.",
    sector: "Réseaux de stations-service",
    modules: [
      "Ventes & quarts",
      "Cuves & compteurs",
      "Livraisons & fournisseurs",
      "Caisse & rapprochement",
      "Équipe & présence",
      "Maintenance & incidents",
    ],
    availability: "disponible",
    icon: Fuel,
    accentColor: "var(--color-panoryx-blue)",
  },
  {
    slug: "ressources-humaines",
    name: "Module Ressources humaines",
    tagline: "Gestion des équipes et de la présence, à l'échelle de l'organisation.",
    description:
      "Un futur produit Panoryx dédié à la gestion des équipes, des plannings et de la présence sur l'ensemble de vos sites.",
    sector: "Toutes organisations multi-sites",
    modules: ["Plannings", "Présence", "Congés"],
    availability: "bientot-disponible",
    icon: Users2,
    accentColor: "var(--color-flow-violet)",
  },
  {
    slug: "comptabilite",
    name: "Module Comptabilité & finance",
    tagline: "Suivi financier connecté aux opérations.",
    description:
      "Un futur produit Panoryx pour rapprocher automatiquement les opérations terrain avec le suivi comptable et financier.",
    sector: "Toutes organisations",
    modules: ["Rapprochements", "Dépenses", "Facturation"],
    availability: "bientot-disponible",
    icon: Calculator,
    accentColor: "var(--color-action-coral)",
  },
  {
    slug: "logistique",
    name: "Module Logistique & inventaire",
    tagline: "Stocks et flux de marchandises unifiés.",
    description:
      "Un futur produit Panoryx pour la gestion des stocks, des entrepôts et des flux logistiques multi-sites.",
    sector: "Distributeurs & grossistes",
    modules: ["Inventaire", "Entrepôts", "Commandes"],
    availability: "bientot-disponible",
    icon: Package,
    accentColor: "var(--color-signal-cyan)",
  },
];

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}
