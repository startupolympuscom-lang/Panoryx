"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { addCafeProductSchema } from "@/lib/validations/panostation";
import { addCafeProduct } from "@/app/actions/panostation";
import { Field, Input, Select } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import type { DashboardStation } from "@/lib/data/panostation-dashboard";

type FormInput = z.input<typeof addCafeProductSchema>;
type FormOutput = z.output<typeof addCafeProductSchema>;

export function AddCafeProductForm({ stations }: { stations: DashboardStation[] }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(addCafeProductSchema),
    defaultValues: { stationId: stations[0]?.id },
  });

  async function onSubmit(values: FormOutput) {
    setServerError(null);
    const result = await addCafeProduct(values);
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Station" htmlFor="cafeProductStationId" error={errors.stationId?.message}>
          <Select id="cafeProductStationId" {...register("stationId")}>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Nom du plat/boisson" htmlFor="cafeProductName" error={errors.name?.message}>
          <Input id="cafeProductName" placeholder="Ex. Café au lait" {...register("name")} />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Catégorie"
          htmlFor="cafeProductCategory"
          error={errors.category?.message}
          hint="Facultatif"
        >
          <Input id="cafeProductCategory" placeholder="Ex. Boissons chaudes" {...register("category")} />
        </Field>
        <Field label="Prix de vente (MAD)" htmlFor="cafeProductPrice" error={errors.price?.message}>
          <Input id="cafeProductPrice" type="number" step="0.01" min="0.01" {...register("price")} />
        </Field>
      </div>

      {serverError ? <p className="text-sm font-medium text-action-coral">{serverError}</p> : null}

      <Button type="submit" disabled={isSubmitting} size="sm">
        {isSubmitting ? "Ajout…" : "Ajouter au menu"}
      </Button>
    </form>
  );
}
