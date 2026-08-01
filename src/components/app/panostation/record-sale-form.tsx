"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { recordFuelSaleSchema } from "@/lib/validations/panostation";
import { recordFuelSale } from "@/app/actions/panostation";
import { Field, Input, Select } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import { fuelTypeLabels } from "./nav-items";

interface OpenShiftOption {
  id: string;
  stationId: string;
  stationName: string;
}

interface NozzleOption {
  id: string;
  label: string;
  fuelType: string;
  stationId: string;
}

const paymentLabels: Record<string, string> = {
  cash: "Espèces",
  card: "Carte",
  credit_account: "Compte client",
  mobile: "Paiement mobile",
};

type FormInput = z.input<typeof recordFuelSaleSchema>;
type FormOutput = z.output<typeof recordFuelSaleSchema>;

export function RecordSaleForm({
  userId,
  openShifts,
  nozzles,
}: {
  userId: string;
  openShifts: OpenShiftOption[];
  nozzles: NozzleOption[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [shiftId, setShiftId] = useState(openShifts[0]?.id ?? "");

  const currentShift = openShifts.find((s) => s.id === shiftId);
  const stationNozzles = nozzles.filter((n) => n.stationId === currentShift?.stationId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(recordFuelSaleSchema),
    values: {
      stationId: currentShift?.stationId ?? "",
      shiftId,
      nozzleId: stationNozzles[0]?.id,
      fuelType: (stationNozzles[0]?.fuelType as FormOutput["fuelType"]) ?? "gasoil",
      liters: 0,
      unitPrice: 0,
      paymentMethod: "cash",
    },
  });

  if (openShifts.length === 0) {
    return (
      <p className="rounded-md bg-navy-50 px-3 py-2 text-sm text-navy-500">
        Ouvrez d&apos;abord un quart pour pouvoir enregistrer des ventes.
      </p>
    );
  }

  async function onSubmit(values: FormOutput) {
    setServerError(null);
    const result = await recordFuelSale(userId, values);
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
        <Field label="Quart en cours" htmlFor="saleShiftId" error={errors.shiftId?.message}>
          <Select id="saleShiftId" value={shiftId} onChange={(e) => setShiftId(e.target.value)}>
            {openShifts.map((s) => (
              <option key={s.id} value={s.id}>
                {s.stationName}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Buse" htmlFor="nozzleId" error={errors.nozzleId?.message}>
          <Select id="nozzleId" {...register("nozzleId")}>
            {stationNozzles.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Carburant" htmlFor="saleFuelType" error={errors.fuelType?.message}>
          <Select id="saleFuelType" {...register("fuelType")}>
            {Object.entries(fuelTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Volume (L)" htmlFor="liters" error={errors.liters?.message}>
          <Input id="liters" type="number" step="0.01" {...register("liters")} />
        </Field>
        <Field label="Prix unitaire (MAD/L)" htmlFor="unitPrice" error={errors.unitPrice?.message}>
          <Input id="unitPrice" type="number" step="0.01" {...register("unitPrice")} />
        </Field>
      </div>

      <Field label="Mode de paiement" htmlFor="paymentMethod" error={errors.paymentMethod?.message}>
        <Select id="paymentMethod" {...register("paymentMethod")}>
          {Object.entries(paymentLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>

      {serverError ? <p className="text-sm font-medium text-action-coral">{serverError}</p> : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Enregistrement…" : "Enregistrer la vente"}
      </Button>
    </form>
  );
}
