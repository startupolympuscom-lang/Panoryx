"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { createStationSchema } from "@/lib/validations/panostation";
import { createStation } from "@/app/actions/panostation";
import { Field, Input } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";

type FormValues = z.infer<typeof createStationSchema>;

export function CreateStationForm({ organizationId }: { organizationId: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(createStationSchema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    setSuccess(false);
    const result = await createStation(organizationId, values);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    setSuccess(true);
    reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nom de la station" htmlFor="name" error={errors.name?.message}>
          <Input id="name" placeholder="Ex. Casablanca Centre" {...register("name")} />
        </Field>
        <Field label="Ville" htmlFor="city" error={errors.city?.message}>
          <Input id="city" placeholder="Ex. Casablanca" {...register("city")} />
        </Field>
      </div>
      <Field label="Adresse" htmlFor="address" error={errors.address?.message} hint="Facultatif">
        <Input id="address" {...register("address")} />
      </Field>

      {serverError ? <p className="text-sm font-medium text-action-coral">{serverError}</p> : null}
      {success ? <p className="text-sm font-medium text-emerald-600">Station créée avec succès.</p> : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Création…" : "Créer la station"}
      </Button>
    </form>
  );
}
