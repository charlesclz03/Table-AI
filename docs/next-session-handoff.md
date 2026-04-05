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

- 2026-04-05

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
- the public pricing flow now requires owner auth before Stripe Checkout: landing plan CTAs route into `/auth/login`, authenticated owners continue through `/auth/checkout`, and Stripe is pre-filled from the signed-in owner email
- the public landing page on `/` is now a mobile-first parallax tutorial for restaurant owners, with a fixed azulejos backdrop, four setup steps, guest-flow preview, and the locked activation-first pricing language
- the shared UI now follows a stricter glass system: azulejos only in the background layer, then translucent glass panels, chips, alerts, inputs, and tinted CTA surfaces across landing, onboarding, chat, and entry shells
- the public legal pages, landing CTA, and restaurant contact touchpoints now consistently use `contact@gustia.wine`
- the public production domain is now live at `https://www.gustia.wine`
- check Vercel for the current production deployment id before debugging a live incident, because `/deploy` can advance production after this handoff was last edited
- check `origin/main` for the current release commit before debugging release-specific regressions
- the guest chat now uses OpenAI TTS for concierge voice replies through `/api/tts`, with browser speech fallback if API synthesis or playback fails
- the guest chat API no longer trusts restaurant prompt context from the browser; clients send only `restaurantId` and the server fetches `soul_md`, `rules_md`, and `menu_json` itself
- public restaurant bootstrap data now comes from the `restaurant_public_profiles` projection instead of a service-role read of the full `restaurants` row
- owner restaurant claiming is now invite-based through `restaurant_owner_invites`; direct email-based claiming should be considered retired
- shared request hardening now covers signup, login, logout, checkout, billing portal, chat, TTS, and menu parse with trusted-origin checks, payload caps, rate limits, and audit-log hooks
- Stripe webhooks now persist idempotent event rows plus append-only billing ledger entries, and sync the stored restaurant billing state from checkout, subscription, and invoice events
- the guest onboarding theme step now previews localized AI greetings with per-theme OpenAI voices, a separate confirm button, and text-only fallback if preview audio is unavailable
- the guest onboarding theme step now uses an orbital planet-style selector with swipe and arrow navigation, blurred side states, and directional wine slosh on the center preview sphere
- the owner menu editor now includes an `Upload Photo` flow backed by `/api/menu/parse`, where OpenAI `gpt-4o` extracts menu items from uploaded menu images or PDFs before owner review and save
- the owner dashboard now includes `/admin/changelog`, backed by `lib/changelog.ts` and `/api/changelog`, with a latest-version badge in the admin navigation
- the owner dashboard now includes `/admin/analytics`, backed by `/api/admin/analytics`, with live conversation counts, top questions, language mix, peak usage windows, and recommendation trends
- the owner admin now includes `/admin/onboarding`, backed by `/api/admin/onboarding` and `/api/admin/onboarding/import`, so Bidi can paste a Google Maps URL, review editable concierge fields, and save generated `soul_md` plus `rules_md`
- `/api/chat` now persists full conversation snapshots plus anonymized rows in `conversation_analytics`, so owner analytics can refresh from real guest usage without storing guest identities
- tracked app/docs branding is now clean of residual pre-launch product-name references, and the app ships a branded browser tab icon
- the current release passed `npm run type-check`, `npm run lint`, `npm run build`, and `npm run test` before production deploy
- production smoke verified `200` responses on `/`, `/chat/demo`, `/admin/login`, `/admin/billing/success`, `/admin/billing/canceled`, and `/api/health`, with `/admin` redirecting correctly to `/admin/login`
- production `/api/tts` was re-verified after the billing update and now responds successfully with `audio/mpeg`
- the AI menu import flow is deployed, but live parsing still needs an authenticated owner session and a real menu upload test in production
- `/deploy` should now run the fast release path: update the canonical session docs, push `main`, then immediately run the Vercel production deploy
- `/deploy` now also requires an explicit changed-files documentation review so every impacted doc is updated or consciously confirmed current before push or deploy
- do not wait on GitHub-connected Vercel auto-deploy as part of the normal release path unless a future session intentionally changes that contract
- Gustia now has a repo-local `.agent/workflows/deploy.md` adapted from Freestyla for GitHub + Vercel releases; use it instead of the older generic deploy workflow
- Gustia now includes `docs/session-log.md` for chronological session notes alongside the baseline-focused `docs/progress-log.md`, and `/deploy` should treat those plus patch notes as a release gate
- normal final answers should summarize the work and verification without enumerating edited files unless the user explicitly asks for paths
- local browser smoke on `/auth/login` succeeded after the hardening sprint, but `/chat/demo` hydration still needs investigation because `_next/static` asset requests returned `400` during the local smoke even though `npm run build` passed

## Exact Next Slice

- keep the starter aligned with FlowForge-grade release discipline
- keep `lib/changelog.ts` and the owner-facing `/admin/changelog` feed synchronized whenever a release-worthy product change ships
- remove or archive sample artifacts that stop representing the real baseline
- document any new integration or workflow change in the patch notes, progress log, session log, handoff, commands, env reference, and deploy docs when relevant
- treat `README.md` and `docs/README.md` as part of the default release doc review whenever product scope, setup, commands, or operating guidance changed
- keep `/deploy` and `docs/DEPLOY_CHECKLIST.md` aligned with the current reporting contract so deploy summaries stay concise and non-redundant
- live-smoke the new `/admin/menu` photo import with a real owner account and a real menu PDF in production
- live-smoke `/admin/onboarding` with a real Google Maps restaurant URL in production and confirm that place details, editable fields, and generated markdown save correctly
- live-smoke the onboarding theme voice previews and new orbital swipe selector on a real mobile device, and confirm the per-theme voice mapping feels distinct enough in production
- apply the `conversation_analytics` SQL changes from `docs/reference/supabase-owner-auth-migration.sql` in the live Supabase project before expecting language and recommendation analytics in production
- live-smoke `/admin/analytics` with a real owner account after the SQL update so the dashboard is validated against real concierge traffic
- verify `/api/chat` end-to-end against the live OpenAI account now that API billing is working again
- apply `docs/reference/supabase-owner-auth-migration.sql` in the live Supabase project before treating the new owner auth path as production-ready
- verify Supabase dashboard auth settings still allow both email/password and Google OAuth, with `/auth/callback` added to the allowed redirect URLs
- live-smoke the full monthly and annual pricing paths with a real owner account, including Google OAuth and Stripe Checkout, because the local browser smoke only verified page routing and unauthenticated redirects
- if admin reads fail after deploy, check that `owners`, `restaurants.owner_id`, and the RLS policies from the migration are present before debugging the app code
- investigate why local `/chat/demo` hydration requested `_next/static` assets that returned `400` during browser smoke, even after a successful production build and updated audit scripts
