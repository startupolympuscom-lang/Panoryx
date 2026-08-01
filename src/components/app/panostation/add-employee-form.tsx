"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { addEmployeeSchema } from "@/lib/validations/panostation";
import { addEmployee } from "@/app/actions/panostation";
import { Field, Input, Select } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import type { DashboardStation } from "@/lib/data/panostation-dashboard";

type FormValues = z.infer<typeof addEmployeeSchema>;

export function AddEmployeeForm({
  organizationId,
  stations,
}: {
  organizationId: string;
  stations: DashboardStation[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(addEmployeeSchema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    const result = await addEmployee(organizationId, values);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Nom complet" htmlFor="employeeName" error={errors.fullName?.message}>
          <Input id="employeeName" {...register("fullName")} />
        </Field>
        <Field label="Fonction" htmlFor="roleTitle" error={errors.roleTitle?.message} hint="Facultatif">
          <Input id="roleTitle" placeholder="Ex. Pompiste" {...register("roleTitle")} />
        </Field>
        <Field label="Station" htmlFor="employeeStationId" error={errors.stationId?.message}>
          <Select id="employeeStationId" {...register("stationId")}>
            <option value="">—</option>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Téléphone" htmlFor="employeePhone" error={errors.phone?.message} hint="Facultatif">
        <Input id="employeePhone" type="tel" {...register("phone")} />
      </Field>

      {serverError ? <p className="text-sm font-medium text-action-coral">{serverError}</p> : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Ajout…" : "Ajouter l'employé"}
      </Button>
    </form>
  );
}
