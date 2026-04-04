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

- 2026-04-04

Related docs:

- `docs/README.md`
- `docs/reference/PATCH_NOTES.md`
- `docs/progress-log.md`
- `docs/next-steps.md`
- `docs/session-log.md`

## Start Here

1. `AGENTS.md`
2. `docs/reference/PATCH_NOTES.md`
3. `docs/progress-log.md`
4. `docs/session-log.md`
5. `docs/next-steps.md`
6. `docs/runbooks/local-development.md`
7. `docs/architecture/system-map.md`

## Current Truth

- the repo is a repaired Next.js 15 SaaS starter with auth, Prisma, Supabase, Stripe, and onboarding suggestion scaffolding
- the documentation operating system is now installed and should be treated as the canonical navigation layer
- this repo should stay representative of the best reusable baseline, not accumulate product-specific drift
- Table IA now has a canonical `docs/reference/PATCH_NOTES.md` file for release-level history, in addition to progress and session logs
- Table IA now includes an owner admin section at `/admin` that resolves the restaurant by NextAuth email and reads or updates restaurant data from Supabase
- the owner flow now includes a public landing page on `/`, a dedicated `/admin/login` screen, and first-login restaurant auto-provisioning when Google + Supabase service-role envs are configured
- the admin build passed `tsc`, targeted eslint, and `next build`; the remaining lint warning is in `app/chat/[restaurantId]/page.tsx` (`react-hooks/exhaustive-deps`)
- Table IA now has a repo-local `.agent/workflows/deploy.md` adapted from Freestyla for GitHub + Vercel releases; use it instead of the older generic deploy workflow
- Table IA now includes `docs/session-log.md` for chronological session notes alongside the baseline-focused `docs/progress-log.md`, and `/deploy` should treat those plus patch notes as a release gate
- normal final answers should summarize the work and verification without enumerating edited files unless the user explicitly asks for paths

## Exact Next Slice

- keep the starter aligned with FlowForge-grade release discipline
- remove or archive sample artifacts that stop representing the real baseline
- document any new integration or workflow change in the patch notes, progress log, session log, handoff, commands, env reference, and deploy docs when relevant
- keep `/deploy` and `docs/DEPLOY_CHECKLIST.md` aligned with the current reporting contract so deploy summaries stay concise and non-redundant
- if the product wants true Supabase-auth-based owner isolation, migrate `/admin` from email-matched NextAuth access to Supabase Auth and apply the intended RLS policies on `restaurants`, `conversations`, and `analytics`
