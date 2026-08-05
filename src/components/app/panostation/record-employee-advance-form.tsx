"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { recordEmployeeAdvanceSchema } from "@/lib/validations/panostation";
import { recordEmployeeAdvance } from "@/app/actions/panostation";
import { Field, Input, Select } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";

interface EmployeeOption {
  id: string;
  fullName: string;
}

type FormInput = z.input<typeof recordEmployeeAdvanceSchema>;
type FormOutput = z.output<typeof recordEmployeeAdvanceSchema>;

export function RecordEmployeeAdvanceForm({
  organizationId,
  userId,
  employees,
}: {
  organizationId: string;
  userId: string;
  employees: EmployeeOption[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(recordEmployeeAdvanceSchema),
    defaultValues: { employeeId: employees[0]?.id },
  });

  async function onSubmit(values: FormOutput) {
    setServerError(null);
    const result = await recordEmployeeAdvance(organizationId, userId, values);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    reset({ employeeId: values.employeeId });
    router.refresh();
  }

  if (employees.length === 0) {
    return (
      <p className="rounded-md bg-navy-50 px-3 py-2 text-sm text-navy-500">
        Ajoutez d&apos;abord un employé pour enregistrer une avance.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Field label="Employé" htmlFor="advanceEmployeeId" error={errors.employeeId?.message}>
        <Select id="advanceEmployeeId" {...register("employeeId")}>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.fullName}
            </option>
          ))}
        </Select>
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Montant (MAD)" htmlFor="advanceAmount" error={errors.amount?.message}>
          <Input id="advanceAmount" type="number" step="0.01" min="0.01" {...register("amount")} />
        </Field>
        <Field label="Note" htmlFor="advanceNote" error={errors.note?.message} hint="Facultatif">
          <Input id="advanceNote" {...register("note")} />
        </Field>
      </div>

      {serverError ? <p className="text-sm font-medium text-action-coral">{serverError}</p> : null}

      <Button type="submit" size="sm" disabled={isSubmitting}>
        {isSubmitting ? "Enregistrement…" : "Enregistrer l'avance"}
      </Button>
    </form>
  );
}
