"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { recordCustomerCheckSchema } from "@/lib/validations/panostation";
import { recordCustomerCheck } from "@/app/actions/panostation";
import { Field, Input, Select } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import type { DashboardStation } from "@/lib/data/panostation-dashboard";

interface CreditCustomerOption {
  id: string;
  stationId: string;
  name: string;
}

type FormInput = z.input<typeof recordCustomerCheckSchema>;
type FormOutput = z.output<typeof recordCustomerCheckSchema>;

export function RecordCustomerCheckForm({
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
    resolver: zodResolver(recordCustomerCheckSchema),
    values: {
      stationId,
      customerId: stationCustomers[0]?.id ?? "",
      amount: 0,
      checkNumber: "",
      dueDate: "",
    },
  });

  async function onSubmit(values: FormOutput) {
    setServerError(null);
    const result = await recordCustomerCheck(userId, values);
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
        Ajoutez d&apos;abord un client à crédit pour enregistrer un chèque.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Station" htmlFor="customerCheckStationId" error={errors.stationId?.message}>
          <Select id="customerCheckStationId" value={stationId} onChange={(e) => setStationId(e.target.value)}>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Client" htmlFor="customerCheckCustomerId" error={errors.customerId?.message}>
          <Select id="customerCheckCustomerId" {...register("customerId")}>
            {stationCustomers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Montant (MAD)" htmlFor="customerCheckAmount" error={errors.amount?.message}>
          <Input id="customerCheckAmount" type="number" step="0.01" min="0.01" {...register("amount")} />
        </Field>
        <Field label="N° de chèque/traite" htmlFor="customerCheckNumber" error={errors.checkNumber?.message}>
          <Input id="customerCheckNumber" {...register("checkNumber")} />
        </Field>
        <Field
          label="Date d'échéance"
          htmlFor="customerCheckDueDate"
          error={errors.dueDate?.message}
          hint="Facultatif"
        >
          <Input id="customerCheckDueDate" type="date" {...register("dueDate")} />
        </Field>
      </div>

      {serverError ? <p className="text-sm font-medium text-action-coral">{serverError}</p> : null}

      <Button type="submit" size="sm" disabled={isSubmitting || stationCustomers.length === 0}>
        {isSubmitting ? "Enregistrement…" : "Enregistrer le chèque"}
      </Button>
    </form>
  );
}
