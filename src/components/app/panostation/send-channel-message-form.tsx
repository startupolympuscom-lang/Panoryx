"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { sendChannelMessageSchema } from "@/lib/validations/panostation";
import { sendChannelMessage } from "@/app/actions/panostation";
import { Input } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";

type FormInput = z.input<typeof sendChannelMessageSchema>;
type FormOutput = z.output<typeof sendChannelMessageSchema>;

export function SendChannelMessageForm({ userId, channelId }: { userId: string; channelId: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(sendChannelMessageSchema),
    values: { channelId, body: "" },
  });

  async function onSubmit(values: FormOutput) {
    setServerError(null);
    const result = await sendChannelMessage(userId, values);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    reset({ channelId, body: "" });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex items-start gap-2" noValidate>
      <input type="hidden" {...register("channelId")} />
      <div className="flex-1">
        <Input id={`msgBody-${channelId}`} placeholder="Écrire un message…" {...register("body")} />
        {errors.body?.message ? (
          <p className="mt-1 text-xs font-medium text-action-coral">{errors.body.message}</p>
        ) : null}
      </div>
      {serverError ? <p className="text-xs font-medium text-action-coral">{serverError}</p> : null}
      <Button type="submit" size="sm" disabled={isSubmitting}>
        {isSubmitting ? "…" : "Envoyer"}
      </Button>
    </form>
  );
}
