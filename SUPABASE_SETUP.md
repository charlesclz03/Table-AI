# Table IA — Supabase Setup Guide
**Date:** 2026-04-02

---

## Overview

Table IA uses Supabase for:
- Authentication (email/password for restaurant owners)
- Database (restaurants, conversations, analytics)
- Storage (menu photos, QR codes)

---

## Step 1: Create Supabase Project

1. Go to supabase.com
2. Click "New Project"
3. Name: `table-ia`
4. Database region: `eu-west-1` (Ireland — closest to Lisbon)
5. Save the password shown — you'll need it

---

## Step 2: Get API Keys

In Supabase Dashboard → Settings → API:

```
SUPABASE_URL=https://[YOUR_PROJECT].supabase.co
SUPABASE_ANON_KEY=[ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[SERVICE_ROLE_KEY]  ← Keep secret
```

Add these to `C:\Projects\TableIA\.env.local`

---

## Step 3: Run Database Schema

Go to Supabase Dashboard → SQL Editor → New Query:

```sql
-- ============================================
-- Table IA Database Schema
-- ============================================

-- Restaurants table
create table restaurants (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  logo_url text,
  soul_md text default '',
  rules_md text default '',
  menu_json jsonb default '[]',
  quiz_answers jsonb default '{}',
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text default 'inactive',
  plan_name text default 'founding',
  setup_paid_at timestamp,
  billing_starts_at timestamp,
  qr_code_url text,
  created_at timestamp default now()
);

-- Conversations table
create table conversations (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references restaurants(id),
  table_number text,
  messages jsonb default '[]',
  created_at timestamp default now()
);

-- Analytics table
create table analytics (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references restaurants(id),
  query_count integer default 0,
  month text,
  created_at timestamp default now()
);

-- ============================================
-- Row Level Security
-- ============================================

-- Enable RLS
alter table restaurants enable row level security;
alter table conversations enable row level security;
alter table analytics enable row level security;

-- Restaurants: owner can only access their own
create policy "restaurants_select" on restaurants
  for select using (auth.uid() = id);

create policy "restaurants_insert" on restaurants
  for insert with check (auth.uid() = id);

create policy "restaurants_update" on restaurants
  for update using (auth.uid() = id);

-- Conversations: public can create, owner can read
create policy "conversations_public_insert" on conversations
  for insert with check (true);

create policy "conversations_owner_select" on conversations
  for select using (
    restaurant_id in (select id from restaurants where auth.uid() = id)
  );

-- Analytics: owner can only see their own
create policy "analytics_owner" on analytics
  for all using (
    restaurant_id in (select id from restaurants where auth.uid() = id)
  );

-- ============================================
-- Storage Buckets
-- ============================================

-- Menu photos (public read for GPT vision processing)
insert into storage.buckets (id, name, public)
values ('menu-photos', 'menu-photos', true);

-- QR codes (public read for customers)
insert into storage.buckets (id, name, public)
values ('qr-codes', 'qr-codes', true);

-- Storage policies
create policy "menu_photos_upload" on storage.objects
  for insert to storage.role('authenticated')
  with check (bucket_id = 'menu-photos');

create policy "menu_photos_read" on storage.objects
  for select using (bucket_id = 'menu-photos');

create policy "qr_codes_upload" on storage.objects
  for insert to storage.role('authenticated')
  with check (bucket_id = 'qr-codes');

create policy "qr_codes_read" on storage.objects
  for select using (bucket_id = 'qr-codes');
```

---

## Step 4: Enable Email Auth

In Supabase Dashboard → Authentication → Providers → Email:

✅ Enable Email provider
✅ Enable "Confirm email" (recommended) — OR — ❌ Disable for faster signup

For v1 testing: disable confirm email

---

## Step 5: Connect to App

Add to `C:\Projects\TableIA\.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[SERVICE_ROLE_KEY]
```

In your Next.js app, install Supabase client:

```bash
npm install @supabase/supabase-js
```

Create `lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## Step 6: Test It

Run this in the Supabase SQL Editor to test:

```sql
-- Test insert
insert into restaurants (email, name) 
values ('test@example.com', 'Test Restaurant');

-- Verify
select * from restaurants;
```

You should see the test restaurant in the table.

---

## From Freestyla (What You Already Have)

If Bidi already has Supabase set up for Freestyla:

1. He can reuse the same Supabase project for Table IA (just add new tables)
2. OR create a new project — depends on whether he wants them separate

The auth, storage, and database are all shared, so he only needs one Supabase project.

---

## Summary of Env Vars

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# OpenAI
OPENAI_API_KEY=sk-xxx

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SETUP_PRICE_ID=price_setup_xxx
STRIPE_MONTHLY_PRICE_ID=price_monthly_xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
