"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { recordDeliveryShortfallSchema } from "@/lib/validations/panostation";
import { recordDeliveryShortfall } from "@/app/actions/panostation";
import { Field, Input, Select, Textarea } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import { formatDateFr, formatNumberFr } from "@/lib/utils";

interface DeliveryOption {
  id: string;
  stationId: string;
  tankLabel: string;
  deliveredAt: string;
  orderedQuantity: number;
  liters: number;
  driverName: string | null;
}

type FormInput = z.input<typeof recordDeliveryShortfallSchema>;
type FormOutput = z.output<typeof recordDeliveryShortfallSchema>;

export function RecordDeliveryShortfallForm({
  userId,
  deliveries,
}: {
  userId: string;
  deliveries: DeliveryOption[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [deliveryId, setDeliveryId] = useState(deliveries[0]?.id ?? "");
  const selected = useMemo(() => deliveries.find((d) => d.id === deliveryId), [deliveries, deliveryId]);
  const defaultMissing = selected ? Math.max(0, selected.orderedQuantity - selected.liters) : 0;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(recordDeliveryShortfallSchema),
    values: {
      deliveryId,
      stationId: selected?.stationId ?? "",
      missingQuantity: defaultMissing || 0.01,
      driverName: selected?.driverName ?? "",
      signatureNote: "",
    },
  });

  async function onSubmit(values: FormOutput) {
    setServerError(null);
    const result = await recordDeliveryShortfall(userId, values);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    reset();
    router.refresh();
  }

  if (deliveries.length === 0) {
    return (
      <p className="rounded-md bg-navy-50 px-3 py-2 text-sm text-navy-500">
        Aucune livraison avec quantité commandée renseignée. Indiquez la quantité commandée lors de la
        prochaine livraison pour pouvoir signaler un manque.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Field label="Livraison" htmlFor="shortfallDeliveryId" error={errors.deliveryId?.message}>
        <Select id="shortfallDeliveryId" value={deliveryId} onChange={(e) => setDeliveryId(e.target.value)}>
          {deliveries.map((d) => (
            <option key={d.id} value={d.id}>
              {formatDateFr(d.deliveredAt)} — {d.tankLabel} — {formatNumberFr(d.orderedQuantity)} L cmd /{" "}
              {formatNumberFr(d.liters)} L livré
            </option>
          ))}
        </Select>
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Quantité manquante (L)"
          htmlFor="missingQuantity"
          error={errors.missingQuantity?.message}
        >
          <Input id="missingQuantity" type="number" step="0.01" min="0.01" {...register("missingQuantity")} />
        </Field>
        <Field label="Nom du chauffeur" htmlFor="driverName" error={errors.driverName?.message}>
          <Input id="driverName" {...register("driverName")} />
        </Field>
      </div>
      <Field
        label="Signature / note"
        htmlFor="signatureNote"
        error={errors.signatureNote?.message}
        hint="Facultatif — ex. « signé sur le bon papier, classé dossier livraisons »"
      >
        <Textarea id="signatureNote" rows={2} {...register("signatureNote")} />
      </Field>

      {serverError ? <p className="text-sm font-medium text-action-coral">{serverError}</p> : null}

      <Button type="submit" size="sm" disabled={isSubmitting}>
        {isSubmitting ? "Enregistrement…" : "Créer la facture manque"}
      </Button>
    </form>
  );
}
