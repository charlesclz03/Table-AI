-- Migration: 0025_stripe_subscriptions
-- Creates the public.subscriptions table for tracking Stripe subscription state.
-- Billing ledger (billing_ledger) already exists — do not recreate it.

-- Run in the Supabase SQL editor.
-- Applies RLS: owners can select/update their own subscriptions; service_role has full access.

create table if not exists public.subscriptions (
  id               uuid primary key default gen_random_uuid(),
  restaurant_id    uuid not null references public.restaurants (id) on delete cascade,
  user_id          uuid references public.owners (id) on delete set null,
  stripe_customer_id         text,
  stripe_subscription_id     text unique,
  plan             text check (plan in ('monthly', 'annual', 'free')) not null default 'free',
  status           text check (status in ('active', 'past_due', 'cancelled', 'trialing', 'incomplete')) not null default 'incomplete',
  current_period_start      timestamp with time zone,
  current_period_end        timestamp with time zone,
  cancel_at_period_end       boolean not null default false,
  created_at       timestamp with time zone not null default now(),
  updated_at       timestamp with time zone not null default now()
);

create index if not exists subscriptions_restaurant_id_idx
  on public.subscriptions (restaurant_id);

create index if not exists subscriptions_stripe_subscription_id_idx
  on public.subscriptions (stripe_subscription_id);

create index if not exists subscriptions_user_id_idx
  on public.subscriptions (user_id);

alter table public.subscriptions enable row level security;

drop policy if exists subscriptions_owner_select on public.subscriptions;
create policy subscriptions_owner_select
on public.subscriptions
for select
using (
  restaurant_id in (
    select id
    from public.restaurants
    where owner_id = auth.uid()
  )
);

drop policy if exists subscriptions_owner_update on public.subscriptions;
create policy subscriptions_owner_update
on public.subscriptions
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

drop policy if exists subscriptions_service_role_all on public.subscriptions;
create policy subscriptions_service_role_all
on public.subscriptions
for all
using (true)
with check (true);
