"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { recordVignetteUsageSchema } from "@/lib/validations/panostation";
import { recordVignetteUsage } from "@/app/actions/panostation";
import { Field, Input, Select } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import type { DashboardStation } from "@/lib/data/panostation-dashboard";

interface CompanyOption {
  id: string;
  stationId: string;
  name: string;
}

type FormInput = z.input<typeof recordVignetteUsageSchema>;
type FormOutput = z.output<typeof recordVignetteUsageSchema>;

export function RecordVignetteUsageForm({
  userId,
  stations,
  companies,
}: {
  userId: string;
  stations: DashboardStation[];
  companies: CompanyOption[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [stationId, setStationId] = useState(stations[0]?.id ?? "");
  const stationCompanies = companies.filter((c) => c.stationId === stationId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(recordVignetteUsageSchema),
    values: {
      stationId,
      companyId: stationCompanies[0]?.id ?? "",
      vignetteType: "fuel",
      amount: 0,
      productDescription: "",
    },
  });

  async function onSubmit(values: FormOutput) {
    setServerError(null);
    const result = await recordVignetteUsage(userId, values);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    reset();
    router.refresh();
  }

  if (companies.length === 0) {
    return (
      <p className="rounded-md bg-navy-50 px-3 py-2 text-sm text-navy-500">
        Ajoutez d&apos;abord une entreprise pour enregistrer une vignette.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Station" htmlFor="vignetteStationId" error={errors.stationId?.message}>
          <Select id="vignetteStationId" value={stationId} onChange={(e) => setStationId(e.target.value)}>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Entreprise" htmlFor="vignetteCompanyId" error={errors.companyId?.message}>
          <Select id="vignetteCompanyId" {...register("companyId")}>
            {stationCompanies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Type de vignette" htmlFor="vignetteType" error={errors.vignetteType?.message}>
          <Select id="vignetteType" {...register("vignetteType")}>
            <option value="fuel">Carburant</option>
            <option value="cafe_boutique">Café / Boutique</option>
          </Select>
        </Field>
        <Field label="Montant (MAD)" htmlFor="vignetteAmount" error={errors.amount?.message}>
          <Input id="vignetteAmount" type="number" step="0.01" min="0.01" {...register("amount")} />
        </Field>
        <Field
          label="Produit"
          htmlFor="vignetteProduct"
          error={errors.productDescription?.message}
          hint="Facultatif"
        >
          <Input id="vignetteProduct" {...register("productDescription")} />
        </Field>
      </div>

      {serverError ? <p className="text-sm font-medium text-action-coral">{serverError}</p> : null}

      <Button type="submit" size="sm" disabled={isSubmitting || stationCompanies.length === 0}>
        {isSubmitting ? "Enregistrement…" : "Enregistrer l'utilisation"}
      </Button>
    </form>
  );
}
