# Master Project Progress Log

Purpose:

- record what the starter already ships

Audience:

- maintainers
- coding agents

Status:

- active

Source of truth scope:

- shipped baseline only

Last updated:

- 2026-03-24

Related docs:

- `docs/README.md`
- `docs/next-steps.md`

## Current Baseline

- Next.js 15 App Router shell with `/`, `/dashboard`, auth routes, and health endpoint
- typed env access and helpers for Prisma, NextAuth, Supabase, and Stripe
- onboarding suggestion flow with optional InsForge-backed recommendations
- reusable UI primitives, Vitest coverage, and Playwright smoke coverage
- documentation operating system starter set installed under `docs/`
- Table IA owner admin area shipped under `/admin`, including menu editing, onboarding quiz editing, QR poster generation, and billing overview pages backed by Supabase + Stripe helpers
- Table IA billing now includes a hosted Stripe Checkout setup CTA, success/cancel states, and dedicated result pages for the founding-offer flow
- Table IA customer chat now routes GPT-4o mini calls through a server API with restaurant context and automatic demo fallback on failures
- Table IA now includes a direct Supabase SQL schema document and a Vercel deploy checklist covering env vars and Stripe webhook setup
