# Gustia Supabase Setup Guide

Last updated: 2026-04-05

## Overview

Gustia uses Supabase for:

- owner authentication
- owner-scoped Postgres data
- guest-safe restaurant bootstrap data

Current product data is not defined by `prisma/schema.prisma`.
The live product schema is the SQL migration at:

- `docs/reference/supabase-owner-auth-migration.sql`

## Required Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Required Auth Configuration

Enable these in Supabase Auth:

- Email/password provider
- Google provider if you want Google owner login to be live

Allowed redirects should include:

- `http://localhost:3000/auth/callback`
- `https://www.gustia.wine/auth/callback`

## Required Schema Setup

Run this SQL in the Supabase SQL editor:

- `docs/reference/supabase-owner-auth-migration.sql`

That migration creates or updates:

- `owners`
- `restaurants.owner_id`
- `restaurant_owner_invites`
- `conversation_analytics`
- `audit_logs`
- `stripe_webhook_events`
- `billing_ledger`
- `restaurant_public_profiles`

It also enables the owner-scoped RLS policies used by the admin surface.

## Notes

- the owner admin expects `owners.id = auth.users.id`
- guest chat does not read the full `restaurants` row directly
- current QR and menu-import features do not depend on Supabase Storage
- if Google OAuth returns `Unsupported provider: provider is not enabled`, treat that as a Supabase config blocker

