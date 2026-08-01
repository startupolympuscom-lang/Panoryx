"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { translateAuthError } from "@/lib/auth/error-messages";
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  organizationSchema,
} from "@/lib/validations/auth";
import { fieldErrorsFromZod } from "@/lib/validations/utils";
import type { FormActionState } from "./contact";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function safeNext(next: FormDataEntryValue | null): string {
  const value = String(next ?? "");
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return "/app";
}

export async function signIn(
  _prevState: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { status: "error", message: translateAuthError(error.message) };
  }

  redirect(safeNext(formData.get("next")));
}

export async function signUp(
  _prevState: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const parsed = signupSchema.safeParse({
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
    consent: formData.get("consent") === "on",
  });

  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const { fullName, email, password } = parsed.data;
  const next = safeNext(formData.get("next"));
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent("/app/onboarding?next=" + next)}`,
    },
  });

  if (error) {
    return { status: "error", message: translateAuthError(error.message) };
  }

  if (data.session) {
    // We already have a session (email confirmation is off on this
    // project), so send the user straight to the "name your organization"
    // step — /app/onboarding — instead of guessing an organization name.
    // Onboarding creates it and lands the user directly in the app.
    redirect(`/app/onboarding?next=${encodeURIComponent(next)}`);
  }

  // No session yet: Supabase's signup response reflects the user's
  // confirmation state as of just before insert, so it can say
  // "unconfirmed" even when a database-level workaround (or a fast
  // confirmation trigger) confirms the row moments later in the same
  // transaction. Try signing in immediately with the credentials just
  // submitted — if the account is actually confirmed, this succeeds
  // right away and the user skips the email step entirely instead of
  // landing on a dead-end "check your email" page.
  const { data: signInData } = await supabase.auth.signInWithPassword({ email, password });
  if (signInData.session) {
    redirect(`/app/onboarding?next=${encodeURIComponent(next)}`);
  }

  redirect("/inscription/verification");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordReset(
  _prevState: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: String(formData.get("email") ?? ""),
  });

  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent("/reinitialiser-mot-de-passe")}`,
  });

  // Always report success, whether or not the email exists, to avoid
  // leaking which addresses have an account.
  return { status: "success" };
}

export async function updatePassword(
  _prevState: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });

  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "Votre lien de réinitialisation a expiré. Veuillez en demander un nouveau.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { status: "error", message: translateAuthError(error.message) };
  }

  redirect("/connexion?reset=success");
}

export async function createOrganization(
  _prevState: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const parsed = organizationSchema.safeParse({
    organizationName: String(formData.get("organizationName") ?? ""),
  });

  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "Votre session a expiré. Veuillez vous reconnecter.",
    };
  }

  const { error } = await supabase.rpc("create_organization_with_owner", {
    org_name: parsed.data.organizationName,
  });

  if (error) {
    console.error("create_organization_with_owner failed:", error);
    // Surface the real Postgres/PostgREST error (code + message) rather than
    // a generic fallback: this is pre-launch and the concrete diagnostic is
    // far more useful than hiding it, especially since we have no way to
    // inspect the live database from outside.
    return {
      status: "error",
      message: `Impossible de créer l'organisation (${error.code ?? "erreur"}) : ${
        error.message || "erreur inconnue"
      }`,
    };
  }

  redirect(safeNext(formData.get("next")));
}
