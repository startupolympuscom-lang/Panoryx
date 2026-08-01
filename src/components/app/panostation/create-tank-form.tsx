"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { createTankSchema } from "@/lib/validations/panostation";
import { createTank } from "@/app/actions/panostation";
import { Field, Input, Select } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import { fuelTypeLabels } from "./nav-items";
import type { DashboardStation } from "@/lib/data/panostation-dashboard";

type FormInput = z.input<typeof createTankSchema>;
type FormOutput = z.output<typeof createTankSchema>;

export function CreateTankForm({ stations }: { stations: DashboardStation[] }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(createTankSchema),
    defaultValues: { stationId: stations[0]?.id },
  });

  async function onSubmit(values: FormOutput) {
    setServerError(null);
    const result = await createTank(values);
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
        <Field label="Station" htmlFor="stationId" error={errors.stationId?.message}>
          <Select id="stationId" {...register("stationId")}>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Libellé" htmlFor="label" error={errors.label?.message}>
          <Input id="label" placeholder="Ex. Cuve 1 — Gasoil" {...register("label")} />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Type de carburant" htmlFor="fuelType" error={errors.fuelType?.message}>
          <Select id="fuelType" {...register("fuelType")}>
            {Object.entries(fuelTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Capacité (L)" htmlFor="capacityLiters" error={errors.capacityLiters?.message}>
          <Input id="capacityLiters" type="number" step="1" {...register("capacityLiters")} />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Volume actuel (L)"
          htmlFor="currentVolumeLiters"
          error={errors.currentVolumeLiters?.message}
        >
          <Input id="currentVolumeLiters" type="number" step="1" {...register("currentVolumeLiters")} />
        </Field>
        <Field
          label="Seuil d'alerte bas (L)"
          htmlFor="lowLevelThresholdLiters"
          error={errors.lowLevelThresholdLiters?.message}
        >
          <Input
            id="lowLevelThresholdLiters"
            type="number"
            step="1"
            {...register("lowLevelThresholdLiters")}
          />
        </Field>
      </div>

      {serverError ? <p className="text-sm font-medium text-action-coral">{serverError}</p> : null}

      <Button type="submit" disabled={isSubmitting || stations.length === 0}>
        {isSubmitting ? "Création…" : "Créer la cuve"}
      </Button>
      {stations.length === 0 ? (
        <p className="text-xs text-navy-500">Créez d&apos;abord une station dans Paramètres.</p>
      ) : null}
    </form>
  );
}
