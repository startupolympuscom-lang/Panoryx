"use client";

import { useActionState } from "react";
import { Field, Input } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import { createOrganization } from "@/app/actions/auth";
import type { FormActionState } from "@/app/actions/contact";

const initialState: FormActionState = { status: "idle" };

export function OnboardingForm({ defaultName, next }: { defaultName?: string; next: string }) {
  const [state, formAction, pending] = useActionState(createOrganization, initialState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="next" value={next} />

      <Field
        label="Nom de l'organisation"
        htmlFor="organizationName"
        error={state.fieldErrors?.organizationName}
      >
        <Input
          id="organizationName"
          name="organizationName"
          defaultValue={defaultName}
          placeholder="Ex. Station Services Atlas"
          required
        />
      </Field>

      {state.status === "error" && state.message ? (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-action-coral" role="alert">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Création…" : "Créer mon organisation"}
      </Button>
    </form>
  );
}
