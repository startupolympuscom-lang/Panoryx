"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { addSupplierSchema } from "@/lib/validations/panostation";
import { addSupplier } from "@/app/actions/panostation";
import { Field, Input } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";

type FormValues = z.infer<typeof addSupplierSchema>;

export function AddSupplierForm({ organizationId }: { organizationId: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(addSupplierSchema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    const result = await addSupplier(organizationId, values);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nom du fournisseur" htmlFor="supplierName" error={errors.name?.message}>
          <Input id="supplierName" {...register("name")} />
        </Field>
        <Field label="Contact" htmlFor="contactName" error={errors.contactName?.message} hint="Facultatif">
          <Input id="contactName" {...register("contactName")} />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Téléphone" htmlFor="supplierPhone" error={errors.phone?.message} hint="Facultatif">
          <Input id="supplierPhone" type="tel" {...register("phone")} />
        </Field>
        <Field label="E-mail" htmlFor="supplierEmail" error={errors.email?.message} hint="Facultatif">
          <Input id="supplierEmail" type="email" {...register("email")} />
        </Field>
      </div>

      {serverError ? <p className="text-sm font-medium text-action-coral">{serverError}</p> : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Ajout…" : "Ajouter le fournisseur"}
      </Button>
    </form>
  );
}
