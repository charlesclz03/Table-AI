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
  add column if not exists owner_id uuid;

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

create index if not exists conversations_restaurant_id_idx
  on public.conversations (restaurant_id);

update public.restaurants as restaurants
set owner_id = owners.id
from public.owners as owners
where restaurants.owner_id is null
  and restaurants.email is not null
  and lower(restaurants.email) = owners.email;

alter table public.owners enable row level security;
alter table public.restaurants enable row level security;
alter table public.conversations enable row level security;

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
