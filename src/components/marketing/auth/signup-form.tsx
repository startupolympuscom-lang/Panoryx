"use client";

import { useActionState } from "react";
import { Field, Input } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ui/form-status";
import { signUp } from "@/app/actions/auth";
import type { FormActionState } from "@/app/actions/contact";

const initialState: FormActionState = { status: "idle" };

export function SignupForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="next" value={next} />

      <Field label="Nom complet" htmlFor="fullName" error={state.fieldErrors?.fullName}>
        <Input id="fullName" name="fullName" autoComplete="name" required />
      </Field>

      <Field label="Nom de l'entreprise" htmlFor="companyName" error={state.fieldErrors?.companyName}>
        <Input id="companyName" name="companyName" autoComplete="organization" required />
      </Field>

      <Field label="Adresse e-mail" htmlFor="email" error={state.fieldErrors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Mot de passe" htmlFor="password" error={state.fieldErrors?.password}>
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
      </div>
      <p className="-mt-3 text-xs text-navy-500">
        Au moins 8 caractères, avec une lettre et un chiffre.
      </p>

      <div className="flex items-start gap-3">
        <input
          id="consent"
          name="consent"
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-navy-300 text-panoryx-blue focus:ring-panoryx-blue/30"
          required
        />
        <label htmlFor="consent" className="text-sm leading-relaxed text-navy-500">
          J&apos;accepte les{" "}
          <a href="/conditions" className="font-medium text-panoryx-blue hover:underline">
            conditions d&apos;utilisation
          </a>{" "}
          de Panoryx.
        </label>
      </div>
      {state.fieldErrors?.consent ? (
        <p className="text-xs font-medium text-action-coral">{state.fieldErrors.consent}</p>
      ) : null}

      {state.status === "error" && state.message ? <ErrorAlert>{state.message}</ErrorAlert> : null}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Création du compte…" : "Créer mon compte"}
      </Button>
    </form>
  );
}
