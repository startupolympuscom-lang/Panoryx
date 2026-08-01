"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Field, Input } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ui/form-status";
import { signIn } from "@/app/actions/auth";
import type { FormActionState } from "@/app/actions/contact";

const initialState: FormActionState = { status: "idle" };

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="next" value={next} />

      <Field label="Adresse e-mail" htmlFor="email" error={state.fieldErrors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>

      <Field label="Mot de passe" htmlFor="password" error={state.fieldErrors?.password}>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>

      <div className="flex justify-end">
        <Link href="/mot-de-passe-oublie" className="text-sm font-medium text-panoryx-blue hover:underline">
          Mot de passe oublié ?
        </Link>
      </div>

      {state.status === "error" && state.message ? <ErrorAlert>{state.message}</ErrorAlert> : null}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  );
}
