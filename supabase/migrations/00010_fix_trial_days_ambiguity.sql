-- 00010: fix "column reference trial_days is ambiguous" (Postgres 42702) in
-- create_organization_with_owner(). The local plpgsql variable was named
-- trial_days, identical to product_trial_config.trial_days, so
-- `select trial_days into trial_days from product_trial_config` couldn't
-- tell the column and the variable apart. Renamed the variable to
-- v_trial_days; behavior is otherwise unchanged.

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
  v_trial_days int;
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
    select trial_days into v_trial_days
    from product_trial_config
    where product_id = panostation_product_id;

    v_trial_days := coalesce(v_trial_days, 14);

    insert into organization_products (organization_id, product_id, status, trial_ends_at)
    values (new_org_id, panostation_product_id, 'trial', now() + (v_trial_days || ' days')::interval);
  end if;

  insert into audit_logs (organization_id, actor_id, action, entity_table, entity_id)
  values (new_org_id, auth.uid(), 'organization.created', 'organizations', new_org_id);

  return new_org_id;
end;
$$;
