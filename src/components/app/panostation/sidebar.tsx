"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { panoStationNavItems } from "./nav-items";

export function PanoStationSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav className={cn("space-y-0.5", className)} aria-label="Navigation PanoStation">
      {panoStationNavItems.map((item) => {
        const isActive =
          item.href === "/app/panostation"
            ? pathname === item.href
            : pathname?.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-panoryx-blue/10 text-panoryx-blue"
                : "text-navy-500 hover:bg-navy-50 hover:text-navy"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <item.icon size={17} aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
