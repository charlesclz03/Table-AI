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
- Gustia now has a canonical `docs/reference/PATCH_NOTES.md` file for release-level history, in addition to progress and session logs
- Gustia now includes an owner admin section at `/admin` that resolves the restaurant by NextAuth email and reads or updates restaurant data from Supabase
- the owner flow now includes a public landing page on `/`, a dedicated `/admin/login` screen, and first-login restaurant auto-provisioning when Google + Supabase service-role envs are configured
- the public production domain is now live at `https://www.gustia.wine`
- the latest production deployment is `dpl_FzNTKtpWkXdKeBPBPPLuWR9uten3`, verified on `https://www.gustia.wine` and `https://gustia.wine`
- the full documented workspace was pushed to `origin/main` in commit `2295105` (`chore(release): gustia production launch`)
- the guest chat now uses OpenAI TTS for concierge voice replies through `/api/tts`, with browser speech fallback if API synthesis or playback fails
- the current chat build now passes `npm run type-check`, `npm run lint`, and `npm run build` after the OpenAI TTS reply upgrade
- local runtime smoke reached `/api/tts`, but the current OpenAI account returned a quota `429`, so natural voice playback still needs live verification after billing/quota is restored
- `/deploy` should now default to pushing `main` to GitHub and letting Vercel auto-deploy; direct CLI deploys are fallback-only
- after the GitHub push, a fresh auto-deploy was not yet visible via the Vercel CLI polling window, so the GitHub-to-Vercel integration should be rechecked if that automation is expected to be immediate
- Gustia now has a repo-local `.agent/workflows/deploy.md` adapted from Freestyla for GitHub + Vercel releases; use it instead of the older generic deploy workflow
- Gustia now includes `docs/session-log.md` for chronological session notes alongside the baseline-focused `docs/progress-log.md`, and `/deploy` should treat those plus patch notes as a release gate
- normal final answers should summarize the work and verification without enumerating edited files unless the user explicitly asks for paths

## Exact Next Slice

- keep the starter aligned with FlowForge-grade release discipline
- remove or archive sample artifacts that stop representing the real baseline
- document any new integration or workflow change in the patch notes, progress log, session log, handoff, commands, env reference, and deploy docs when relevant
- keep `/deploy` and `docs/DEPLOY_CHECKLIST.md` aligned with the current reporting contract so deploy summaries stay concise and non-redundant
- if the product wants true Supabase-auth-based owner isolation, migrate `/admin` from email-matched NextAuth access to Supabase Auth and apply the intended RLS policies on `restaurants`, `conversations`, and `analytics`
