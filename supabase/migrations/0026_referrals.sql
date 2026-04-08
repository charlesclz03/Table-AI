-- Migration: 0026_referrals
-- Adds referral codes plus pending/completed/rewarded tracking for
-- "Give 1 month free, get 1 month free".

create table if not exists public.referral_codes (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null unique references public.restaurants (id) on delete cascade,
  code text not null unique,
  created_at timestamp with time zone not null default now()
);

create index if not exists referral_codes_code_idx
  on public.referral_codes (code);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referral_code_id uuid references public.referral_codes (id) on delete set null,
  referrer_restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  referred_restaurant_id uuid not null unique references public.restaurants (id) on delete cascade,
  code text not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'rewarded')),
  reward_months integer not null default 1,
  referred_bonus_months integer not null default 1,
  applied_at timestamp with time zone not null default now(),
  completed_at timestamp with time zone,
  rewarded_at timestamp with time zone,
  created_at timestamp with time zone not null default now()
);

create index if not exists referrals_referrer_restaurant_id_idx
  on public.referrals (referrer_restaurant_id);

create index if not exists referrals_status_idx
  on public.referrals (status);

alter table public.referral_codes enable row level security;
alter table public.referrals enable row level security;

drop policy if exists referral_codes_owner_select on public.referral_codes;
create policy referral_codes_owner_select
on public.referral_codes
for select
using (
  restaurant_id in (
    select id
    from public.restaurants
    where owner_id = auth.uid()
  )
);

drop policy if exists referrals_owner_select on public.referrals;
create policy referrals_owner_select
on public.referrals
for select
using (
  referrer_restaurant_id in (
    select id
    from public.restaurants
    where owner_id = auth.uid()
  )
  or referred_restaurant_id in (
    select id
    from public.restaurants
    where owner_id = auth.uid()
  )
);
