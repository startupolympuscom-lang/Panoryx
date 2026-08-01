-- 00007: profile provisioning trigger, RLS helper functions, signup RPC

-- Creates a profile row automatically whenever a new Supabase Auth user is
-- created (email/password, magic link, or OAuth all funnel through this).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- RLS helper functions. Each is SECURITY DEFINER + STABLE so it can be
-- called from a policy on the very table it reads without triggering
-- RLS recursion (the function body runs with the privileges of its
-- owner, bypassing RLS on its own internal query).
-- ---------------------------------------------------------------------

create or replace function public.is_org_member(target_org_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from organization_members
    where organization_id = target_org_id and user_id = auth.uid()
  );
$$;

create or replace function public.current_org_role(target_org_id uuid)
returns org_role
language sql
security definer
set search_path = public
stable
as $$
  select role from organization_members
  where organization_id = target_org_id and user_id = auth.uid()
  limit 1;
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select is_super_admin from profiles where id = auth.uid()), false);
$$;

create or replace function public.station_org_id(target_station_id uuid)
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select organization_id from stations where id = target_station_id;
$$;

create or replace function public.shift_org_id(target_shift_id uuid)
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select station_org_id(station_id) from shifts where id = target_shift_id;
$$;

create or replace function public.has_org_write_role(target_org_id uuid, allowed_roles org_role[])
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(current_org_role(target_org_id) = any (allowed_roles), false) or is_super_admin();
$$;

grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.current_org_role(uuid) to authenticated;
grant execute on function public.is_super_admin() to authenticated;
grant execute on function public.station_org_id(uuid) to authenticated;
grant execute on function public.shift_org_id(uuid) to authenticated;
grant execute on function public.has_org_write_role(uuid, org_role[]) to authenticated;

-- ---------------------------------------------------------------------
-- Signup RPC: atomically creates an organization, makes the caller its
-- owner, and grants a configurable PanoStation trial. Runs as SECURITY
-- DEFINER so it can insert into organizations/organization_members
-- without needing broad client-side insert policies on those tables.
-- ---------------------------------------------------------------------

create or replace function public.create_organization_with_owner(org_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
  slug_base text;
  slug_candidate text;
  suffix int := 0;
  panostation_product_id uuid;
  trial_days int;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if coalesce(trim(org_name), '') = '' then
    raise exception 'Organization name is required';
  end if;

  slug_base := regexp_replace(lower(trim(org_name)), '[^a-z0-9]+', '-', 'g');
  slug_base := trim(both '-' from slug_base);
  if slug_base = '' then
    slug_base := 'organisation';
  end if;
  slug_candidate := slug_base;

  while exists (select 1 from organizations where slug = slug_candidate) loop
    suffix := suffix + 1;
    slug_candidate := slug_base || '-' || suffix;
  end loop;

  insert into organizations (name, slug, created_by)
  values (trim(org_name), slug_candidate, auth.uid())
  returning id into new_org_id;

  insert into organization_members (organization_id, user_id, role)
  values (new_org_id, auth.uid(), 'owner');

  select id into panostation_product_id from products where slug = 'panostation';

  if panostation_product_id is not null then
    select trial_days into trial_days
    from product_trial_config
    where product_id = panostation_product_id;

    trial_days := coalesce(trial_days, 14);

    insert into organization_products (organization_id, product_id, status, trial_ends_at)
    values (new_org_id, panostation_product_id, 'trial', now() + (trial_days || ' days')::interval);
  end if;

  insert into audit_logs (organization_id, actor_id, action, entity_table, entity_id)
  values (new_org_id, auth.uid(), 'organization.created', 'organizations', new_org_id);

  return new_org_id;
end;
$$;

grant execute on function public.create_organization_with_owner(text) to authenticated;
