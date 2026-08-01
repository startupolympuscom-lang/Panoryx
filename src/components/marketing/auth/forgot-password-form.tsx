"use client";

import { useActionState } from "react";
import { Field, Input } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import { ErrorAlert, SuccessAlert } from "@/components/ui/form-status";
import { requestPasswordReset } from "@/app/actions/auth";
import type { FormActionState } from "@/app/actions/contact";

const initialState: FormActionState = { status: "idle" };

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState);

  if (state.status === "success") {
    return (
      <SuccessAlert>
        Si un compte existe avec cette adresse, un e-mail de réinitialisation vient de vous être
        envoyé.
      </SuccessAlert>
    );
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <Field label="Adresse e-mail" htmlFor="email" error={state.fieldErrors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>

      {state.status === "error" && state.message ? <ErrorAlert>{state.message}</ErrorAlert> : null}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Envoi…" : "Envoyer le lien de réinitialisation"}
      </Button>
    </form>
  );
}
