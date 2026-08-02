import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Fuel,
  Clock,
  Gauge,
  Container,
  Truck,
  Wallet,
  Building2,
  Users,
  Wrench,
  BarChart3,
  Settings,
  ShoppingBag,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const panoStationNavItems: NavItem[] = [
  { href: "/app/panostation", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/app/panostation/ventes", label: "Ventes", icon: Fuel },
  { href: "/app/panostation/quarts", label: "Quarts", icon: Clock },
  { href: "/app/panostation/pompes", label: "Pompes et compteurs", icon: Gauge },
  { href: "/app/panostation/cuves", label: "Cuves et stocks", icon: Container },
  { href: "/app/panostation/livraisons", label: "Livraisons", icon: Truck },
  { href: "/app/panostation/caisse", label: "Caisse", icon: Wallet },
  { href: "/app/panostation/boutique", label: "Boutique", icon: ShoppingBag },
  { href: "/app/panostation/fournisseurs", label: "Fournisseurs", icon: Building2 },
  { href: "/app/panostation/equipe", label: "Équipe", icon: Users },
  { href: "/app/panostation/maintenance", label: "Maintenance et incidents", icon: Wrench },
  { href: "/app/panostation/rapports", label: "Rapports", icon: BarChart3 },
  { href: "/app/panostation/parametres", label: "Paramètres", icon: Settings },
];

export const fuelTypeLabels: Record<string, string> = {
  gasoil: "Gasoil",
  sp95: "Sans Plomb 95",
  sp98: "Sans Plomb 98",
};
