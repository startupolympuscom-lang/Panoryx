"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { createSocialPostSchema } from "@/lib/validations/panostation";
import { createSocialPost } from "@/app/actions/panostation";
import { Field, Input, Select, Textarea } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import type { DashboardStation } from "@/lib/data/panostation-dashboard";

type FormInput = z.input<typeof createSocialPostSchema>;
type FormOutput = z.output<typeof createSocialPostSchema>;

export function CreateSocialPostForm({
  organizationId,
  userId,
  stations,
}: {
  organizationId: string;
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
    resolver: zodResolver(createSocialPostSchema),
    defaultValues: {
      stationId: stations[0]?.id ?? "",
      title: "",
      content: "",
      platform: "facebook",
      status: "draft",
      scheduledFor: "",
    },
  });

  async function onSubmit(values: FormOutput) {
    setServerError(null);
    const result = await createSocialPost(organizationId, userId, values);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    reset({
      stationId: values.stationId,
      title: "",
      content: "",
      platform: values.platform,
      status: "draft",
      scheduledFor: "",
    });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Station" htmlFor="postStationId" error={errors.stationId?.message} hint="Facultatif">
          <Select id="postStationId" {...register("stationId")}>
            <option value="">Toutes les stations</option>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Plateforme" htmlFor="postPlatform" error={errors.platform?.message}>
          <Select id="postPlatform" {...register("platform")}>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="autre">Autre</option>
          </Select>
        </Field>
      </div>
      <Field label="Titre" htmlFor="postTitle" error={errors.title?.message}>
        <Input id="postTitle" placeholder="Ex. Promo café du matin" {...register("title")} />
      </Field>
      <Field label="Contenu" htmlFor="postContent" error={errors.content?.message}>
        <Textarea id="postContent" rows={4} {...register("content")} />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Statut" htmlFor="postStatus" error={errors.status?.message}>
          <Select id="postStatus" {...register("status")}>
            <option value="draft">Brouillon</option>
            <option value="scheduled">Planifiée</option>
          </Select>
        </Field>
        <Field
          label="Date de publication prévue"
          htmlFor="postScheduledFor"
          error={errors.scheduledFor?.message}
          hint="Facultatif"
        >
          <Input id="postScheduledFor" type="datetime-local" {...register("scheduledFor")} />
        </Field>
      </div>

      {serverError ? <p className="text-sm font-medium text-action-coral">{serverError}</p> : null}

      <Button type="submit" size="sm" disabled={isSubmitting}>
        {isSubmitting ? "Enregistrement…" : "Créer la publication"}
      </Button>
    </form>
  );
}
