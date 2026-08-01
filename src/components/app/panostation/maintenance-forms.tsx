"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { createMaintenanceTicketSchema } from "@/lib/validations/panostation";
import { createMaintenanceTicket, updateMaintenanceTicket } from "@/app/actions/panostation";
import { Field, Input, Select, Textarea } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import type { DashboardStation } from "@/lib/data/panostation-dashboard";

const priorityLabels: Record<string, string> = {
  low: "Basse",
  medium: "Moyenne",
  high: "Haute",
  critical: "Critique",
};

const statusLabels: Record<string, string> = {
  open: "Ouvert",
  in_progress: "En cours",
  resolved: "Résolu",
  closed: "Clôturé",
};

type FormValues = z.infer<typeof createMaintenanceTicketSchema>;

export function CreateTicketForm({
  organizationId,
  userId,
  stations,
}: {
  organizationId: string;
  userId: string;
  stations: DashboardStation[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(createMaintenanceTicketSchema),
    defaultValues: { stationId: stations[0]?.id, priority: "medium" },
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    const result = await createMaintenanceTicket(organizationId, userId, values);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    reset({ stationId: values.stationId, priority: "medium" });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Station" htmlFor="ticketStationId" error={errors.stationId?.message}>
          <Select id="ticketStationId" {...register("stationId")}>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Titre" htmlFor="ticketTitle" error={errors.title?.message} className="sm:col-span-2">
          <Input id="ticketTitle" placeholder="Ex. Pompe 2 hors service" {...register("title")} />
        </Field>
      </div>
      <Field label="Description" htmlFor="ticketDescription" error={errors.description?.message} hint="Facultatif">
        <Textarea id="ticketDescription" rows={3} {...register("description")} />
      </Field>
      <Field label="Priorité" htmlFor="ticketPriority" error={errors.priority?.message}>
        <Select id="ticketPriority" {...register("priority")}>
          {Object.entries(priorityLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>

      {serverError ? <p className="text-sm font-medium text-action-coral">{serverError}</p> : null}

      <Button type="submit" disabled={isSubmitting || stations.length === 0}>
        {isSubmitting ? "Création…" : "Créer le ticket"}
      </Button>
    </form>
  );
}

export function TicketStatusSelect({ ticketId, status }: { ticketId: string; status: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setPending(true);
    await updateMaintenanceTicket({
      ticketId,
      status: e.target.value as "open" | "in_progress" | "resolved" | "closed",
    });
    setPending(false);
    router.refresh();
  }

  return (
    <select
      defaultValue={status}
      onChange={onChange}
      disabled={pending}
      className="h-8 rounded-md border border-navy-200 bg-white px-2 text-xs font-medium text-navy focus:border-panoryx-blue focus:outline-none"
    >
      {Object.entries(statusLabels).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
