# Gustia Supabase Schema

Last updated: 2026-04-04

## Context

Gustia now uses Supabase Auth as the owner-admin identity layer.

- `auth.users` is the source of truth for owner identity
- `public.owners` mirrors owner profile data and uses the same UUID as `auth.users.id`
- `public.restaurants.owner_id` links each restaurant to the authenticated owner
- owner reads and writes are expected to flow through Supabase RLS
- public guest chat no longer depends on direct anon reads from `public.restaurants`; the app serves the safe restaurant payload through an internal route

## Canonical SQL

Run the migration in:

- `docs/reference/supabase-owner-auth-migration.sql`

That script:

1. Creates `public.owners` with `id references auth.users(id)`.
2. Backfills owners from existing Supabase Auth users.
3. Adds `public.restaurants.owner_id`.
4. Backfills `restaurants.owner_id` by matching existing restaurant emails to owner emails.
5. Creates `public.conversation_analytics` for anonymized owner insights.
6. Enables RLS on `owners`, `restaurants`, `conversations`, and analytics tables when present.
7. Applies owner-scoped policies for admin reads and writes.

## Expected Tables

`public.owners`

- `id`
- `email`
- `name`
- `created_at`

`public.restaurants`

- `id`
- `owner_id`
- `email`
- `name`
- `logo_url`
- `soul_md`
- `rules_md`
- `menu_json`
- `quiz_answers`
- `stripe_customer_id`
- `stripe_subscription_id`
- `subscription_status`
- `plan_name`
- `setup_paid_at`
- `billing_starts_at`
- `qr_code_url`
- `created_at`

`public.conversations`

- `id`
- `restaurant_id`
- `table_number`
- `messages`
- `created_at`

`public.conversation_analytics`

- `id`
- `restaurant_id`
- `conversation_id`
- `question_text`
- `response_preview`
- `language`
- `created_at`

## Notes

- The `owners.id = auth.users.id` link is intentional. It makes `auth.uid()` line up with the owner row and keeps the RLS policies simple and correct.
- `public.conversation_analytics` is intentionally metadata-only so the owner dashboard can show usage trends without storing guest identities.
- If the `analytics` table does not exist yet, the migration skips its policy block safely.
- The Prisma schema in this repo still covers the generic starter auth/subscription models; Gustia restaurant data remains managed in Supabase SQL.
