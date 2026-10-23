"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { setFuelPriceTrendSchema } from "@/lib/validations/panostation";
import { setFuelPriceTrend } from "@/app/actions/panostation";
import { Field, Input, Select } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";

type FormInput = z.input<typeof setFuelPriceTrendSchema>;
type FormOutput = z.output<typeof setFuelPriceTrendSchema>;

export function SetFuelPriceTrendForm({
  organizationId,
  userId,
}: {
  organizationId: string;
  userId: string;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(setFuelPriceTrendSchema),
    defaultValues: { trend: "stable" },
  });

  async function onSubmit(values: FormOutput) {
    setServerError(null);
    const result = await setFuelPriceTrend(organizationId, userId, values);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    reset({ trend: values.trend, note: "" });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Tendance des prix" htmlFor="trendValue" error={errors.trend?.message}>
          <Select id="trendValue" {...register("trend")}>
            <option value="rising">Hausse probable</option>
            <option value="falling">Baisse probable</option>
            <option value="stable">Stable</option>
          </Select>
        </Field>
        <Field label="Source / note" htmlFor="trendNote" error={errors.note?.message} hint="Facultatif">
          <Input id="trendNote" placeholder="Ex. Brent en hausse cette semaine" {...register("note")} />
        </Field>
      </div>

      {serverError ? <p className="text-sm font-medium text-action-coral">{serverError}</p> : null}

      <Button type="submit" size="sm" disabled={isSubmitting}>
        {isSubmitting ? "Enregistrement…" : "Mettre à jour la tendance"}
      </Button>
    </form>
  );
}
