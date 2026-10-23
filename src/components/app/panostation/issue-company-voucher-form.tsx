"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { issueCompanyVoucherSchema } from "@/lib/validations/panostation";
import { issueCompanyVoucher } from "@/app/actions/panostation";
import { Field, Input, Select } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import type { DashboardStation } from "@/lib/data/panostation-dashboard";

interface CompanyOption {
  id: string;
  stationId: string;
  name: string;
}

type FormInput = z.input<typeof issueCompanyVoucherSchema>;
type FormOutput = z.output<typeof issueCompanyVoucherSchema>;

export function IssueCompanyVoucherForm({
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
    resolver: zodResolver(issueCompanyVoucherSchema),
    values: {
      stationId,
      companyId: stationCompanies[0]?.id ?? "",
      amount: 0,
      productDescription: "",
    },
  });

  async function onSubmit(values: FormOutput) {
    setServerError(null);
    const result = await issueCompanyVoucher(userId, values);
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
        Ajoutez d&apos;abord une entreprise pour émettre un bon.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Station" htmlFor="issueVoucherStationId" error={errors.stationId?.message}>
          <Select id="issueVoucherStationId" value={stationId} onChange={(e) => setStationId(e.target.value)}>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Entreprise" htmlFor="issueVoucherCompanyId" error={errors.companyId?.message}>
          <Select id="issueVoucherCompanyId" {...register("companyId")}>
            {stationCompanies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Montant (MAD)" htmlFor="issueVoucherAmount" error={errors.amount?.message}>
          <Input id="issueVoucherAmount" type="number" step="0.01" min="0.01" {...register("amount")} />
        </Field>
        <Field
          label="Produit"
          htmlFor="issueVoucherProduct"
          error={errors.productDescription?.message}
        >
          <Input id="issueVoucherProduct" placeholder="Ex. Plein gasoil" {...register("productDescription")} />
        </Field>
      </div>
      <p className="text-xs text-navy-500">
        Le cachet et la signature peuvent être joints via la page Documents (catégorie « Bon signé »).
      </p>

      {serverError ? <p className="text-sm font-medium text-action-coral">{serverError}</p> : null}

      <Button type="submit" size="sm" disabled={isSubmitting || stationCompanies.length === 0}>
        {isSubmitting ? "Enregistrement…" : "Émettre le bon"}
      </Button>
    </form>
  );
}
