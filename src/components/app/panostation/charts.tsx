"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { formatMAD, formatDateFr, formatNumberFr } from "@/lib/utils";
import { fuelTypeLabels } from "./nav-items";
import type { SalesTrendPoint, FuelMixPoint } from "@/lib/data/panostation-dashboard";

const FUEL_COLORS: Record<string, string> = {
  gasoil: "var(--color-panoryx-blue)",
  sp95: "var(--color-signal-cyan)",
  sp98: "var(--color-flow-violet)",
};

export function SalesTrendChart({ data }: { data: SalesTrendPoint[] }) {
  const hasData = data.some((d) => d.totalAmount > 0);

  if (!hasData) {
    return <EmptyChartState message="Aucune vente enregistrée sur les 7 derniers jours." />;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-navy-100)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(d: string) => formatDateFr(d, { day: "2-digit", month: "2-digit" })}
          tick={{ fontSize: 12, fill: "var(--color-navy-500)" }}
          axisLine={{ stroke: "var(--color-navy-100)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "var(--color-navy-500)" }}
          axisLine={false}
          tickLine={false}
          width={70}
          tickFormatter={(v: number) => formatNumberFr(v)}
        />
        <Tooltip
          formatter={(value) => formatMAD(Number(value))}
          labelFormatter={(d) => formatDateFr(String(d), { weekday: "long", day: "2-digit", month: "long" })}
          contentStyle={{ borderRadius: 8, borderColor: "var(--color-navy-100)", fontSize: 13 }}
        />
        <Line
          type="monotone"
          dataKey="totalAmount"
          stroke="var(--color-panoryx-blue)"
          strokeWidth={2.5}
          dot={{ r: 3, fill: "var(--color-panoryx-blue)" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function FuelMixChart({ data }: { data: FuelMixPoint[] }) {
  if (data.length === 0) {
    return <EmptyChartState message="Aucune vente enregistrée sur les 7 derniers jours." />;
  }

  const chartData = data.map((d) => ({
    name: fuelTypeLabels[d.fuelType] ?? d.fuelType,
    liters: d.liters,
    fuelType: d.fuelType,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-navy-100)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: "var(--color-navy-500)" }}
          axisLine={{ stroke: "var(--color-navy-100)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "var(--color-navy-500)" }}
          axisLine={false}
          tickLine={false}
          width={60}
          tickFormatter={(v: number) => formatNumberFr(v)}
        />
        <Tooltip
          formatter={(value) => `${formatNumberFr(Number(value))} L`}
          contentStyle={{ borderRadius: 8, borderColor: "var(--color-navy-100)", fontSize: 13 }}
        />
        <Bar dataKey="liters" radius={[6, 6, 0, 0]}>
          {chartData.map((entry) => (
            <Cell key={entry.fuelType} fill={FUEL_COLORS[entry.fuelType] ?? "var(--color-panoryx-blue)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function EmptyChartState({ message }: { message: string }) {
  return (
    <div className="flex h-[260px] items-center justify-center rounded-md border border-dashed border-navy-200 text-center text-sm text-navy-500">
      {message}
    </div>
  );
}
