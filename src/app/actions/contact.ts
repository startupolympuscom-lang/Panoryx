"use server";

import { createClient } from "@/lib/supabase/server";
import { contactFormSchema, demoFormSchema } from "@/lib/validations/contact";
import { fieldErrorsFromZod } from "@/lib/validations/utils";

export interface FormActionState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
}

function parseFormData(formData: FormData) {
  return {
    fullName: String(formData.get("fullName") ?? ""),
    companyName: String(formData.get("companyName") ?? ""),
    professionalEmail: String(formData.get("professionalEmail") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    sitesCount: String(formData.get("sitesCount") ?? ""),
    productInterest: String(formData.get("productInterest") ?? ""),
    message: String(formData.get("message") ?? ""),
    consent: formData.get("consent") === "on",
    website: String(formData.get("website") ?? ""),
  };
}

export async function submitContactRequest(
  _prevState: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const raw = parseFormData(formData);
  const parsed = contactFormSchema.safeParse({
    ...raw,
    sitesCount: raw.sitesCount || undefined,
  });

  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  if (parsed.data.website) {
    // Honeypot tripped — pretend success, do nothing.
    return { status: "success" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_requests").insert({
    full_name: parsed.data.fullName,
    company_name: parsed.data.companyName,
    professional_email: parsed.data.professionalEmail,
    phone: parsed.data.phone || null,
    sites_count: parsed.data.sitesCount ? Number(parsed.data.sitesCount) : null,
    product_interest: parsed.data.productInterest || null,
    message: parsed.data.message,
    consent: parsed.data.consent,
  });

  if (error) {
    return {
      status: "error",
      message: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
    };
  }

  return { status: "success" };
}

export async function submitDemoRequest(
  _prevState: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const raw = parseFormData(formData);
  const parsed = demoFormSchema.safeParse({
    ...raw,
    sitesCount: raw.sitesCount || undefined,
  });

  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  if (parsed.data.website) {
    return { status: "success" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("demo_requests").insert({
    full_name: parsed.data.fullName,
    company_name: parsed.data.companyName,
    professional_email: parsed.data.professionalEmail,
    phone: parsed.data.phone || null,
    sites_count: parsed.data.sitesCount ? Number(parsed.data.sitesCount) : null,
    product_interest: parsed.data.productInterest || null,
    message: parsed.data.message || null,
    consent: parsed.data.consent,
  });

  if (error) {
    return {
      status: "error",
      message: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
    };
  }

  return { status: "success" };
}
