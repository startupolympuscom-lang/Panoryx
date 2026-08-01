# Panoryx

Panoryx is a modular Business Operations Platform — "le système d'exploitation des
entreprises modernes." This repository contains the French-first marketing website and
the authenticated web application, starting with **PanoStation**, Panoryx's operational
product for gas station networks.

- **Framework:** Next.js (App Router) + TypeScript (strict) + Tailwind CSS v4
- **Backend:** Supabase (Postgres, Auth, Row Level Security)
- **Forms:** React Hook Form + Zod (operational data-entry forms) and progressive
  Server Actions + Zod (marketing/auth forms — see [Design notes](#design-notes))
- **Charts:** Recharts · **Icons:** Lucide · **Motion:** Framer Motion / native CSS

## 1. Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (free tier is enough for development)
- The [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) if you want to run migrations locally

## 2. Create the Supabase project

1. Create a new project at [supabase.com](https://supabase.com/dashboard).
2. In **Project Settings → API**, copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only; **never** expose this to the client — this codebase does not currently need it in application code, but it's reserved for future admin tooling)
3. In **Authentication → URL Configuration**, set:
   - **Site URL**: `http://localhost:3000` (or your deployed URL)
   - **Redirect URLs**: add `http://localhost:3000/auth/callback` (and the production equivalent, e.g. `https://your-domain.com/auth/callback`)
4. In **Authentication → Providers → Email**, keep "Confirm email" on for production-like behavior. The signup flow works either way (see [Design notes](#design-notes)).

## 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in the four variables described above. `NEXT_PUBLIC_SITE_URL` is used to build
auth redirect links (email confirmation, password reset) and must match a URL you
registered in step 2.

## 4. Apply database migrations

Migrations live in `supabase/migrations/`, numbered in the order they must run. They
create every table, enum, trigger, RPC function, and Row Level Security policy the app
needs.

**Using the Supabase CLI (recommended):**

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

**Or via the SQL editor:** open each file in `supabase/migrations/` in numeric order and
run it in the Supabase dashboard's SQL editor.

Then seed development reference data (a demo organization with four stations, tanks,
pumps, nozzles and suppliers using Moroccan conventions):

```bash
supabase db execute -f supabase/seed.sql
# or paste the file into the SQL editor
```

## 5. Run the app locally

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## 6. Create a demo account (no credentials committed)

No credentials are stored in this repository. To try the authenticated app:

1. Go to `/inscription` and sign up with your own email and a company name.
2. If email confirmation is enabled on your Supabase project, confirm via the email
   you receive (link goes through `/auth/callback`).
3. On first login you're routed through `/app/onboarding`, which calls the
   `create_organization_with_owner` RPC — this creates your organization, makes you its
   `owner`, and grants a configurable PanoStation trial (see `product_trial_config`).
4. You land on `/app`, then `/app/panostation` to use the product.

To instead attach your account to the richer **seed** organization ("Panoryx Demo",
with four stations already configured), run this once in the SQL editor after signing
up (replace the two placeholders):

```sql
insert into organization_members (organization_id, user_id, role)
values (
  (select id from organizations where slug = 'panoryx-demo'),
  '<your-auth-user-id>', -- Authentication → Users → copy the UID
  'owner'
);
```

## 7. Testing

```bash
npm run test        # unit tests (Vitest) — utils, Zod schemas, UI primitives
npm run test:watch  # watch mode
npm run test:e2e    # Playwright smoke test (builds & serves the app first)
```

The Playwright suite (`tests/e2e/auth-panostation-flow.spec.ts`) exercises the
authentication → PanoStation flow: unauthenticated visitors hitting `/app/panostation`
or `/app` are redirected to `/connexion?next=...`, the login/signup forms expose the
right fields, and core marketing pages render. It runs against placeholder Supabase
credentials, so it doesn't cover a real signup/login round trip — once you've configured
a real project, extend it with a full flow using a test account.

## 8. Quality checks

```bash
npm run lint       # ESLint
npx tsc --noEmit   # TypeScript, strict mode
npm run build      # production build
```

## Project structure

```
src/
  app/
    (marketing)/        Public site: home, /produits, /a-propos, /contact, legal pages
    (auth)/              /connexion, /inscription, /mot-de-passe-oublie, /reinitialiser-mot-de-passe
    app/                  Authenticated product hub (/app) and PanoStation (/app/panostation/*)
    actions/              Server Actions (auth, contact/demo forms, PanoStation workflows)
    auth/callback/        Route handler that exchanges Supabase auth codes for a session
  components/
    brand/                Logo components + reusable SVG graphic devices (flowlines, arcs…)
    ui/                   Design-system primitives (Button, Card, form fields…)
    marketing/             Header, footer, sections, auth forms
    app/                   Authenticated app shell + PanoStation nav, charts, workflow forms
  lib/
    supabase/              Browser/server/middleware Supabase clients + hand-written types
    auth/                  Session/organization/entitlement helpers, French auth error mapping
    validations/            Zod schemas (auth, contact, PanoStation workflows)
    data/                   Server-side data-fetching helpers (products, dashboard aggregation)
    i18n/                   Shared FR/EN dictionary for chrome strings (nav, footer, auth, common)
  middleware.ts / proxy.ts  Session refresh + /app/* route protection
supabase/
  migrations/               Numbered SQL migrations (schema, RLS, triggers, RPCs)
  seed.sql                  Development seed data
tests/
  unit/                     Vitest unit tests
  e2e/                      Playwright smoke tests
public/brand/                Brand assets derived from the supplied Panoryx graphical charter
```

## Design notes

- **Brand assets.** The Panoryx wordmark and "P" mark are the actual artwork supplied in
  the graphical charter — not redrawn. Since only flattened brand-sheet exports were
  provided (no layered vector source), the primary/reversed/monochrome lockups and the
  app icon were derived by isolating that artwork's pixels and applying the charter's own
  documented rules (background swap, navy-only silhouette for monochrome, white text on
  dark). Colors, typography (Sora/Inter via `next/font`), and the flowline/arc/viewport
  graphic language come directly from the supplied brand system sheet.
- **No PanoStation-specific logo file was supplied** in this session — only the Panoryx
  brand sheet and primary wordmark. `/produits/panostation` and `/app/panostation`
  therefore use the Panoryx wordmark plus a "PanoStation" text lockup in brand
  typography, not a separate invented logo mark.
- **Forms.** PanoStation's operational data-entry forms (stations, tanks, shifts, sales,
  deliveries, cash reconciliation, suppliers, maintenance) use **React Hook Form +
  Zod** with client-side validation calling Server Actions directly — this suits their
  dynamic field arrays (per-nozzle readings) and live calculations (cash variance).
  Marketing and auth forms (contact, demo request, login, signup, password reset) use
  native `<form action={...}>` with Server Actions, `useActionState`, and the same Zod
  schemas validated server-side — this keeps them working without JavaScript and avoids
  duplicating validation logic across a client library and the server boundary that
  actually enforces it.
- **Organization creation.** Signup supports creating a new organization (the creator
  becomes `owner`, and a configurable PanoStation trial is granted via
  `product_trial_config`). Joining an *existing* organization by invitation is out of
  scope for this MVP — there was no invite-flow specification to build against — and is
  a natural next step once product requirements for it are defined.
  `organization_members` already supports multiple members per organization, so no data
  model change would be needed.
- **Gross margin estimate.** The PanoStation dashboard's "marge brute" KPI is a
  best-effort estimate from the most recent delivery cost on file per (station, fuel
  type); it shows "—" when no delivery cost has been recorded yet, rather than
  fabricating a number.
- **No invented business facts.** No prices, certifications, customer counts, or
  testimonials appear anywhere in the marketing site. The three legal pages (mentions
  légales, confidentialité, conditions) are placeholders clearly marked "Contenu à
  finaliser" pending real legal content.
- **i18n.** The site is French-first. Shared chrome strings (nav, footer, common
  actions, auth labels) live in `src/lib/i18n/dictionaries.ts` with both `fr` and `en`
  dictionaries already written, so adding English routes later is a matter of adding
  `[locale]` segments that call `getDictionary("en")` — not a rewrite. Long-form
  marketing copy stays inline in French in the page files, since translating full pages
  is a content task independent of this routing groundwork.

## Environment variables

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (public) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key (public, protected by RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key — server-only, reserved for future admin tooling, never imported in client code |
| `NEXT_PUBLIC_SITE_URL` | Base URL used to build auth redirect links |
