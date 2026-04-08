-- Gustia owner auth migration
-- Run in the Supabase SQL editor before switching the admin to Supabase Auth in production.
-- This version intentionally ties public.owners.id to auth.users.id so auth.uid() can drive RLS safely.

create extension if not exists pgcrypto;

create table if not exists public.owners (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique not null,
  name text,
  created_at timestamp with time zone not null default now()
);

insert into public.owners (id, email, name)
select
  users.id,
  lower(users.email),
  coalesce(
    users.raw_user_meta_data ->> 'full_name',
    users.raw_user_meta_data ->> 'name',
    initcap(split_part(users.email, '@', 1))
  )
from auth.users as users
where users.email is not null
on conflict (id) do update
set
  email = excluded.email,
  name = coalesce(excluded.name, public.owners.name);

alter table public.restaurants
  add column if not exists owner_id uuid,
  add column if not exists logo_url text,
  add column if not exists stripe_subscription_id text,
  add column if not exists plan_name text default 'Founding Restaurant',
  add column if not exists setup_paid_at timestamp with time zone,
  add column if not exists billing_starts_at timestamp with time zone,
  add column if not exists qr_code_url text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'restaurants_owner_id_fkey'
  ) then
    alter table public.restaurants
      add constraint restaurants_owner_id_fkey
      foreign key (owner_id) references public.owners (id) on delete set null;
  end if;
end
$$;

create index if not exists restaurants_owner_id_idx
  on public.restaurants (owner_id);

create index if not exists restaurants_stripe_subscription_id_idx
  on public.restaurants (stripe_subscription_id);

create index if not exists conversations_restaurant_id_idx
  on public.conversations (restaurant_id);

create table if not exists public.restaurant_owner_invites (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  invitee_email text not null,
  invited_by_owner_id uuid references public.owners (id) on delete set null,
  accepted_by_owner_id uuid references public.owners (id) on delete set null,
  invite_token text unique,
  accepted_at timestamp with time zone,
  created_at timestamp with time zone not null default now()
);

create index if not exists restaurant_owner_invites_email_idx
  on public.restaurant_owner_invites (lower(invitee_email));

create index if not exists restaurant_owner_invites_restaurant_id_idx
  on public.restaurant_owner_invites (restaurant_id);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  status text not null default 'info',
  source text,
  reason text,
  actor_id uuid,
  restaurant_id uuid references public.restaurants (id) on delete set null,
  target_id text,
  ip_address text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now()
);

create index if not exists audit_logs_action_idx
  on public.audit_logs (action);

create index if not exists audit_logs_restaurant_id_idx
  on public.audit_logs (restaurant_id);

create index if not exists audit_logs_created_at_idx
  on public.audit_logs (created_at desc);

create table if not exists public.stripe_webhook_events (
  id text primary key,
  event_type text not null,
  restaurant_id uuid references public.restaurants (id) on delete set null,
  payload jsonb not null,
  processing_status text not null default 'processing',
  processing_error text,
  result_detail text,
  processed_at timestamp with time zone,
  created_at timestamp with time zone not null default now()
);

create index if not exists stripe_webhook_events_restaurant_id_idx
  on public.stripe_webhook_events (restaurant_id);

create index if not exists stripe_webhook_events_processed_at_idx
  on public.stripe_webhook_events (processed_at desc);

create table if not exists public.billing_ledger (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  stripe_event_id text references public.stripe_webhook_events (id) on delete set null,
  entry_type text not null,
  status text,
  amount_minor integer,
  currency text,
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_invoice_id text,
  stripe_checkout_session_id text,
  period_start timestamp with time zone,
  period_end timestamp with time zone,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now()
);

create index if not exists billing_ledger_restaurant_id_idx
  on public.billing_ledger (restaurant_id);

create index if not exists billing_ledger_created_at_idx
  on public.billing_ledger (created_at desc);

create or replace view public.restaurant_public_profiles as
select
  id,
  name,
  menu_json,
  subscription_status
from public.restaurants;

grant select on public.restaurant_public_profiles to anon, authenticated;

create table if not exists public.conversation_analytics (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  conversation_id uuid references public.conversations (id) on delete cascade,
  question_text text not null,
  response_preview text,
  language text,
  created_at timestamp with time zone not null default now()
);

create index if not exists conversation_analytics_restaurant_id_idx
  on public.conversation_analytics (restaurant_id);

create index if not exists conversation_analytics_conversation_id_idx
  on public.conversation_analytics (conversation_id);

create index if not exists conversation_analytics_created_at_idx
  on public.conversation_analytics (created_at desc);

create table if not exists public.usage_logs (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  query_count integer not null default 0,
  period_start date not null,
  period_end date not null,
  created_at timestamp with time zone not null default now()
);

create unique index if not exists usage_logs_restaurant_period_idx
  on public.usage_logs (restaurant_id, period_start);

create index if not exists usage_logs_created_at_idx
  on public.usage_logs (created_at desc);

update public.restaurants as restaurants
set owner_id = owners.id
from public.owners as owners
where restaurants.owner_id is null
  and restaurants.email is not null
  and lower(restaurants.email) = owners.email;

update public.restaurants
set plan_name = coalesce(nullif(plan_name, ''), 'Founding Restaurant')
where plan_name is null or plan_name = '';

alter table public.owners enable row level security;
alter table public.restaurants enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_analytics enable row level security;
alter table public.billing_ledger enable row level security;
alter table public.audit_logs enable row level security;
alter table public.restaurant_owner_invites enable row level security;
alter table public.stripe_webhook_events enable row level security;
alter table public.usage_logs enable row level security;

drop policy if exists owners_own on public.owners;
create policy owners_own
on public.owners
for all
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists restaurants_public_read on public.restaurants;
drop policy if exists restaurants_auth_write on public.restaurants;
drop policy if exists restaurants_own on public.restaurants;
create policy restaurants_own
on public.restaurants
for all
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists conversations_insert on public.conversations;
drop policy if exists conversations_read on public.conversations;
drop policy if exists conversations_owner_select on public.conversations;
create policy conversations_owner_select
on public.conversations
for select
using (
  restaurant_id in (
    select id
    from public.restaurants
    where owner_id = auth.uid()
  )
);

drop policy if exists conversations_owner_update on public.conversations;
create policy conversations_owner_update
on public.conversations
for update
using (
  restaurant_id in (
    select id
    from public.restaurants
    where owner_id = auth.uid()
  )
)
with check (
  restaurant_id in (
    select id
    from public.restaurants
    where owner_id = auth.uid()
  )
);

drop policy if exists conversations_public_insert on public.conversations;
create policy conversations_public_insert
on public.conversations
for insert
with check (true);

drop policy if exists conversation_analytics_owner_select on public.conversation_analytics;
create policy conversation_analytics_owner_select
on public.conversation_analytics
for select
using (
  restaurant_id in (
    select id
    from public.restaurants
    where owner_id = auth.uid()
  )
);

drop policy if exists conversation_analytics_owner_update on public.conversation_analytics;
create policy conversation_analytics_owner_update
on public.conversation_analytics
for update
using (
  restaurant_id in (
    select id
    from public.restaurants
    where owner_id = auth.uid()
  )
)
with check (
  restaurant_id in (
    select id
    from public.restaurants
    where owner_id = auth.uid()
  )
);

drop policy if exists billing_ledger_owner_select on public.billing_ledger;
create policy billing_ledger_owner_select
on public.billing_ledger
for select
using (
  restaurant_id in (
    select id
    from public.restaurants
    where owner_id = auth.uid()
  )
);

drop policy if exists usage_logs_owner_select on public.usage_logs;
create policy usage_logs_owner_select
on public.usage_logs
for select
using (
  restaurant_id in (
    select id
    from public.restaurants
    where owner_id = auth.uid()
  )
);

do $$
begin
  if to_regclass('public.analytics') is null then
    return;
  end if;

  execute 'alter table public.analytics enable row level security';
  execute 'create index if not exists analytics_restaurant_id_idx on public.analytics (restaurant_id)';
  execute 'drop policy if exists analytics_owner on public.analytics';
  execute $policy$
    create policy analytics_owner
    on public.analytics
    for all
    using (
      restaurant_id in (
        select id
        from public.restaurants
        where owner_id = auth.uid()
      )
    )
    with check (
      restaurant_id in (
        select id
        from public.restaurants
        where owner_id = auth.uid()
      )
    )
  $policy$;
end
$$;
