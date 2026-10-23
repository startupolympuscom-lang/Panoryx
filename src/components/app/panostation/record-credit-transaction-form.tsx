"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { recordCreditTransactionSchema } from "@/lib/validations/panostation";
import { recordCreditTransaction } from "@/app/actions/panostation";
import { Field, Input, Select } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import type { DashboardStation } from "@/lib/data/panostation-dashboard";

interface CreditCustomerOption {
  id: string;
  stationId: string;
  name: string;
}

type FormInput = z.input<typeof recordCreditTransactionSchema>;
type FormOutput = z.output<typeof recordCreditTransactionSchema>;

export function RecordCreditTransactionForm({
  userId,
  stations,
  customers,
}: {
  userId: string;
  stations: DashboardStation[];
  customers: CreditCustomerOption[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [stationId, setStationId] = useState(stations[0]?.id ?? "");
  const stationCustomers = customers.filter((c) => c.stationId === stationId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(recordCreditTransactionSchema),
    values: {
      stationId,
      customerId: stationCustomers[0]?.id ?? "",
      type: "charge",
      amount: 0,
      note: "",
    },
  });

  async function onSubmit(values: FormOutput) {
    setServerError(null);
    const result = await recordCreditTransaction(userId, values);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    reset();
    router.refresh();
  }

  if (customers.length === 0) {
    return (
      <p className="rounded-md bg-navy-50 px-3 py-2 text-sm text-navy-500">
        Ajoutez d&apos;abord un client à crédit pour enregistrer une opération.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Station" htmlFor="creditTxStationId" error={errors.stationId?.message}>
          <Select id="creditTxStationId" value={stationId} onChange={(e) => setStationId(e.target.value)}>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Client" htmlFor="creditTxCustomerId" error={errors.customerId?.message}>
          <Select id="creditTxCustomerId" {...register("customerId")}>
            {stationCustomers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Type d'opération" htmlFor="creditTxType" error={errors.type?.message}>
          <Select id="creditTxType" {...register("type")}>
            <option value="charge">Consommation à crédit (+)</option>
            <option value="advance">Avance / paiement (-)</option>
          </Select>
        </Field>
        <Field label="Montant (MAD)" htmlFor="creditTxAmount" error={errors.amount?.message}>
          <Input id="creditTxAmount" type="number" step="0.01" min="0.01" {...register("amount")} />
        </Field>
      </div>
      <Field label="Note" htmlFor="creditTxNote" error={errors.note?.message} hint="Facultatif">
        <Input id="creditTxNote" placeholder="Ex. Plein gasoil, facture n°..." {...register("note")} />
      </Field>

      {serverError ? <p className="text-sm font-medium text-action-coral">{serverError}</p> : null}

      <Button type="submit" disabled={isSubmitting || stationCustomers.length === 0}>
        {isSubmitting ? "Enregistrement…" : "Enregistrer l'opération"}
      </Button>
      {stationCustomers.length === 0 ? (
        <p className="text-xs text-navy-500">Aucun client à crédit pour cette station.</p>
      ) : null}
    </form>
  );
}
