"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export interface StationOption {
  id: string;
  name: string;
  city: string;
}

export function StationSwitcher({ stations }: { stations: StationOption[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("station") ?? "all";

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("station");
    } else {
      params.set("station", value);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <select
      value={current}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Sélectionner une station"
      className="h-9 rounded-md border border-navy-200 bg-white px-3 text-sm font-medium text-navy focus:border-panoryx-blue focus:outline-none focus:ring-2 focus:ring-panoryx-blue/20"
    >
      <option value="all">Toutes les stations</option>
      {stations.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name} — {s.city}
        </option>
      ))}
    </select>
  );
}
