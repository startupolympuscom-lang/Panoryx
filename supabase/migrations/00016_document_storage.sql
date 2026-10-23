-- 00016: shared document storage (module 6) — a private Storage bucket for
-- scans/photos, and a metadata table so invoices, signed vouchers,
-- delivery-shortfall signatures, and lubricant photos can all be searched
-- by date/supplier/category from one place. Files live under
-- `${stationId}/${category}/${filename}` so RLS can be enforced from the
-- path alone via the same station_org_id() helper used everywhere else.

insert into storage.buckets (id, name, public)
values ('station-documents', 'station-documents', false)
on conflict (id) do nothing;

create policy "station_documents_select" on storage.objects
for select using (
  bucket_id = 'station-documents'
  and is_org_member(station_org_id(((storage.foldername(name))[1])::uuid))
);

create policy "station_documents_insert" on storage.objects
for insert with check (
  bucket_id = 'station-documents'
  and has_org_write_role(
    station_org_id(((storage.foldername(name))[1])::uuid),
    array['owner', 'network_manager', 'station_manager', 'accountant', 'operator']::org_role[]
  )
);

create policy "station_documents_delete" on storage.objects
for delete using (
  bucket_id = 'station-documents'
  and has_org_write_role(
    station_org_id(((storage.foldername(name))[1])::uuid),
    array['owner', 'network_manager', 'station_manager']::org_role[]
  )
);

create type document_category as enum ('invoice', 'bon_signature', 'lubricant_photo', 'delivery_signature', 'other');

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references public.stations (id) on delete cascade,
  category document_category not null default 'other',
  file_path text not null,
  file_name text not null,
  document_date date not null default current_date,
  supplier_name text,
  related_table text,
  related_id uuid,
  uploaded_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now()
);

create index documents_station_idx on public.documents (station_id, document_date);
create index documents_category_idx on public.documents (station_id, category);
create index documents_related_idx on public.documents (related_table, related_id);

alter table public.documents enable row level security;

create policy documents_select on public.documents
  for select using (is_org_member(station_org_id(station_id)) or is_super_admin());
create policy documents_write on public.documents
  for all
  using (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager', 'accountant', 'operator']::org_role[]))
  with check (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager', 'accountant', 'operator']::org_role[]));
