"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { recordTankGaugeCertificateSchema } from "@/lib/validations/panostation";
import { recordTankGaugeCertificate } from "@/app/actions/panostation";
import { Field, Input, Select } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";

interface TankOption {
  id: string;
  label: string;
  stationId: string;
  stationName: string;
}

type FormInput = z.input<typeof recordTankGaugeCertificateSchema>;
type FormOutput = z.output<typeof recordTankGaugeCertificateSchema>;

export function RecordTankGaugeForm({ userId, tanks }: { userId: string; tanks: TankOption[] }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [tankId, setTankId] = useState(tanks[0]?.id ?? "");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(recordTankGaugeCertificateSchema),
    values: { tankId, stationId: tanks.find((t) => t.id === tankId)?.stationId ?? "", measuredQuantity: 0 },
  });

  async function onSubmit(values: FormOutput) {
    setServerError(null);
    const result = await recordTankGaugeCertificate(userId, values);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    reset({ tankId, stationId: values.stationId, measuredQuantity: 0 });
    router.refresh();
  }

  if (tanks.length === 0) {
    return (
      <p className="rounded-md bg-navy-50 px-3 py-2 text-sm text-navy-500">
        Créez d&apos;abord une cuve pour établir un certificat de jauge.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Cuve" htmlFor="gaugeTankId" error={errors.tankId?.message}>
          <Select id="gaugeTankId" value={tankId} onChange={(e) => setTankId(e.target.value)}>
            {tanks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label} — {t.stationName}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Quantité mesurée (L)"
          htmlFor="measuredQuantity"
          error={errors.measuredQuantity?.message}
          hint="Relevé physique de la jauge"
        >
          <Input id="measuredQuantity" type="number" step="0.01" min="0" {...register("measuredQuantity")} />
        </Field>
      </div>

      {serverError ? <p className="text-sm font-medium text-action-coral">{serverError}</p> : null}

      <Button type="submit" size="sm" disabled={isSubmitting}>
        {isSubmitting ? "Enregistrement…" : "Enregistrer le certificat"}
      </Button>
    </form>
  );
}
