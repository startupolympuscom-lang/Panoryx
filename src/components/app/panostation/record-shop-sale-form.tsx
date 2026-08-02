"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { recordShopSaleSchema } from "@/lib/validations/panostation";
import { recordShopSale } from "@/app/actions/panostation";
import { Field, Input, Select } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import type { DashboardStation } from "@/lib/data/panostation-dashboard";

interface ShopProductOption {
  id: string;
  stationId: string;
  name: string;
  retailPrice: number;
}

type FormInput = z.input<typeof recordShopSaleSchema>;
type FormOutput = z.output<typeof recordShopSaleSchema>;

export function RecordShopSaleForm({
  userId,
  stations,
  products,
}: {
  userId: string;
  stations: DashboardStation[];
  products: ShopProductOption[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [stationId, setStationId] = useState(stations[0]?.id ?? "");
  const stationProducts = products.filter((p) => p.stationId === stationId);
  const today = new Date().toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(recordShopSaleSchema),
    values: {
      stationId,
      productId: stationProducts[0]?.id ?? "",
      quantity: 1,
      soldAt: today,
    },
  });

  async function onSubmit(values: FormOutput) {
    setServerError(null);
    const result = await recordShopSale(userId, values);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    reset();
    router.refresh();
  }

  if (products.length === 0) {
    return (
      <p className="rounded-md bg-navy-50 px-3 py-2 text-sm text-navy-500">
        Ajoutez d&apos;abord un produit au catalogue pour enregistrer une vente.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Station" htmlFor="shopSaleStationId" error={errors.stationId?.message}>
          <Select id="shopSaleStationId" value={stationId} onChange={(e) => setStationId(e.target.value)}>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Produit" htmlFor="shopSaleProductId" error={errors.productId?.message}>
          <Select id="shopSaleProductId" {...register("productId")}>
            {stationProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Quantité" htmlFor="shopSaleQuantity" error={errors.quantity?.message}>
          <Input id="shopSaleQuantity" type="number" step="1" min="1" {...register("quantity")} />
        </Field>
        <Field
          label="Date de la vente"
          htmlFor="shopSaleDate"
          error={errors.soldAt?.message}
          hint="Modifiable pour enregistrer une vente passée"
        >
          <Input id="shopSaleDate" type="date" max={today} {...register("soldAt")} />
        </Field>
      </div>

      {serverError ? <p className="text-sm font-medium text-action-coral">{serverError}</p> : null}

      <Button type="submit" disabled={isSubmitting || stationProducts.length === 0}>
        {isSubmitting ? "Enregistrement…" : "Enregistrer la vente"}
      </Button>
      {stationProducts.length === 0 ? (
        <p className="text-xs text-navy-500">Aucun produit au catalogue pour cette station.</p>
      ) : null}
    </form>
  );
}
