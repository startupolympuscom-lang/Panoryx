"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { addShopProductSchema } from "@/lib/validations/panostation";
import { addShopProduct } from "@/app/actions/panostation";
import { Field, Input, Select } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import type { DashboardStation } from "@/lib/data/panostation-dashboard";

type FormInput = z.input<typeof addShopProductSchema>;
type FormOutput = z.output<typeof addShopProductSchema>;

export function AddShopProductForm({ stations }: { stations: DashboardStation[] }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(addShopProductSchema),
    defaultValues: { stationId: stations[0]?.id },
  });

  async function onSubmit(values: FormOutput) {
    setServerError(null);
    const result = await addShopProduct(values);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    reset({ stationId: values.stationId });
    router.refresh();
  }

  if (stations.length === 0) {
    return (
      <p className="rounded-md bg-navy-50 px-3 py-2 text-sm text-navy-500">
        Créez d&apos;abord une station pour ajouter des produits.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Station" htmlFor="shopProductStationId" error={errors.stationId?.message}>
          <Select id="shopProductStationId" {...register("stationId")}>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Nom du produit" htmlFor="shopProductName" error={errors.name?.message}>
          <Input id="shopProductName" placeholder="Ex. Eau minérale 1,5L" {...register("name")} />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field
          label="Prix d'achat (MAD)"
          htmlFor="shopProductCostPrice"
          error={errors.costPrice?.message}
        >
          <Input id="shopProductCostPrice" type="number" step="0.01" min="0" {...register("costPrice")} />
        </Field>
        <Field
          label="Prix de vente (MAD)"
          htmlFor="shopProductRetailPrice"
          error={errors.retailPrice?.message}
        >
          <Input
            id="shopProductRetailPrice"
            type="number"
            step="0.01"
            min="0"
            {...register("retailPrice")}
          />
        </Field>
        <Field
          label="Stock initial"
          htmlFor="shopProductStock"
          error={errors.stockQuantity?.message}
          hint="Facultatif"
        >
          <Input id="shopProductStock" type="number" step="1" min="0" {...register("stockQuantity")} />
        </Field>
      </div>

      {serverError ? <p className="text-sm font-medium text-action-coral">{serverError}</p> : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Ajout…" : "Ajouter le produit"}
      </Button>
    </form>
  );
}
