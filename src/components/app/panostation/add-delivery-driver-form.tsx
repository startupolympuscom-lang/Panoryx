"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { addDeliveryDriverSchema } from "@/lib/validations/panostation";
import { addDeliveryDriver } from "@/app/actions/panostation";
import { Field, Input, Select } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";

interface SupplierOption {
  id: string;
  name: string;
}

type FormInput = z.input<typeof addDeliveryDriverSchema>;
type FormOutput = z.output<typeof addDeliveryDriverSchema>;

export function AddDeliveryDriverForm({
  organizationId,
  suppliers,
}: {
  organizationId: string;
  suppliers: SupplierOption[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(addDeliveryDriverSchema),
  });

  async function onSubmit(values: FormOutput) {
    setServerError(null);
    const result = await addDeliveryDriver(organizationId, values);
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
        <Field label="Nom du chauffeur" htmlFor="driverFullName" error={errors.fullName?.message}>
          <Input id="driverFullName" {...register("fullName")} />
        </Field>
        <Field
          label="Fournisseur / société"
          htmlFor="driverSupplierId"
          error={errors.supplierId?.message}
          hint="Facultatif"
        >
          <Select id="driverSupplierId" {...register("supplierId")}>
            <option value="">—</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Téléphone" htmlFor="driverPhone" error={errors.phone?.message} hint="Facultatif">
          <Input id="driverPhone" type="tel" {...register("phone")} />
        </Field>
      </div>

      {serverError ? <p className="text-sm font-medium text-action-coral">{serverError}</p> : null}

      <Button type="submit" size="sm" disabled={isSubmitting}>
        {isSubmitting ? "Ajout…" : "Ajouter le chauffeur"}
      </Button>
    </form>
  );
}
