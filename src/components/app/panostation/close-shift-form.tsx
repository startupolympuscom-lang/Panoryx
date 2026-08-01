"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { closeShiftSchema } from "@/lib/validations/panostation";
import { closeShift } from "@/app/actions/panostation";
import { Input } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";

interface ReadingRow {
  readingId: string;
  nozzleLabel: string;
  openingIndex: number;
}

type FormInput = z.input<typeof closeShiftSchema>;
type FormOutput = z.output<typeof closeShiftSchema>;

export function CloseShiftForm({
  userId,
  shiftId,
  readings,
  onDone,
}: {
  userId: string;
  shiftId: string;
  readings: ReadingRow[];
  onDone?: () => void;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(closeShiftSchema),
    defaultValues: {
      shiftId,
      readings: readings.map((r) => ({ readingId: r.readingId, closingIndex: r.openingIndex })),
    },
  });

  const { fields } = useFieldArray({ control, name: "readings" });

  async function onSubmit(values: FormOutput) {
    setServerError(null);
    const result = await closeShift(userId, values);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    router.refresh();
    onDone?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-md bg-navy-50/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
        Relevés d&apos;index de fin
      </p>
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-center gap-3">
          <span className="w-48 shrink-0 text-sm text-navy-700">
            {readings[index]?.nozzleLabel} (début : {readings[index]?.openingIndex} L)
          </span>
          <Input
            type="number"
            step="0.01"
            className="h-9 w-36"
            {...register(`readings.${index}.closingIndex` as const)}
          />
        </div>
      ))}
      {errors.readings?.message ? (
        <p className="text-xs font-medium text-action-coral">{errors.readings.message}</p>
      ) : null}
      {serverError ? <p className="text-sm font-medium text-action-coral">{serverError}</p> : null}
      <Button type="submit" size="sm" disabled={isSubmitting}>
        {isSubmitting ? "Clôture…" : "Clôturer le quart"}
      </Button>
    </form>
  );
}
