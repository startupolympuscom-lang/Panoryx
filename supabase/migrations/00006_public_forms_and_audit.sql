-- 00006: public marketing forms and audit trail

create table public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  company_name text not null,
  professional_email text not null,
  phone text,
  sites_count integer,
  product_interest text,
  message text not null,
  consent boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.demo_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  company_name text not null,
  professional_email text not null,
  phone text,
  sites_count integer,
  product_interest text,
  message text,
  consent boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_table text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_org_idx on public.audit_logs (organization_id, created_at desc);
