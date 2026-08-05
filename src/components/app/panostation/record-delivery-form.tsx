"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { recordDeliverySchema } from "@/lib/validations/panostation";
import { recordDelivery } from "@/app/actions/panostation";
import { Field, Input, Select } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import type { DashboardStation } from "@/lib/data/panostation-dashboard";

interface TankOption {
  id: string;
  label: string;
  stationId: string;
}

interface SupplierOption {
  id: string;
  name: string;
}

interface DriverOption {
  id: string;
  fullName: string;
}

type FormInput = z.input<typeof recordDeliverySchema>;
type FormOutput = z.output<typeof recordDeliverySchema>;

export function RecordDeliveryForm({
  userId,
  stations,
  tanks,
  suppliers,
  drivers = [],
}: {
  userId: string;
  stations: DashboardStation[];
  tanks: TankOption[];
  suppliers: SupplierOption[];
  drivers?: DriverOption[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [stationId, setStationId] = useState(stations[0]?.id ?? "");
  const stationTanks = tanks.filter((t) => t.stationId === stationId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(recordDeliverySchema),
    values: {
      stationId,
      tankId: stationTanks[0]?.id ?? "",
      supplierId: suppliers[0]?.id,
      driverId: undefined,
      orderedQuantity: undefined,
      liters: 0,
      unitCost: undefined,
      deliveryNoteRef: "",
    },
  });

  async function onSubmit(values: FormOutput) {
    setServerError(null);
    const result = await recordDelivery(userId, values);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    reset();
    router.refresh();
  }

  if (tanks.length === 0) {
    return (
      <p className="rounded-md bg-navy-50 px-3 py-2 text-sm text-navy-500">
        Créez d&apos;abord une cuve pour pouvoir enregistrer une livraison.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Station" htmlFor="deliveryStationId" error={errors.stationId?.message}>
          <Select id="deliveryStationId" value={stationId} onChange={(e) => setStationId(e.target.value)}>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Cuve" htmlFor="tankId" error={errors.tankId?.message}>
          <Select id="tankId" {...register("tankId")}>
            {stationTanks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Fournisseur" htmlFor="supplierId" error={errors.supplierId?.message} hint="Facultatif">
          <Select id="supplierId" {...register("supplierId")}>
            <option value="">—</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field
          label="Chauffeur / livreur"
          htmlFor="driverId"
          error={errors.driverId?.message}
          hint="Facultatif"
        >
          <Select id="driverId" {...register("driverId")}>
            <option value="">—</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.fullName}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Quantité commandée (L)"
          htmlFor="orderedQuantity"
          error={errors.orderedQuantity?.message}
          hint="Facultatif — pour comparer à ce qui est livré"
        >
          <Input id="orderedQuantity" type="number" step="0.01" {...register("orderedQuantity")} />
        </Field>
        <Field label="Volume livré (L)" htmlFor="deliveryLiters" error={errors.liters?.message}>
          <Input id="deliveryLiters" type="number" step="0.01" {...register("liters")} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Coût unitaire (MAD/L)"
          htmlFor="unitCost"
          error={errors.unitCost?.message}
          hint="Facultatif — utilisé pour estimer la marge"
        >
          <Input id="unitCost" type="number" step="0.01" {...register("unitCost")} />
        </Field>
        <Field
          label="Référence bon de livraison"
          htmlFor="deliveryNoteRef"
          error={errors.deliveryNoteRef?.message}
          hint="Facultatif"
        >
          <Input id="deliveryNoteRef" {...register("deliveryNoteRef")} />
        </Field>
      </div>

      {serverError ? <p className="text-sm font-medium text-action-coral">{serverError}</p> : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Enregistrement…" : "Enregistrer la livraison"}
      </Button>
    </form>
  );
}
