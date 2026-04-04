# Master Project Next Session Handoff

Purpose:

- tell the next coding session exactly where to start and what to do next

Audience:

- coding agents
- maintainers

Status:

- active

Source of truth scope:

- immediate execution brief for the starter repo

Last updated:

- 2026-03-24

Related docs:

- `docs/README.md`
- `docs/progress-log.md`
- `docs/next-steps.md`

## Start Here

1. `AGENTS.md`
2. `docs/progress-log.md`
3. `docs/next-steps.md`
4. `docs/runbooks/local-development.md`
5. `docs/architecture/system-map.md`

## Current Truth

- the repo is a repaired Next.js 15 SaaS starter with auth, Prisma, Supabase, Stripe, and onboarding suggestion scaffolding
- the documentation operating system is now installed and should be treated as the canonical navigation layer
- this repo should stay representative of the best reusable baseline, not accumulate product-specific drift
- Table IA now includes an owner admin section at `/admin` that resolves the restaurant by NextAuth email and reads or updates restaurant data from Supabase
- the admin build passed `tsc`, targeted eslint, and `next build`; the remaining lint warning is in `app/chat/[restaurantId]/page.tsx` (`react-hooks/exhaustive-deps`)

## Exact Next Slice

- keep the starter aligned with FlowForge-grade release discipline
- remove or archive sample artifacts that stop representing the real baseline
- document any new integration or workflow change in the docs hub, commands, and env reference
- preserve the reply-memory workflow: append both `Bidi` and `Codex` turns to `brainlast10replies.MD` using `scripts/brainlast10replies.mjs`
- if the product wants true Supabase-auth-based owner isolation, migrate `/admin` from email-matched NextAuth access to Supabase Auth and apply the intended RLS policies on `restaurants`, `conversations`, and `analytics`
