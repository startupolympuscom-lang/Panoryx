import { Fuel, Clock, Truck, Wrench, AlertTriangle, Info, AlertCircle } from "lucide-react";
import { formatDateTimeFr } from "@/lib/utils";
import type { ActivityItem, AlertItem } from "@/lib/data/panostation-dashboard";

const activityIcons = {
  sale: Fuel,
  shift_open: Clock,
  shift_close: Clock,
  delivery: Truck,
  incident: Wrench,
} as const;

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-navy-500">Aucune activité récente.</p>
    );
  }

  return (
    <ul className="divide-y divide-navy-100">
      {items.map((item) => {
        const Icon = activityIcons[item.type];
        return (
          <li key={item.id} className="flex items-center gap-3 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-navy-50 text-navy-500">
              <Icon size={15} aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-navy">{item.label}</p>
              <p className="text-xs text-navy-500">{formatDateTimeFr(item.timestamp)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

const severityIcon = {
  info: Info,
  warning: AlertTriangle,
  critical: AlertCircle,
} as const;

const severityClasses = {
  info: "bg-blue-50 text-panoryx-blue",
  warning: "bg-orange-50 text-pulse-orange",
  critical: "bg-red-50 text-action-coral",
} as const;

export function AlertCenter({ alerts }: { alerts: AlertItem[] }) {
  if (alerts.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-navy-500">Aucune alerte active. Tout est sous contrôle.</p>
    );
  }

  return (
    <ul className="space-y-2">
      {alerts.map((alert) => {
        const Icon = severityIcon[alert.severity];
        return (
          <li
            key={alert.id}
            className="flex items-start gap-3 rounded-md border border-navy-100 p-3"
          >
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${severityClasses[alert.severity]}`}>
              <Icon size={14} aria-hidden="true" />
            </div>
            <p className="text-sm text-navy-700">{alert.message}</p>
          </li>
        );
      })}
    </ul>
  );
}
