"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DEMO_COOKIE_NAME } from "./constants";

export async function isDemoMode(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(DEMO_COOKIE_NAME)?.value === "1";
}

export async function enterDemoMode(formData: FormData) {
  const cookieStore = await cookies();
  cookieStore.set(DEMO_COOKIE_NAME, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  const next = String(formData.get("next") ?? "/app/panostation");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/app/panostation");
}

export async function exitDemoMode() {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_COOKIE_NAME);
  redirect("/connexion");
}
