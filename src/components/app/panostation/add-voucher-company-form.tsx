"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { addVoucherCompanySchema } from "@/lib/validations/panostation";
import { addVoucherCompany } from "@/app/actions/panostation";
import { Field, Input, Select } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import type { DashboardStation } from "@/lib/data/panostation-dashboard";

type FormInput = z.input<typeof addVoucherCompanySchema>;
type FormOutput = z.output<typeof addVoucherCompanySchema>;

export function AddVoucherCompanyForm({ stations }: { stations: DashboardStation[] }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(addVoucherCompanySchema),
    defaultValues: { stationId: stations[0]?.id },
  });

  async function onSubmit(values: FormOutput) {
    setServerError(null);
    const result = await addVoucherCompany(values);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    reset({ stationId: values.stationId });
    router.refresh();
  }

  if (stations.length === 0) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Station" htmlFor="voucherCompanyStationId" error={errors.stationId?.message}>
          <Select id="voucherCompanyStationId" {...register("stationId")}>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Nom de l'entreprise" htmlFor="voucherCompanyName" error={errors.name?.message}>
          <Input id="voucherCompanyName" placeholder="Ex. JAMA3A" {...register("name")} />
        </Field>
        <Field label="Téléphone" htmlFor="voucherCompanyPhone" error={errors.phone?.message} hint="Facultatif">
          <Input id="voucherCompanyPhone" type="tel" {...register("phone")} />
        </Field>
      </div>

      {serverError ? <p className="text-sm font-medium text-action-coral">{serverError}</p> : null}

      <Button type="submit" size="sm" disabled={isSubmitting}>
        {isSubmitting ? "Ajout…" : "Ajouter l'entreprise"}
      </Button>
    </form>
  );
}
