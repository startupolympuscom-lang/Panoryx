"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { createPumpSchema, createNozzleSchema } from "@/lib/validations/panostation";
import { createPump, createNozzle } from "@/app/actions/panostation";
import { Field, Input, Select } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import { fuelTypeLabels } from "./nav-items";
import type { DashboardStation } from "@/lib/data/panostation-dashboard";

type PumpFormValues = z.infer<typeof createPumpSchema>;

export function CreatePumpForm({ stations }: { stations: DashboardStation[] }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PumpFormValues>({
    resolver: zodResolver(createPumpSchema),
    defaultValues: { stationId: stations[0]?.id },
  });

  async function onSubmit(values: PumpFormValues) {
    setServerError(null);
    const result = await createPump(values);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    reset({ stationId: values.stationId });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Station" htmlFor="pumpStationId" error={errors.stationId?.message}>
          <Select id="pumpStationId" {...register("stationId")}>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Libellé de la pompe" htmlFor="pumpLabel" error={errors.label?.message}>
          <Input id="pumpLabel" placeholder="Ex. Pompe 1" {...register("label")} />
        </Field>
      </div>
      {serverError ? <p className="text-sm font-medium text-action-coral">{serverError}</p> : null}
      <Button type="submit" disabled={isSubmitting || stations.length === 0}>
        {isSubmitting ? "Création…" : "Créer la pompe"}
      </Button>
    </form>
  );
}

interface TankOption {
  id: string;
  label: string;
  stationId: string;
}

interface PumpOption {
  id: string;
  label: string;
  stationId: string;
}

type NozzleFormInput = z.input<typeof createNozzleSchema>;
type NozzleFormOutput = z.output<typeof createNozzleSchema>;

export function CreateNozzleForm({
  stations,
  pumps,
  tanks,
}: {
  stations: DashboardStation[];
  pumps: PumpOption[];
  tanks: TankOption[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NozzleFormInput, unknown, NozzleFormOutput>({
    resolver: zodResolver(createNozzleSchema),
    defaultValues: { stationId: stations[0]?.id, lastIndexLiters: 0 },
  });

  const selectedStationId = watch("stationId");
  const stationPumps = pumps.filter((p) => p.stationId === selectedStationId);
  const stationTanks = tanks.filter((t) => t.stationId === selectedStationId);

  async function onSubmit(values: NozzleFormOutput) {
    setServerError(null);
    const result = await createNozzle(values);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    reset({ stationId: values.stationId, lastIndexLiters: 0 });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Station" htmlFor="nozzleStationId" error={errors.stationId?.message}>
          <Select id="nozzleStationId" {...register("stationId")}>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Pompe" htmlFor="pumpId" error={errors.pumpId?.message}>
          <Select id="pumpId" {...register("pumpId")}>
            <option value="">Sélectionner…</option>
            {stationPumps.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Cuve associée" htmlFor="tankId" error={errors.tankId?.message}>
          <Select id="tankId" {...register("tankId")}>
            <option value="">Sélectionner…</option>
            {stationTanks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Libellé de la buse" htmlFor="nozzleLabel" error={errors.label?.message}>
          <Input id="nozzleLabel" placeholder="Ex. Buse Gasoil" {...register("label")} />
        </Field>
        <Field label="Type de carburant" htmlFor="nozzleFuelType" error={errors.fuelType?.message}>
          <Select id="nozzleFuelType" {...register("fuelType")}>
            {Object.entries(fuelTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Index actuel (L)"
          htmlFor="lastIndexLiters"
          error={errors.lastIndexLiters?.message}
        >
          <Input id="lastIndexLiters" type="number" step="0.01" {...register("lastIndexLiters")} />
        </Field>
      </div>

      {serverError ? <p className="text-sm font-medium text-action-coral">{serverError}</p> : null}

      <Button type="submit" disabled={isSubmitting || stationPumps.length === 0 || stationTanks.length === 0}>
        {isSubmitting ? "Création…" : "Créer la buse"}
      </Button>
      {stationPumps.length === 0 || stationTanks.length === 0 ? (
        <p className="text-xs text-navy-500">
          Cette station a besoin d&apos;au moins une pompe et une cuve avant de créer une buse.
        </p>
      ) : null}
    </form>
  );
}
