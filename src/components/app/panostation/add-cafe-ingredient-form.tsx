"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { addCafeIngredientSchema } from "@/lib/validations/panostation";
import { addCafeIngredient } from "@/app/actions/panostation";
import { Field, Input, Select } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import type { DashboardStation } from "@/lib/data/panostation-dashboard";

type FormInput = z.input<typeof addCafeIngredientSchema>;
type FormOutput = z.output<typeof addCafeIngredientSchema>;

export function AddCafeIngredientForm({ stations }: { stations: DashboardStation[] }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(addCafeIngredientSchema),
    defaultValues: { stationId: stations[0]?.id },
  });

  async function onSubmit(values: FormOutput) {
    setServerError(null);
    const result = await addCafeIngredient(values);
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
        <Field label="Station" htmlFor="cafeIngredientStationId" error={errors.stationId?.message}>
          <Select id="cafeIngredientStationId" {...register("stationId")}>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Nom de l'ingrédient" htmlFor="cafeIngredientName" error={errors.name?.message}>
          <Input id="cafeIngredientName" placeholder="Ex. Lait" {...register("name")} />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Unité" htmlFor="cafeIngredientUnit" error={errors.unit?.message} hint="Ex. L, g, unité">
          <Input id="cafeIngredientUnit" placeholder="L" {...register("unit")} />
        </Field>
        <Field
          label="Stock initial"
          htmlFor="cafeIngredientStock"
          error={errors.stockQuantity?.message}
          hint="Facultatif"
        >
          <Input id="cafeIngredientStock" type="number" step="0.01" min="0" {...register("stockQuantity")} />
        </Field>
        <Field
          label="Seuil d'alerte"
          htmlFor="cafeIngredientThreshold"
          error={errors.lowStockThreshold?.message}
          hint="Facultatif"
        >
          <Input
            id="cafeIngredientThreshold"
            type="number"
            step="0.01"
            min="0"
            {...register("lowStockThreshold")}
          />
        </Field>
      </div>
      <Field
        label="Coût unitaire (MAD)"
        htmlFor="cafeIngredientCost"
        error={errors.costPerUnit?.message}
        hint="Facultatif"
      >
        <Input id="cafeIngredientCost" type="number" step="0.01" min="0" {...register("costPerUnit")} />
      </Field>

      {serverError ? <p className="text-sm font-medium text-action-coral">{serverError}</p> : null}

      <Button type="submit" disabled={isSubmitting} size="sm">
        {isSubmitting ? "Ajout…" : "Ajouter l'ingrédient"}
      </Button>
    </form>
  );
}
