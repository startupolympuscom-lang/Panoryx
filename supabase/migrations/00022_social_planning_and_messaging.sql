-- 00022: social media post planning (module 15) and internal team
-- messaging (module 16).
--
-- Module 15 is a content calendar/composer only — there is no Meta/Facebook
-- API integration in this sandbox, so posts are drafted and scheduled here
-- but must be published manually by whoever manages the station's social
-- accounts (status stays 'draft'/'scheduled' until someone flips it to
-- 'published' after posting it themselves).

create type social_post_status as enum ('draft', 'scheduled', 'published');

create table public.social_posts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  station_id uuid references public.stations (id) on delete cascade,
  title text not null,
  content text not null,
  platform text not null default 'facebook',
  status social_post_status not null default 'draft',
  scheduled_for timestamptz,
  published_at timestamptz,
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index social_posts_org_idx on public.social_posts (organization_id, scheduled_for);

create trigger set_social_posts_updated_at
  before update on public.social_posts
  for each row execute function public.set_updated_at();

alter table public.social_posts enable row level security;

create policy social_posts_select on public.social_posts
  for select using (is_org_member(organization_id) or is_super_admin());
create policy social_posts_write on public.social_posts
  for all
  using (has_org_write_role(organization_id, array['owner', 'network_manager', 'station_manager']::org_role[]))
  with check (has_org_write_role(organization_id, array['owner', 'network_manager', 'station_manager']::org_role[]));

-- Module 16: internal channel-based team messaging (e.g. "Fournisseurs",
-- "Équipe station", "Café/Restaurant", "Urgences"). Simple flat channels
-- scoped to an organization, any member can post/read.

create table public.message_channels (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (organization_id, name)
);

create index message_channels_org_idx on public.message_channels (organization_id);

alter table public.message_channels enable row level security;

create policy message_channels_select on public.message_channels
  for select using (is_org_member(organization_id) or is_super_admin());
create policy message_channels_write on public.message_channels
  for insert
  with check (has_org_write_role(organization_id, array['owner', 'network_manager', 'station_manager']::org_role[]));

create table public.channel_messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.message_channels (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete restrict,
  body text not null,
  created_at timestamptz not null default now()
);

create index channel_messages_channel_idx on public.channel_messages (channel_id, created_at);

alter table public.channel_messages enable row level security;

create policy channel_messages_select on public.channel_messages
  for select using (
    exists (
      select 1 from public.message_channels c
      where c.id = channel_id and (is_org_member(c.organization_id) or is_super_admin())
    )
  );
create policy channel_messages_write on public.channel_messages
  for insert
  with check (
    exists (
      select 1 from public.message_channels c
      where c.id = channel_id and is_org_member(c.organization_id)
    )
  );
