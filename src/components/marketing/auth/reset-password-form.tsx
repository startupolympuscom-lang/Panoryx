"use client";

import { useActionState } from "react";
import { Field, Input } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import { updatePassword } from "@/app/actions/auth";
import type { FormActionState } from "@/app/actions/contact";

const initialState: FormActionState = { status: "idle" };

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(updatePassword, initialState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <Field label="Nouveau mot de passe" htmlFor="password" error={state.fieldErrors?.password}>
        <Input id="password" name="password" type="password" autoComplete="new-password" required />
      </Field>
      <Field
        label="Confirmer le mot de passe"
        htmlFor="confirmPassword"
        error={state.fieldErrors?.confirmPassword}
      >
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
      </Field>
      <p className="-mt-3 text-xs text-navy-500">
        Au moins 8 caractères, avec une lettre et un chiffre.
      </p>

      {state.status === "error" && state.message ? (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-action-coral" role="alert">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Mise à jour…" : "Réinitialiser le mot de passe"}
      </Button>
    </form>
  );
}
