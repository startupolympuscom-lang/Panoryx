import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { DEMO_COOKIE_NAME } from "@/lib/demo/constants";
import { createDemoClient } from "@/lib/demo/mock-client";

/**
 * Server-side Supabase client for use in Server Components, Server Actions,
 * and Route Handlers. Reads/writes the auth cookie through Next's cookie
 * store, so sessions stay in sync via `@supabase/ssr`.
 *
 * In demo mode (see lib/demo), this transparently returns an in-memory
 * mock client instead, so every page that calls createClient() works
 * without a real Supabase connection — the whole point of demo mode being
 * a workaround for the live auth/DB issue, not something that depends on it.
 */
export async function createClient() {
  const cookieStore = await cookies();

  if (cookieStore.get(DEMO_COOKIE_NAME)?.value === "1") {
    return createDemoClient() as unknown as Awaited<ReturnType<typeof createRealClient>>;
  }

  return createRealClient(cookieStore);
}

function createRealClient(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component without a mutable cookie store
            // (e.g. rendering a page, not a Server Action). Session refresh
            // is instead handled by middleware, so this is safe to ignore.
          }
        },
      },
    }
  );
}
