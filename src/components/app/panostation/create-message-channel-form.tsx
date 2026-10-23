"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { createMessageChannelSchema } from "@/lib/validations/panostation";
import { createMessageChannel } from "@/app/actions/panostation";
import { Field, Input } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";

type FormInput = z.input<typeof createMessageChannelSchema>;
type FormOutput = z.output<typeof createMessageChannelSchema>;

export function CreateMessageChannelForm({
  organizationId,
  userId,
}: {
  organizationId: string;
  userId: string;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(createMessageChannelSchema),
    defaultValues: { name: "" },
  });

  async function onSubmit(values: FormOutput) {
    setServerError(null);
    const result = await createMessageChannel(organizationId, userId, values);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex items-end gap-3" noValidate>
      <Field label="Nouveau canal" htmlFor="channelName" error={errors.name?.message} hint="Ex. Urgences">
        <Input id="channelName" placeholder="Nom du canal" {...register("name")} />
      </Field>
      {serverError ? <p className="text-sm font-medium text-action-coral">{serverError}</p> : null}
      <Button type="submit" size="sm" disabled={isSubmitting}>
        {isSubmitting ? "…" : "Créer"}
      </Button>
    </form>
  );
}
