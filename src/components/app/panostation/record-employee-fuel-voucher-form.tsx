"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { recordEmployeeFuelVoucherSchema } from "@/lib/validations/panostation";
import { recordEmployeeFuelVoucher } from "@/app/actions/panostation";
import { Field, Input, Select } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import type { DashboardStation } from "@/lib/data/panostation-dashboard";

interface EmployeeOption {
  id: string;
  fullName: string;
}

type FormInput = z.input<typeof recordEmployeeFuelVoucherSchema>;
type FormOutput = z.output<typeof recordEmployeeFuelVoucherSchema>;

export function RecordEmployeeFuelVoucherForm({
  organizationId,
  userId,
  employees,
  stations,
}: {
  organizationId: string;
  userId: string;
  employees: EmployeeOption[];
  stations: DashboardStation[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(recordEmployeeFuelVoucherSchema),
    defaultValues: { employeeId: employees[0]?.id, stationId: stations[0]?.id },
  });

  async function onSubmit(values: FormOutput) {
    setServerError(null);
    const result = await recordEmployeeFuelVoucher(organizationId, userId, values);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    reset({ employeeId: values.employeeId, stationId: values.stationId });
    router.refresh();
  }

  if (employees.length === 0 || stations.length === 0) {
    return (
      <p className="rounded-md bg-navy-50 px-3 py-2 text-sm text-navy-500">
        Ajoutez d&apos;abord un employé et une station.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Employé" htmlFor="voucherEmployeeId" error={errors.employeeId?.message}>
          <Select id="voucherEmployeeId" {...register("employeeId")}>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.fullName}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Station" htmlFor="voucherStationId" error={errors.stationId?.message}>
          <Select id="voucherStationId" {...register("stationId")}>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Montant (MAD)" htmlFor="voucherAmount" error={errors.amount?.message}>
          <Input id="voucherAmount" type="number" step="0.01" min="0.01" {...register("amount")} />
        </Field>
        <Field
          label="Bénéficiaire"
          htmlFor="voucherBeneficiary"
          error={errors.beneficiaryName?.message}
          hint="Facultatif"
        >
          <Input id="voucherBeneficiary" {...register("beneficiaryName")} />
        </Field>
      </div>
      <Field
        label="Produit donné"
        htmlFor="voucherProduct"
        error={errors.productDescription?.message}
      >
        <Input id="voucherProduct" placeholder="Ex. 20L Gasoil" {...register("productDescription")} />
      </Field>

      {serverError ? <p className="text-sm font-medium text-action-coral">{serverError}</p> : null}

      <Button type="submit" size="sm" disabled={isSubmitting}>
        {isSubmitting ? "Enregistrement…" : "Enregistrer le bon"}
      </Button>
    </form>
  );
}
