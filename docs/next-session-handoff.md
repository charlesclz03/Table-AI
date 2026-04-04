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
- Gustia now includes an owner admin section at `/admin` that authenticates through Supabase Auth, auto-claims the matching owner record, and reads or updates restaurant data through owner-scoped Supabase access
- the owner flow now includes a public landing page on `/`, a dedicated `/admin/login` screen, Supabase email/password auth, Google OAuth through Supabase Auth, and first-login owner/restaurant auto-provisioning when the Supabase owner migration has been applied
- the public production domain is now live at `https://www.gustia.wine`
- the latest production deployment is `dpl_HFVX9hrH4DhF3kr7qLEktiUCjBpo`, verified on `https://www.gustia.wine`
- the latest release commit on `origin/main` is `1a0e359` (`chore(release): ai menu photo import`)
- the guest chat now uses OpenAI TTS for concierge voice replies through `/api/tts`, with browser speech fallback if API synthesis or playback fails
- the owner menu editor now includes an `Upload Photo` flow backed by `/api/menu/parse`, where OpenAI `gpt-4o` extracts menu items from uploaded menu images or PDFs before owner review and save
- the owner dashboard now includes `/admin/changelog`, backed by `lib/changelog.ts` and `/api/changelog`, with a latest-version badge in the admin navigation
- the owner dashboard now includes `/admin/analytics`, backed by `/api/admin/analytics`, with live conversation counts, top questions, language mix, peak usage windows, and recommendation trends
- `/api/chat` now persists full conversation snapshots plus anonymized rows in `conversation_analytics`, so owner analytics can refresh from real guest usage without storing guest identities
- the current release passed `npm run type-check`, `npm run lint`, `npm run build`, and `npm run test` before production deploy
- production smoke verified `200` responses on `/`, `/chat/demo`, `/admin/login`, `/admin/billing/success`, `/admin/billing/canceled`, and `/api/health`, with `/admin` redirecting correctly to `/admin/login`
- production `/api/tts` was re-verified after the billing update and now responds successfully with `audio/mpeg`
- the AI menu import flow is deployed, but live parsing still needs an authenticated owner session and a real menu upload test in production
- `/deploy` should now default to pushing `main` to GitHub and letting Vercel auto-deploy; direct CLI deploys are fallback-only
- after the GitHub push for `1a0e359`, the connected auto-deploy still did not appear promptly, so production was shipped through the documented Vercel CLI fallback path
- Gustia now has a repo-local `.agent/workflows/deploy.md` adapted from Freestyla for GitHub + Vercel releases; use it instead of the older generic deploy workflow
- Gustia now includes `docs/session-log.md` for chronological session notes alongside the baseline-focused `docs/progress-log.md`, and `/deploy` should treat those plus patch notes as a release gate
- normal final answers should summarize the work and verification without enumerating edited files unless the user explicitly asks for paths

## Exact Next Slice

- keep the starter aligned with FlowForge-grade release discipline
- keep `lib/changelog.ts` and the owner-facing `/admin/changelog` feed synchronized whenever a release-worthy product change ships
- remove or archive sample artifacts that stop representing the real baseline
- document any new integration or workflow change in the patch notes, progress log, session log, handoff, commands, env reference, and deploy docs when relevant
- keep `/deploy` and `docs/DEPLOY_CHECKLIST.md` aligned with the current reporting contract so deploy summaries stay concise and non-redundant
- live-smoke the new `/admin/menu` photo import with a real owner account and a real menu PDF in production
- apply the `conversation_analytics` SQL changes from `docs/reference/supabase-owner-auth-migration.sql` in the live Supabase project before expecting language and recommendation analytics in production
- live-smoke `/admin/analytics` with a real owner account after the SQL update so the dashboard is validated against real concierge traffic
- verify `/api/chat` end-to-end against the live OpenAI account now that API billing is working again
- apply `docs/reference/supabase-owner-auth-migration.sql` in the live Supabase project before treating the new owner auth path as production-ready
- verify Supabase dashboard auth settings still allow both email/password and Google OAuth, with `/auth/callback` added to the allowed redirect URLs
- if admin reads fail after deploy, check that `owners`, `restaurants.owner_id`, and the RLS policies from the migration are present before debugging the app code
