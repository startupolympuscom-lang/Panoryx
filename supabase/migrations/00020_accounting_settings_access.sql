-- 00020: accounting percentages/margins (module 4) — visible only to
-- owner + accountant, editable only by accountant, with a change history.

create table public.accounting_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  setting_key text not null,
  label text not null,
  value numeric(10, 4) not null,
  updated_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, setting_key)
);

create index accounting_settings_org_idx on public.accounting_settings (organization_id);

create trigger set_accounting_settings_updated_at
  before update on public.accounting_settings
  for each row execute function public.set_updated_at();

create table public.accounting_settings_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  setting_key text not null,
  old_value numeric(10, 4),
  new_value numeric(10, 4) not null,
  changed_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now()
);

create index accounting_settings_history_org_idx on public.accounting_settings_history (organization_id, created_at desc);

alter table public.accounting_settings enable row level security;
alter table public.accounting_settings_history enable row level security;

create policy accounting_settings_select on public.accounting_settings
  for select using (has_org_write_role(organization_id, array['owner', 'accountant']::org_role[]) or is_super_admin());
create policy accounting_settings_write on public.accounting_settings
  for all
  using (has_org_write_role(organization_id, array['accountant']::org_role[]))
  with check (has_org_write_role(organization_id, array['accountant']::org_role[]));

create policy accounting_settings_history_select on public.accounting_settings_history
  for select using (has_org_write_role(organization_id, array['owner', 'accountant']::org_role[]) or is_super_admin());
create policy accounting_settings_history_write on public.accounting_settings_history
  for insert
  with check (has_org_write_role(organization_id, array['accountant']::org_role[]));
