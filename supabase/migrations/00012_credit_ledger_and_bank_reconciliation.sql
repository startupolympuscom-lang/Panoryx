-- 00012: customer credit ledger (module 8) and bank reconciliation
-- (module 9, plus the message red/green classification from module 10.1).

create type credit_transaction_type as enum ('charge', 'advance');
create type bank_message_type as enum ('debit', 'credit', 'info');
create type bank_deposit_status as enum ('pending', 'matched');

-- ---------------------------------------------------------------------
-- Module 8: Caisse des crédits clients et avances
-- ---------------------------------------------------------------------

create table public.credit_customers (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references public.stations (id) on delete cascade,
  name text not null,
  phone text,
  credit_limit numeric(12, 2) check (credit_limit is null or credit_limit >= 0),
  balance numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index credit_customers_station_idx on public.credit_customers (station_id);

create trigger set_credit_customers_updated_at
  before update on public.credit_customers
  for each row execute function public.set_updated_at();

create table public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.credit_customers (id) on delete cascade,
  station_id uuid not null references public.stations (id) on delete cascade,
  type credit_transaction_type not null,
  amount numeric(12, 2) not null check (amount > 0),
  note text,
  recorded_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now()
);

create index credit_transactions_customer_idx on public.credit_transactions (customer_id, created_at);
create index credit_transactions_station_idx on public.credit_transactions (station_id);

-- A charge increases what the customer owes; an advance (early/partial
-- payment) reduces it — kept in sync automatically so nobody has to
-- recompute the running balance by hand.
create or replace function public.apply_credit_transaction()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update credit_customers
  set balance = balance + (case when new.type = 'charge' then new.amount else -new.amount end)
  where id = new.customer_id;
  return new;
end;
$$;

create trigger apply_credit_transaction_trigger
  after insert on public.credit_transactions
  for each row execute function public.apply_credit_transaction();

alter table public.credit_customers enable row level security;
alter table public.credit_transactions enable row level security;

create policy credit_customers_select on public.credit_customers
  for select using (is_org_member(station_org_id(station_id)) or is_super_admin());
create policy credit_customers_write on public.credit_customers
  for all
  using (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager', 'accountant']::org_role[]))
  with check (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager', 'accountant']::org_role[]));

create policy credit_transactions_select on public.credit_transactions
  for select using (is_org_member(station_org_id(station_id)) or is_super_admin());
create policy credit_transactions_write on public.credit_transactions
  for insert
  with check (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager', 'accountant', 'operator']::org_role[]));

-- ---------------------------------------------------------------------
-- Module 9 + 10.1: Rapprochement bancaire (versements + messages banque)
-- ---------------------------------------------------------------------

create table public.bank_deposits (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references public.stations (id) on delete cascade,
  depositor_name text not null,
  amount numeric(12, 2) not null check (amount > 0),
  deposit_date date not null default current_date,
  status bank_deposit_status not null default 'pending',
  recorded_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now()
);

create index bank_deposits_station_idx on public.bank_deposits (station_id, deposit_date);
create index bank_deposits_status_idx on public.bank_deposits (station_id, status);

create table public.bank_messages (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references public.stations (id) on delete cascade,
  message_type bank_message_type not null default 'info',
  amount numeric(12, 2),
  raw_text text not null,
  received_at timestamptz not null default now(),
  matched_deposit_id uuid references public.bank_deposits (id) on delete set null,
  recorded_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now()
);

create index bank_messages_station_idx on public.bank_messages (station_id, received_at);
create index bank_messages_matched_idx on public.bank_messages (matched_deposit_id);

alter table public.bank_deposits enable row level security;
alter table public.bank_messages enable row level security;

create policy bank_deposits_select on public.bank_deposits
  for select using (is_org_member(station_org_id(station_id)) or is_super_admin());
create policy bank_deposits_write on public.bank_deposits
  for all
  using (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager', 'accountant']::org_role[]))
  with check (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager', 'accountant']::org_role[]));

create policy bank_messages_select on public.bank_messages
  for select using (is_org_member(station_org_id(station_id)) or is_super_admin());
create policy bank_messages_write on public.bank_messages
  for all
  using (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager', 'accountant']::org_role[]))
  with check (has_org_write_role(station_org_id(station_id), array['owner', 'network_manager', 'station_manager', 'accountant']::org_role[]));
