import { createClient } from "@/lib/supabase/server";
import type { OrgRole } from "@/lib/supabase/types";

export interface CurrentOrgContext {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  role: OrgRole;
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Returns the user's primary organization membership (first joined/created),
 * along with their role in it. Panoryx's MVP scopes one org per user; the
 * schema supports multiple memberships, so this can grow into an org
 * switcher later without a data model change.
 */
export async function getCurrentOrg(): Promise<CurrentOrgContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("organization_members")
    .select("role, organizations!inner(id, name, slug)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  const org = Array.isArray(data.organizations) ? data.organizations[0] : data.organizations;
  if (!org) return null;

  return {
    organizationId: org.id,
    organizationName: org.name,
    organizationSlug: org.slug,
    role: data.role,
  };
}

export async function hasProductAccess(organizationId: string, productSlug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_products")
    .select("status, trial_ends_at, products!inner(slug)")
    .eq("organization_id", organizationId)
    .eq("products.slug", productSlug)
    .maybeSingle();

  if (error || !data) return { hasAccess: false as const };

  if (data.status === "active") return { hasAccess: true as const, status: data.status };
  if (data.status === "trial") {
    const stillValid = !data.trial_ends_at || new Date(data.trial_ends_at) > new Date();
    return { hasAccess: stillValid, status: data.status, trialEndsAt: data.trial_ends_at };
  }
  return { hasAccess: false as const, status: data.status };
}
