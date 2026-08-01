"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { recordCashReconciliationSchema } from "@/lib/validations/panostation";
import { recordCashReconciliation } from "@/app/actions/panostation";
import { Field, Input, Select } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";

interface ShiftOption {
  id: string;
  stationId: string;
  stationName: string;
  expectedCash: number;
}

type FormInput = z.input<typeof recordCashReconciliationSchema>;
type FormOutput = z.output<typeof recordCashReconciliationSchema>;

export function RecordCashForm({
  userId,
  shifts,
}: {
  userId: string;
  shifts: ShiftOption[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [shiftId, setShiftId] = useState(shifts[0]?.id ?? "");
  const shift = shifts.find((s) => s.id === shiftId);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(recordCashReconciliationSchema),
    values: {
      shiftId,
      stationId: shift?.stationId ?? "",
      expectedAmount: shift?.expectedCash ?? 0,
      countedAmount: shift?.expectedCash ?? 0,
      notes: "",
    },
  });

  if (shifts.length === 0) {
    return (
      <p className="rounded-md bg-navy-50 px-3 py-2 text-sm text-navy-500">
        Aucun quart clôturé en attente de rapprochement de caisse.
      </p>
    );
  }

  const expected = watch("expectedAmount");
  const counted = watch("countedAmount");
  const diff = Number(counted || 0) - Number(expected || 0);

  async function onSubmit(values: FormOutput) {
    setServerError(null);
    const result = await recordCashReconciliation(userId, values);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Field label="Quart clôturé" htmlFor="cashShiftId" error={errors.shiftId?.message}>
        <Select id="cashShiftId" value={shiftId} onChange={(e) => setShiftId(e.target.value)}>
          {shifts.map((s) => (
            <option key={s.id} value={s.id}>
              {s.stationName}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Montant attendu (MAD)"
          htmlFor="expectedAmount"
          error={errors.expectedAmount?.message}
          hint="Pré-rempli à partir des ventes en espèces du quart"
        >
          <Input id="expectedAmount" type="number" step="0.01" {...register("expectedAmount")} />
        </Field>
        <Field label="Montant compté (MAD)" htmlFor="countedAmount" error={errors.countedAmount?.message}>
          <Input id="countedAmount" type="number" step="0.01" {...register("countedAmount")} />
        </Field>
      </div>

      <p className={`text-sm font-semibold ${diff < 0 ? "text-action-coral" : diff > 0 ? "text-pulse-orange" : "text-emerald-600"}`}>
        Écart : {diff.toFixed(2)} MAD
      </p>

      <Field label="Notes" htmlFor="cashNotes" error={errors.notes?.message} hint="Facultatif">
        <Input id="cashNotes" {...register("notes")} />
      </Field>

      {serverError ? <p className="text-sm font-medium text-action-coral">{serverError}</p> : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Enregistrement…" : "Enregistrer le rapprochement"}
      </Button>
    </form>
  );
}
