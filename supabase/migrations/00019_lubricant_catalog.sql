-- 00019: extend the shop catalog so lubricant articles carry a reference
-- code and a photo for quick visual identification (module 13). Reuses
-- shop_products/shop_sales (00011) instead of a parallel table — a
-- lubricant is just a shop product in the 'lubricant' category.

alter table public.shop_products add column category text not null default 'boutique'
  check (category in ('boutique', 'lubricant'));
alter table public.shop_products add column reference text;
alter table public.shop_products add column photo_path text;

create index shop_products_category_idx on public.shop_products (station_id, category);
