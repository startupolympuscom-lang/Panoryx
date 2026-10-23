"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { addCreditCustomerSchema } from "@/lib/validations/panostation";
import { addCreditCustomer } from "@/app/actions/panostation";
import { Field, Input, Select } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import type { DashboardStation } from "@/lib/data/panostation-dashboard";

type FormInput = z.input<typeof addCreditCustomerSchema>;
type FormOutput = z.output<typeof addCreditCustomerSchema>;

export function AddCreditCustomerForm({ stations }: { stations: DashboardStation[] }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(addCreditCustomerSchema),
    defaultValues: { stationId: stations[0]?.id },
  });

  async function onSubmit(values: FormOutput) {
    setServerError(null);
    const result = await addCreditCustomer(values);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    reset({ stationId: values.stationId });
    router.refresh();
  }

  if (stations.length === 0) {
    return (
      <p className="rounded-md bg-navy-50 px-3 py-2 text-sm text-navy-500">
        Créez d&apos;abord une station pour ajouter des clients à crédit.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Station" htmlFor="creditCustomerStationId" error={errors.stationId?.message}>
          <Select id="creditCustomerStationId" {...register("stationId")}>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Nom du client" htmlFor="creditCustomerName" error={errors.name?.message}>
          <Input id="creditCustomerName" placeholder="Ex. Société Atlas Transport" {...register("name")} />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Téléphone"
          htmlFor="creditCustomerPhone"
          error={errors.phone?.message}
          hint="Facultatif"
        >
          <Input id="creditCustomerPhone" type="tel" {...register("phone")} />
        </Field>
        <Field
          label="Plafond de crédit (MAD)"
          htmlFor="creditCustomerLimit"
          error={errors.creditLimit?.message}
          hint="Facultatif — laisser vide pour aucune limite"
        >
          <Input id="creditCustomerLimit" type="number" step="0.01" min="0" {...register("creditLimit")} />
        </Field>
      </div>

      {serverError ? <p className="text-sm font-medium text-action-coral">{serverError}</p> : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Ajout…" : "Ajouter le client"}
      </Button>
    </form>
  );
}
