"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { recordBankMessageSchema } from "@/lib/validations/panostation";
import { recordBankMessage } from "@/app/actions/panostation";
import { Field, Input, Select, Textarea } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import type { DashboardStation } from "@/lib/data/panostation-dashboard";

type FormInput = z.input<typeof recordBankMessageSchema>;
type FormOutput = z.output<typeof recordBankMessageSchema>;

export function RecordBankMessageForm({
  userId,
  stations,
}: {
  userId: string;
  stations: DashboardStation[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(recordBankMessageSchema),
    defaultValues: { stationId: stations[0]?.id, messageType: "credit" },
  });

  async function onSubmit(values: FormOutput) {
    setServerError(null);
    const result = await recordBankMessage(userId, values);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    reset({ stationId: values.stationId, messageType: "credit" });
    router.refresh();
  }

  if (stations.length === 0) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Station" htmlFor="messageStationId" error={errors.stationId?.message}>
          <Select id="messageStationId" {...register("stationId")}>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Type" htmlFor="messageType" error={errors.messageType?.message}>
          <Select id="messageType" {...register("messageType")}>
            <option value="credit">Crédit (montant ajouté)</option>
            <option value="debit">Débit (montant déduit)</option>
            <option value="info">Information</option>
          </Select>
        </Field>
        <Field
          label="Montant (MAD)"
          htmlFor="messageAmount"
          error={errors.amount?.message}
          hint="Facultatif"
        >
          <Input id="messageAmount" type="number" step="0.01" min="0" {...register("amount")} />
        </Field>
      </div>
      <Field label="Texte du message" htmlFor="messageRawText" error={errors.rawText?.message}>
        <Textarea
          id="messageRawText"
          rows={2}
          placeholder="Collez ici le texte du SMS ou de la notification bancaire"
          {...register("rawText")}
        />
      </Field>

      {serverError ? <p className="text-sm font-medium text-action-coral">{serverError}</p> : null}

      <Button type="submit" disabled={isSubmitting} size="sm">
        {isSubmitting ? "Enregistrement…" : "Enregistrer le message"}
      </Button>
    </form>
  );
}
