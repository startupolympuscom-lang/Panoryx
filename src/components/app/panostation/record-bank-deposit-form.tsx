"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { recordBankDepositSchema } from "@/lib/validations/panostation";
import { recordBankDeposit } from "@/app/actions/panostation";
import { Field, Input, Select } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import type { DashboardStation } from "@/lib/data/panostation-dashboard";

type FormInput = z.input<typeof recordBankDepositSchema>;
type FormOutput = z.output<typeof recordBankDepositSchema>;

export function RecordBankDepositForm({
  userId,
  stations,
}: {
  userId: string;
  stations: DashboardStation[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(recordBankDepositSchema),
    defaultValues: { stationId: stations[0]?.id, depositDate: today },
  });

  async function onSubmit(values: FormOutput) {
    setServerError(null);
    const result = await recordBankDeposit(userId, values);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    reset({ stationId: values.stationId, depositDate: today });
    router.refresh();
  }

  if (stations.length === 0) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Station" htmlFor="depositStationId" error={errors.stationId?.message}>
          <Select id="depositStationId" {...register("stationId")}>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Déposé par" htmlFor="depositorName" error={errors.depositorName?.message}>
          <Input id="depositorName" placeholder="Nom de la personne" {...register("depositorName")} />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Montant (MAD)" htmlFor="depositAmount" error={errors.amount?.message}>
          <Input id="depositAmount" type="number" step="0.01" min="0.01" {...register("amount")} />
        </Field>
        <Field label="Date" htmlFor="depositDate" error={errors.depositDate?.message}>
          <Input id="depositDate" type="date" max={today} {...register("depositDate")} />
        </Field>
      </div>

      {serverError ? <p className="text-sm font-medium text-action-coral">{serverError}</p> : null}

      <Button type="submit" disabled={isSubmitting} size="sm">
        {isSubmitting ? "Enregistrement…" : "Enregistrer le versement"}
      </Button>
    </form>
  );
}
