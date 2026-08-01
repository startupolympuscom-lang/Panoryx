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
    companyName: String(formData.get("companyName") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
    consent: formData.get("consent") === "on",
  });

  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const { fullName, companyName, email, password } = parsed.data;
  const next = safeNext(formData.get("next"));
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, company_name: companyName },
      emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent("/app/onboarding?next=" + next)}`,
    },
  });

  if (error) {
    return { status: "error", message: translateAuthError(error.message) };
  }

  if (data.session) {
    // Email confirmation is disabled on this project: we already have a
    // session, so provision the organization right away. If this fails,
    // fall through to onboarding instead of silently dropping the error —
    // the user still needs an organization before they can use the app,
    // and /app/onboarding will retry with a visible error message.
    const { error: rpcError } = await supabase.rpc("create_organization_with_owner", {
      org_name: companyName,
    });
    if (rpcError) {
      console.error("create_organization_with_owner failed during signup:", rpcError);
      redirect(`/app/onboarding?next=${encodeURIComponent(next)}`);
    }
    redirect(next);
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
    return {
      status: "error",
      message:
        error.message && error.code !== "PGRST202"
          ? `Impossible de créer l'organisation : ${error.message}`
          : "Impossible de créer l'organisation pour le moment. Veuillez réessayer ou contacter le support.",
    };
  }

  redirect(safeNext(formData.get("next")));
}
