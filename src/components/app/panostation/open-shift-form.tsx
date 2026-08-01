"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { openShiftSchema } from "@/lib/validations/panostation";
import { openShift } from "@/app/actions/panostation";
import { Field, Input, Select } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import { fuelTypeLabels } from "./nav-items";
import type { DashboardStation } from "@/lib/data/panostation-dashboard";

interface NozzleOption {
  id: string;
  label: string;
  fuelType: string;
  stationId: string;
  lastIndexLiters: number;
}

type FormInput = z.input<typeof openShiftSchema>;
type FormOutput = z.output<typeof openShiftSchema>;

export function OpenShiftForm({
  userId,
  stations,
  nozzles,
}: {
  userId: string;
  stations: DashboardStation[];
  nozzles: NozzleOption[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [stationId, setStationId] = useState(stations[0]?.id ?? "");

  const stationNozzles = nozzles.filter((n) => n.stationId === stationId);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(openShiftSchema),
    values: {
      stationId,
      notes: "",
      readings: stationNozzles.map((n) => ({ nozzleId: n.id, openingIndex: n.lastIndexLiters })),
    },
  });

  const { fields } = useFieldArray({ control, name: "readings" });

  async function onSubmit(values: FormOutput) {
    setServerError(null);
    const result = await openShift(userId, values);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Station" htmlFor="shiftStationId" error={errors.stationId?.message}>
          <Select
            id="shiftStationId"
            value={stationId}
            onChange={(e) => setStationId(e.target.value)}
          >
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Notes" htmlFor="shiftNotes" hint="Facultatif">
          <Input id="shiftNotes" {...register("notes")} />
        </Field>
      </div>

      {stationNozzles.length === 0 ? (
        <p className="rounded-md bg-navy-50 px-3 py-2 text-sm text-navy-500">
          Cette station n&apos;a pas encore de buses configurées (voir Pompes et compteurs).
        </p>
      ) : (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy-500">
            Relevés d&apos;index de début
          </p>
          <div className="space-y-2">
            {fields.map((field, index) => {
              const nozzle = stationNozzles[index];
              return (
                <div key={field.id} className="flex items-center gap-3">
                  <span className="w-48 shrink-0 text-sm text-navy-700">
                    {nozzle?.label} ({fuelTypeLabels[nozzle?.fuelType ?? ""]})
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    className="h-9 w-36"
                    {...register(`readings.${index}.openingIndex` as const)}
                  />
                </div>
              );
            })}
          </div>
          {errors.readings?.message ? (
            <p className="mt-1.5 text-xs font-medium text-action-coral">{errors.readings.message}</p>
          ) : null}
        </div>
      )}

      {serverError ? <p className="text-sm font-medium text-action-coral">{serverError}</p> : null}

      <Button type="submit" disabled={isSubmitting || stationNozzles.length === 0}>
        {isSubmitting ? "Ouverture…" : "Ouvrir le quart"}
      </Button>
    </form>
  );
}
