-- 00009: Seed the product catalog. This is reference data every deployment
-- needs — not optional demo content — so it lives in a migration rather
-- than supabase/seed.sql: without a 'panostation' row here,
-- create_organization_with_owner() has nothing to grant a trial for, and
-- every newly created organization ends up with zero product entitlements.

insert into public.products (slug, name, description)
values (
  'panostation',
  'PanoStation',
  'Logiciel opérationnel pour réseaux de stations-service : ventes, stocks de carburant, équipes, fournisseurs et opérations quotidiennes.'
)
on conflict (slug) do nothing;

insert into public.product_trial_config (product_id, trial_days)
select id, 14 from public.products where slug = 'panostation'
on conflict (product_id) do nothing;
