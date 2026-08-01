"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Field, Input } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import { requestPasswordReset } from "@/app/actions/auth";
import type { FormActionState } from "@/app/actions/contact";

const initialState: FormActionState = { status: "idle" };

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState);

  if (state.status === "success") {
    return (
      <div className="flex items-start gap-3 rounded-md bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
        <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span>
          Si un compte existe avec cette adresse, un e-mail de réinitialisation vient de vous
          être envoyé.
        </span>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <Field label="Adresse e-mail" htmlFor="email" error={state.fieldErrors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>

      {state.status === "error" && state.message ? (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-action-coral" role="alert">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Envoi…" : "Envoyer le lien de réinitialisation"}
      </Button>
    </form>
  );
}
