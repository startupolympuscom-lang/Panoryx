-- 00002: identity, organizations, products, entitlements

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  is_super_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'One row per authenticated user, created automatically on signup.';

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_organizations_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role org_role not null default 'viewer',
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index organization_members_org_idx on public.organization_members (organization_id);
create index organization_members_user_idx on public.organization_members (user_id);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

-- Configurable trial length per product, read by the signup RPC instead of
-- a hardcoded number of days — keeps billing/trial policy out of app code.
create table public.product_trial_config (
  product_id uuid primary key references public.products (id) on delete cascade,
  trial_days integer not null default 14
);

create table public.organization_products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  status entitlement_status not null default 'trial',
  trial_ends_at timestamptz,
  activated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, product_id)
);

create index organization_products_org_idx on public.organization_products (organization_id);

create trigger set_organization_products_updated_at
  before update on public.organization_products
  for each row execute function public.set_updated_at();
