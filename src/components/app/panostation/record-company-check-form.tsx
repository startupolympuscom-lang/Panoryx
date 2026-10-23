"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { recordCompanyCheckSchema } from "@/lib/validations/panostation";
import { recordCompanyCheck } from "@/app/actions/panostation";
import { Field, Input, Select } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import type { DashboardStation } from "@/lib/data/panostation-dashboard";

type FormInput = z.input<typeof recordCompanyCheckSchema>;
type FormOutput = z.output<typeof recordCompanyCheckSchema>;

const categories = ["Électricité", "Eau", "Winxo", "Autre"];

export function RecordCompanyCheckForm({
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
    resolver: zodResolver(recordCompanyCheckSchema),
    defaultValues: { stationId: stations[0]?.id, category: categories[0], issuedDate: today },
  });

  async function onSubmit(values: FormOutput) {
    setServerError(null);
    const result = await recordCompanyCheck(userId, values);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    reset({ stationId: values.stationId, category: values.category, issuedDate: today });
    router.refresh();
  }

  if (stations.length === 0) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Station" htmlFor="companyCheckStationId" error={errors.stationId?.message}>
          <Select id="companyCheckStationId" {...register("stationId")}>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Bénéficiaire" htmlFor="companyCheckBeneficiary" error={errors.beneficiary?.message}>
          <Input id="companyCheckBeneficiary" placeholder="Ex. Lydec" {...register("beneficiary")} />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Catégorie" htmlFor="companyCheckCategory" error={errors.category?.message}>
          <Select id="companyCheckCategory" {...register("category")}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Montant (MAD)" htmlFor="companyCheckAmount" error={errors.amount?.message}>
          <Input id="companyCheckAmount" type="number" step="0.01" min="0.01" {...register("amount")} />
        </Field>
        <Field label="N° de chèque" htmlFor="companyCheckNumber" error={errors.checkNumber?.message}>
          <Input id="companyCheckNumber" {...register("checkNumber")} />
        </Field>
      </div>
      <Field label="Date d'émission" htmlFor="companyCheckDate" error={errors.issuedDate?.message}>
        <Input id="companyCheckDate" type="date" max={today} {...register("issuedDate")} />
      </Field>

      {serverError ? <p className="text-sm font-medium text-action-coral">{serverError}</p> : null}

      <Button type="submit" size="sm" disabled={isSubmitting}>
        {isSubmitting ? "Enregistrement…" : "Enregistrer le chèque"}
      </Button>
    </form>
  );
}
