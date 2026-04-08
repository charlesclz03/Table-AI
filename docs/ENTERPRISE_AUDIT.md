# Gustia Enterprise Audit
Date: 2026-04-05
Status: CRITICAL / MUST FIX before launch

---

## Executive Summary

Gustia is in a better state than a typical early-stage product baseline: `npm run lint`, `npm run type-check`, `npm run test -- --run`, `npm audit --audit-level=high`, and `npm run build` all passed during this audit, the landing page loaded cleanly at mobile width, the custom 404 page worked, and a mobile Lighthouse snapshot on `/` scored 100 for Accessibility, Best Practices, and SEO.

That said, the current build is not launch-safe for enterprise use. The biggest blockers are trust-boundary failures in chat and restaurant data, a pre-verification restaurant-claim flow in signup, and billing/webhook fulfillment that is still a stub. Those three issues alone are enough to block launch. The repo also has secondary launch risks around missing rate limiting, incomplete CSRF/origin hardening, stale automation/docs, missing 500/loading UX surfaces, and drift between the Prisma schema and the live Supabase data model.

This report was built from a full repo inventory (`Get-ChildItem -Recurse -File | Select-Object FullName`) plus a detailed first-party audit of runtime code, docs, workflows, tests, and configs. Vendor/generated artifacts were inventoried but excluded from issue enumeration: `node_modules`, `.next`, `test-results`, build caches, and similar generated output.

## What I Did

- Inventoried the entire repository.
- Read the project handoff and docs hub before making assumptions.
- Audited first-party runtime code under `app/`, `components/`, `lib/`, and `prisma/`.
- Audited API routes, billing/auth flows, Supabase access patterns, and environment/config handling.
- Audited docs, workflows, verification scripts, and available repo-local skills/workflows.
- Ran local verification:
  - `npm run lint`
  - `npm run type-check`
  - `npm run test -- --run`
  - `npm audit --audit-level=high`
  - `npm run build`
- Ran smoke checks against a local production server:
  - `/` returned `200`
  - `/dashboard` returned `200`
  - `/api/health` returned healthy JSON
  - `/api/onboarding/suggestions` returned fallback JSON without crashing
  - missing route returned `404`
- Verified `/` and `404` at 375px width in a browser snapshot.
- Verified response headers on `/chat/demo`.

## Verified Baseline

- Lint: PASS
- Type-check: PASS
- Tests: PASS
- `npm audit` high-severity scan: PASS, 0 vulnerabilities found
- Production build: PASS
- Home page mobile Lighthouse snapshot: Accessibility 100, Best Practices 100, SEO 100
- Custom 404 page: PASS
- Home page mobile rendering at 375px: PASS

## Critical Issues (Must Fix Before Launch)

1. `app/api/chat/route.ts:110-184`
Issue: The API trusts the full `restaurant` object from the client and uses it to build prompts and analytics.
Impact: A caller can tamper `name`, `menu_json`, `soul_md`, `rules_md`, and `restaurant.id`, which breaks prompt integrity and allows analytics poisoning.
Fix: Accept only `restaurantId`, fetch allowed fields server-side, validate the restaurant state, and persist analytics only from server-fetched data.

2. `app/api/auth/signup/route.ts:82-88` and `lib/admin/owner-account.ts:132-153`
Issue: `ensureOwnerAccountForUser` is called immediately after signup, before email verification is guaranteed, and the helper claims a restaurant row by matching email.
Impact: A malicious signup using a restaurant email can claim that restaurant before the email is verified.
Fix: Move ownership claiming to the verified session path only, require confirmed email state before claim, and add an audit trail for ownership changes.

3. `lib/stripe/webhooks.ts:36-63`
Issue: Stripe webhook handling is still a stub. It acknowledges events but does not persist subscription/customer/payment state into the restaurant record or a billing ledger.
Impact: Billing status can be wrong after checkout, entitlements can drift, and operators cannot trust billing data.
Fix: Implement idempotent webhook fulfillment for checkout and subscription events, keyed by Stripe event ID and restaurant metadata, then add integration tests that assert database mutations.

## High Priority

1. `app/api/restaurants/[restaurantId]/route.ts:13-36`
Issue: The public route uses a service-role Supabase client and exposes `soul_md`, `rules_md`, `menu_json`, and `subscription_status`.
Impact: This bypasses RLS and leaks internal concierge prompt material.
Fix: Return a public-safe projection only, remove service-role access from the public route, validate `restaurantId`, and gate any internal fields behind authenticated admin access.

2. `next.config.js:37-40`
Issue: `Permissions-Policy` disables `microphone=()` globally.
Impact: Guest chat voice input is likely broken on supported browsers even though the chat UI exposes microphone interaction.
Fix: Scope the policy per route or allow `microphone` where the guest chat flow needs it.

3. `app/api/menu/parse/route.ts:57-102`
Issue: Uploaded menu files are sent to OpenAI and processed, but the uploaded file IDs are never deleted afterward.
Impact: Avoidable third-party retention, privacy exposure, and storage/cost creep.
Fix: Wrap file parsing in `try/finally` and delete uploaded file IDs after success or failure.

4. `app/api/chat/route.ts`, `app/api/tts/route.ts`, `app/api/menu/parse/route.ts`, `app/api/auth/login/route.ts`, `app/api/auth/signup/route.ts`
Issue: No rate limiting or abuse controls were found on expensive or sensitive endpoints.
Impact: Cost abuse, credential brute force, noisy analytics, and denial-of-wallet risk.
Fix: Add per-IP and per-user throttling, payload size caps, and structured rejection logging.

5. `app/api/auth/login/route.ts`, `app/api/auth/logout/route.ts`, `app/api/stripe/checkout/route.ts`, `app/api/admin/billing/portal/route.ts`
Issue: Sensitive POST flows rely on ambient cookies and same-origin assumptions without explicit CSRF/origin enforcement.
Impact: The current posture may be acceptable for same-site use, but it is not enterprise-grade or well documented.
Fix: Add origin checks or CSRF tokens for auth, billing, and admin mutation endpoints, and document the chosen defense clearly.

## Medium Priority

1. `app/api/admin/onboarding/route.ts:26-48`
Issue: Important fields such as `email`, `websiteUrl`, `googleMapsUrl`, `googlePlaceId`, and `phone` are stored with minimal validation.
Impact: Invalid restaurant records become easy to save and harder to trust downstream.
Fix: Upgrade the Zod schema with email/URL validation, sensible length limits, phone normalization, and enums for voice/theme selections.

2. `components/admin/QrStudio.tsx:42-55`
Issue: QR generation depends on `api.qrserver.com`.
Impact: Restaurant/table URLs are sent to a third party and QR generation depends on an external service for a core workflow.
Fix: Generate QR codes locally or server-side and store/cache them inside Gustia.

3. `prisma/schema.prisma`
Issue: Prisma models do not represent the current live product shape. The real operational model lives in Supabase tables and an SQL doc.
Impact: Schema ownership and migration discipline are split across Prisma and ad hoc SQL.
Fix: Choose one source of truth. Either retire Prisma from the product path or model the actual `owners`, `restaurants`, `conversations`, and `conversation_analytics` schema in a managed migration system.

4. `scripts/prod-launch-audit.mjs:115-118` and `e2e/example.spec.ts:3-25`
Issue: Production audit and Playwright checks still target old starter-app copy such as `ship from a working baseline` and `master-project`.
Impact: Automation gives false failures or false confidence.
Fix: Rewrite the browser checks around Gustia's real landing, dashboard, auth, and chat flows.

5. `.agent/ARCHITECTURE.md:1-220`
Issue: This document is stale, contains mojibake, and describes the older Antigravity kit rather than the current repo shape.
Impact: New contributors and agents receive inaccurate guidance.
Fix: Rewrite it to reflect the actual Gustia structure, current workflows, and current skill inventory.

6. `.agent/mcp_config.json:19-23`
Issue: The file contains JavaScript-style comments, so it is not valid JSON.
Impact: Any tooling that expects real JSON will fail.
Fix: Convert it to valid JSON or rename it to an example/template format that permits comments.

7. `lib/themes.ts:59`, `lib/themes.ts:136`, `app/admin/billing/page.tsx:122-125`
Issue: Customer-facing strings contain mojibake/encoding corruption.
Impact: Visible polish failure and potentially poor TTS pronunciation.
Fix: Normalize file encoding to UTF-8 and repair the affected strings.

8. `app/error.tsx`, `app/global-error.tsx`, route-level `loading.tsx`
Issue: These surfaces do not exist.
Impact: Production exceptions and async loading states fall back to generic behavior instead of Gustia-designed recovery UX.
Fix: Add app-wide error UI and loading/skeleton states for major async routes.

9. `lib/admin/google-maps-import.ts:223-367`
Issue: The server can follow and fetch arbitrary `websiteUri` values returned from Google Place details.
Impact: This is an SSRF-style trust-boundary concern, even if sourced indirectly from Google.
Fix: Restrict schemes/hosts, add URL allow/deny logic, and consider making external site scraping opt-in or manual.

10. `app/api/auth/[...nextauth]/route.ts`, `lib/auth.ts`, `lib/runtime-status.ts`, `app/dashboard/page.tsx`
Issue: NextAuth remains live as a legacy starter surface even though the real owner auth flow is Supabase-based.
Impact: Operational confusion, misleading health output, and extra attack surface.
Fix: Remove or isolate the legacy NextAuth path and make runtime health/dashboard reflect the actual Gustia auth model.

11. UI/UX audit coverage gap
Issue: Only the landing page and 404 page were manually checked at 375px and only the landing page received a Lighthouse snapshot.
Impact: Full responsive and accessibility coverage for admin/auth/chat routes is not evidenced yet.
Fix: Add mobile browser audits and accessibility checks for the core flows, especially `/auth/login`, `/admin/*`, and `/chat/[restaurantId]`.

12. Monitoring/ops evidence gap
Issue: The repo contains monitoring references, but active backups, heartbeats, or live OpenStatus/Upptime deployment are not evidenced from the repo alone.
Impact: Launch readiness is unclear at the operational layer.
Fix: Add a documented backup/restore runbook, heartbeat ownership, and live monitor verification evidence.

## Low Priority

1. `app/page.tsx:176-180`, `app/page.tsx:822-850`, `app/page.tsx:959`
Issue: The landing page still contains placeholder testimonials and `Socials coming soon`.
Impact: Trust and launch polish suffer.
Fix: Replace with real proof or remove the placeholder section until proof exists.

2. `components/admin/ConciergeTrainingEditor.tsx:589`
Issue: Google Maps photos use a raw `<img>` with an ESLint disable.
Impact: This is not a blocker, but it bypasses Next image handling and should be intentional/documented.
Fix: Keep it only if external dynamic image behavior requires it; otherwise move to `next/image`.

3. `next.config.js:51-61`
Issue: Remote image hosts are narrowly scoped and may not cover future owner-uploaded branding/logo flows.
Impact: New external assets could fail unexpectedly.
Fix: Either proxy external assets internally or explicitly document the supported host list.

## File-by-File Issues

### Runtime and Product Files With Findings

- `app/api/chat/route.ts:110-184`
  - Issue: Client-trusted restaurant context and analytics ID.
  - Fix: Fetch restaurant context server-side from `restaurantId` only.
- `app/api/auth/signup/route.ts:82-88`
  - Issue: Restaurant claim path runs before verified email/session is guaranteed.
  - Fix: Delay owner provisioning/claim until verified login or callback.
- `lib/admin/owner-account.ts:132-153`
  - Issue: Email-based restaurant claim is too permissive when invoked early.
  - Fix: Require verified identity and add audit logging.
- `lib/stripe/webhooks.ts:36-63`
  - Issue: Webhook events are acknowledged but not persisted.
  - Fix: Implement idempotent fulfillment and subscription state sync.
- `app/api/restaurants/[restaurantId]/route.ts:13-36`
  - Issue: Public service-role read leaks internal restaurant prompt data.
  - Fix: Return a public-safe view only and avoid service-role access here.
- `next.config.js:37-40`
  - Issue: Global `microphone=()` policy conflicts with guest voice UX.
  - Fix: Scope the policy or allow microphone where needed.
- `app/api/menu/parse/route.ts:57-102`
  - Issue: Uploaded OpenAI files are not deleted after parse.
  - Fix: Add cleanup in `finally`.
- `app/api/admin/onboarding/route.ts:26-48`
  - Issue: Weak validation for email/URL/phone/Google fields.
  - Fix: Strengthen the Zod schema.
- `components/admin/QrStudio.tsx:42-55`
  - Issue: Third-party QR service leaks destination URLs.
  - Fix: Generate QR codes internally.
- `prisma/schema.prisma`
  - Issue: Stale schema relative to the live Supabase-backed product.
  - Fix: Consolidate to one authoritative schema/migration system.
- `scripts/prod-launch-audit.mjs:115-118`
  - Issue: Browser audit script still checks legacy starter copy.
  - Fix: Rewrite for Gustia routes and UI.
- `e2e/example.spec.ts:3-25`
  - Issue: Playwright suite still targets the old starter app.
  - Fix: Replace with real Gustia journeys.
- `.agent/ARCHITECTURE.md:1-220`
  - Issue: Outdated, incorrect, and mojibake-heavy agent architecture doc.
  - Fix: Rewrite to match the repo.
- `.agent/mcp_config.json:19-23`
  - Issue: Invalid JSON due to comments.
  - Fix: Convert to valid JSON or rename as example/template.
- `lib/themes.ts:59`, `lib/themes.ts:136`
  - Issue: Encoding corruption in theme copy.
  - Fix: Repair strings and enforce UTF-8.
- `app/admin/billing/page.tsx:122-125`
  - Issue: Corrupted bullet characters in payment method display.
  - Fix: Replace mojibake with a normal masked-card glyph sequence.
- `lib/admin/google-maps-import.ts:223-367`
  - Issue: External website fetch trust boundary is too loose.
  - Fix: Restrict or remove server-side arbitrary website fetching.
- `app/api/auth/[...nextauth]/route.ts`
  - Issue: Legacy auth surface is still live.
  - Fix: Remove or isolate if not actively used.
- `lib/auth.ts:64-75`
  - Issue: Legacy NextAuth configuration remains active in core code.
  - Fix: Remove or quarantine it.
- `lib/runtime-status.ts:131-141`
  - Issue: Runtime status still reports NextAuth secret/auth checks.
  - Fix: Replace with Supabase-owner-auth health checks.
- `app/dashboard/page.tsx:14`
  - Issue: Dashboard still presents generic integration-state content rather than launch-critical Gustia ops signals.
  - Fix: Turn it into an operator dashboard or retire it.
- `app/page.tsx:176-180`, `app/page.tsx:822-850`, `app/page.tsx:959`
  - Issue: Placeholder testimonials/socials remain in production marketing copy.
  - Fix: Replace or remove them before launch.
- `components/admin/ConciergeTrainingEditor.tsx:589`
  - Issue: Raw `<img>` is used intentionally but should be reviewed for final policy/performance.
  - Fix: Keep only with explicit justification or migrate to `next/image`.

### Reviewed With No Material Finding During This Audit

The following first-party files were reviewed and did not surface a material launch-blocking or high-confidence enterprise finding beyond normal maintenance. Absence from the issues list means "reviewed, no material issue found" rather than "not looked at."

#### App Pages and Layouts

- `app/layout.tsx`
- `app/providers.tsx`
- `app/not-found.tsx`
- `app/contact/page.tsx`
- `app/privacy/page.tsx`
- `app/terms/page.tsx`
- `app/legal/layout.tsx`
- `app/legal/legal-shell.tsx`
- `app/admin/layout.tsx`
- `app/admin/page.tsx`
- `app/admin/login/page.tsx`
- `app/admin/dashboard/page.tsx`
- `app/admin/analytics/page.tsx`
- `app/admin/menu/page.tsx`
- `app/admin/onboarding/page.tsx`
- `app/admin/quiz/page.tsx`
- `app/admin/qr/page.tsx`
- `app/admin/changelog/page.tsx`
- `app/admin/billing/canceled/page.tsx`
- `app/admin/billing/success/page.tsx`
- `app/auth/login/page.tsx`
- `app/auth/checkout/page.tsx`
- `app/chat/[restaurantId]/page.tsx`
- `app/chat/[restaurantId]/onboarding/_layout.tsx`
- `app/chat/[restaurantId]/onboarding/language/page.tsx`
- `app/chat/[restaurantId]/onboarding/theme/page.tsx`

#### API Routes

- `app/api/admin/analytics/route.ts`
- `app/api/admin/billing/portal/route.ts`
- `app/api/admin/menu/route.ts`
- `app/api/admin/onboarding/import/route.ts`
- `app/api/admin/quiz/route.ts`
- `app/api/auth/login/route.ts`
- `app/api/auth/logout/route.ts`
- `app/api/changelog/route.ts`
- `app/api/health/route.ts`
- `app/api/onboarding/suggestions/route.ts`
- `app/api/stripe/checkout/route.ts`
- `app/api/stripe/webhook/route.ts`
- `app/api/tts/route.ts`
- `app/auth/callback/route.ts`

#### Components

- `components/admin/AdminAnalyticsDashboard.tsx`
- `components/admin/AdminAuthForm.tsx`
- `components/admin/AdminChrome.tsx`
- `components/admin/AdminPageShell.tsx`
- `components/admin/AdminSignOutButton.tsx`
- `components/admin/BillingCheckoutButton.tsx`
- `components/admin/BillingPortalButton.tsx`
- `components/admin/ChangelogFeed.tsx`
- `components/admin/EmptyRestaurantState.tsx`
- `components/admin/MenuEditor.tsx`
- `components/admin/MenuPhotoUpload.tsx`
- `components/admin/QuizEditor.tsx`
- `components/atoms/Button.tsx`
- `components/auth/CheckoutRedirectPanel.tsx`
- `components/auth/PricingAuthForm.tsx`
- `components/ErrorBoundary.tsx`
- `components/onboarding/ThemePreview.tsx`
- `components/ui/Card.tsx`
- `components/ui/Toast.tsx`

#### Libraries and Server Utilities

- `lib/actions/runtime-status.ts`
- `lib/actions/safe-action.ts`
- `lib/admin/auth-session.ts`
- `lib/admin/menu-import.ts`
- `lib/admin/server.ts`
- `lib/admin/types.ts`
- `lib/analytics.ts`
- `lib/api/zod-route.ts`
- `lib/billing/config.ts`
- `lib/billing/customer.ts`
- `lib/billing/plans.ts`
- `lib/billing/subscriptions.ts`
- `lib/changelog.ts`
- `lib/concierge/templates.ts`
- `lib/env.ts`
- `lib/hooks/useAsyncValidation.ts`
- `lib/hooks/useToast.ts`
- `lib/onboarding/document-discovery.ts`
- `lib/onboarding/heuristics.ts`
- `lib/onboarding/ingestion.ts`
- `lib/onboarding/insforge.ts`
- `lib/onboarding/service.ts`
- `lib/onboarding/types.ts`
- `lib/prisma.ts`
- `lib/server-env.ts`
- `lib/server-only.ts`
- `lib/stripe.ts`
- `lib/supabase/browser.ts`
- `lib/supabase/config.ts`
- `lib/supabase/middleware.ts`
- `lib/supabase/server.ts`
- `lib/utils.ts`
- `middleware.ts`

#### Docs, Runbooks, and Reference Files Reviewed

- `README.md`
- `docs/README.md`
- `docs/next-session-handoff.md`
- `docs/reference/PATCH_NOTES.md`
- `docs/progress-log.md`
- `docs/session-log.md`
- `docs/next-steps.md`
- `docs/reference/commands.md`
- `docs/runbooks/local-development.md`
- `docs/runbooks/release.md`
- `docs/runbooks/verification.md`
- `docs/reference/env-vars.md`
- `docs/architecture/system-map.md`
- `docs/DEPLOY_CHECKLIST.md`
- `docs/integration-reference.md`
- `docs/integrations/README.md`
- `docs/integrations/env-nextjs.md`
- `docs/integrations/next-safe-action.md`
- `docs/integrations/next-zod-route.md`
- `docs/integrations/onboarding-ingestion.md`
- `docs/integrations/openstatus.md`
- `docs/integrations/stripe.md`
- `docs/integrations/supabase-ssr.md`
- `docs/integrations/upptime.md`
- `docs/archive/README.md`
- `docs/FEATURE_ASSESSMENT.md`
- `docs/OPS_ARCHITECTURE.md`
- `docs/PRICING_DECISION.md`
- `docs/SPEC.md`
- `docs/UI_DESIGN.md`
- `docs/UX_FLOW.md`
- `docs/V1_LIVE_INTERACTION.md`
- `docs/templates/CHANGELOG.md`
- `docs/templates/CONTRIBUTING.md`
- `docs/templates/DEPLOYMENT.md`
- `docs/templates/DOCUMENTATION_STATUS.md`
- `docs/templates/FEATURES.md`
- `docs/reference/supabase-owner-auth-migration.sql`

#### Workflows, Skills, Tests, and Configs Reviewed

- `.agent/workflows/audit.md`
- `.agent/workflows/brainstorm.md`
- `.agent/workflows/deploy.md`
- `.agent/workflows/whole_app_audit.md`
- `.agent/workflows/create.md`
- `.agent/workflows/debug.md`
- `.agent/workflows/enhance.md`
- `.agent/workflows/layout_audit.md`
- `.agent/workflows/MCP_audits.md`
- `.agent/workflows/orchestrate.md`
- `.agent/workflows/plan.md`
- `.agent/workflows/preview.md`
- `.agent/workflows/prompt-plan.md`
- `.agent/workflows/status.md`
- `.agent/workflows/test.md`
- `.agent/workflows/ui-ux-pro-max.md`
- `.agent/workflows/client_outreach.md`
- `.agent/workflows/pitch_client.md`
- `.agent/skills/onboarding/SKILL.md`
- `__tests__/actions/safe-actions.test.ts`
- `__tests__/api/health.test.ts`
- `__tests__/api/onboarding-suggestions.test.ts`
- `__tests__/api/stripe-webhook.test.ts`
- `__tests__/billing/stripe-webhooks.test.ts`
- `__tests__/monitoring/ops-config.test.ts`
- `__tests__/onboarding/document-discovery.test.ts`
- `__tests__/onboarding/ingestion.test.ts`
- `__tests__/onboarding/insforge.test.ts`
- `__tests__/runtime/env.test.ts`
- `__tests__/runtime/runtime-status.test.ts`
- `__tests__/supabase/ssr.test.ts`
- `playwright.config.ts`
- `vitest.config.ts`
- `.eslintrc.json`
- `next.config.js`
- `tailwind.config.ts`
- `postcss.config.js`
- `tsconfig.json`
- `tsconfig.typecheck.json`
- `package.json`
- `package-lock.json`
- `vercel.json`
- `ops/openstatus/monitors.json`
- `.env.example`

## Security Issues

- `app/api/chat/route.ts:110-184` breaks a core trust boundary by accepting restaurant prompt context from the client.
- `app/api/restaurants/[restaurantId]/route.ts:13-36` uses service-role access on a public route and leaks internal prompt-related fields.
- `app/api/auth/signup/route.ts:82-88` plus `lib/admin/owner-account.ts:132-153` permit pre-verification restaurant claim behavior.
- Expensive and sensitive routes lack rate limiting.
- Auth, admin, and billing POST routes do not show explicit CSRF/origin protection.
- `lib/admin/google-maps-import.ts:223-367` needs tighter outbound URL controls.
- Good news: no hardcoded production secrets were surfaced in tracked code, no `dangerouslySetInnerHTML` usage was found, and `npm audit` returned zero high-severity dependency findings.

## API Issues

- API design is mostly RPC-style rather than REST-pure. That is acceptable for an internal app, but docs should describe it honestly instead of implying classic REST everywhere.
- Error bodies are mostly consistent (`{ error: string }`), but status semantics are inconsistent. Example: `app/api/restaurants/[restaurantId]/route.ts:37-46` returns `400` for what can be server-side failures.
- CORS is not explicitly configured. Today that is acceptable because the app appears designed for same-origin use, but it should be documented.
- Rate limiting is absent on chat, TTS, auth, and menu parse.

## Database Issues

- `docs/reference/supabase-owner-auth-migration.sql:47-70` does add useful indexes and `:79-168` adds RLS policies for core tables, which is a strong sign.
- The main gap is ownership and drift: the live operational model is not represented in `prisma/schema.prisma`.
- Backup configuration and restore verification are not evidenced from the repo.
- Public route access currently bypasses RLS via service role for restaurant profile reads.

## Performance Issues

- Current build output is reasonable for an early product, but some first-load bundles are still notable: `/` first-load JS around 158 kB, `/chat/[restaurantId]/onboarding/theme` around 167 kB, `/admin/menu` around 145 kB.
- No obvious N+1 pattern was found in the reviewed server code, but there is no production telemetry evidence in the repo for slow query monitoring.
- `components/admin/ConciergeTrainingEditor.tsx:589` uses raw `<img>` for remote photos.
- QR generation depends on a third-party service and adds external latency/failure risk.

## UI/UX Issues

- The home page and 404 page look good at 375px, but the whole app was not fully proven on mobile.
- Many controls are visibly large enough, but there is no automated touch-target audit across admin/auth/chat flows.
- Loading skeleton coverage is thin because route-level `loading.tsx` files are absent.
- Error recovery UX is incomplete because `app/error.tsx` and `app/global-error.tsx` are absent.
- Placeholder testimonials and `Socials coming soon` should not ship on a launch-grade marketing site.

## Documentation Gaps

- `.agent/ARCHITECTURE.md` is not trustworthy in its current form.
- The production audit script and E2E spec are stale, which weakens the accuracy of verification docs.
- Backup/restore ownership and live monitor ownership are not clearly evidenced.
- The repo contains strong docs coverage overall; the main issue is drift, not total absence.

## Testing Gaps

- The repo does have tests, and they pass.
- The current E2E suite is stale and does not validate real Gustia user journeys.
- The current Stripe webhook tests confirm the stubbed helper contract, not real billing persistence.
- Missing high-value flow coverage:
  - owner signup with email verification
  - owner login to dashboard
  - checkout success/cancel flow
  - webhook-driven billing state transitions
  - guest onboarding and guest chat
  - menu parsing happy path and failure path cleanup
  - onboarding import flow

## Workflow and Automation Gaps

- `.agent/workflows/deploy.md` and `.agent/workflows/whole_app_audit.md` are useful, but the repo’s practical verification automation is stale because the scripts/specs still target the starter app.
- `.agent/mcp_config.json` is invalid JSON.
- No repo evidence confirms cron jobs, heartbeats, or active monitor deployment.

## Skills Available (Checked During Audit)

- Repo-local workflows are present and discoverable under `.agent/workflows/`.
- Repo-local skills are present under `.agent/skills/`, including `.agent/skills/onboarding/SKILL.md`.
- The audit used the `flowforge` workflow style plus brainstorming/audit discipline.
- I did not exhaustively validate every generic skill artifact under `.agent/skills/**`; the enterprise audit focus stayed on Gustia runtime, docs, workflows, and operational correctness.

## Suggestions for Enterprise Scale

- Move all public restaurant reads behind a hardened public profile layer with a minimal projection and signed or RLS-safe access.
- Replace email-based ownership claiming with explicit invitation, domain verification, or admin approval logic.
- Add a proper billing ledger table and webhook event idempotency table.
- Introduce centralized API protection: rate limiting, origin checks, audit logs, and structured error telemetry.
- Consolidate database truth into one migration story.
- Replace placeholder browser automation with launch-journey verification.
- Add route-level loading and error surfaces before inviting real restaurant owners into the product.

## Fix Plan (Ordered by Priority and Estimate)

1. Harden trust boundaries and auth ownership flow.
Estimate: 1 to 2 days.
Work: fix `app/api/chat/route.ts`, lock down `app/api/restaurants/[restaurantId]/route.ts`, move restaurant claiming out of pre-verification signup, add audit logs.

2. Finish Stripe billing fulfillment.
Estimate: 1 to 2 days.
Work: implement webhook persistence, update restaurant billing fields, add idempotency, and replace stub-only tests with real state-transition tests.

3. Add API abuse protection and request hardening.
Estimate: 0.5 to 1 day.
Work: rate limiting, origin/CSRF protections, payload caps, cleanup for uploaded OpenAI files.

4. Repair UX polish and reliability gaps.
Estimate: 0.5 to 1 day.
Work: restore microphone support where intended, add `app/error.tsx`, `app/global-error.tsx`, loading states, and fix encoding issues.

5. Remove repo drift and make automation trustworthy.
Estimate: 1 day.
Work: refresh `.agent/ARCHITECTURE.md`, fix `.agent/mcp_config.json`, rewrite `scripts/prod-launch-audit.mjs`, replace stale Playwright spec, clean the marketing placeholders.

6. Consolidate data-model ownership.
Estimate: 1 to 2 days.
Work: decide whether Prisma stays, then align migrations/schema/docs accordingly and document backups/restore ownership.

7. Re-verify after fixes.
Estimate: 0.5 day.
Work:
  - `npm run lint`
  - `npm run type-check`
  - `npm run test -- --run`
  - `npm run build`
  - real browser checks for auth, billing, guest onboarding, and guest chat

## Automation Opportunities

- Add real Playwright coverage for guest and owner journeys.
- Add rate-limit instrumentation and rejection metrics.
- Add webhook replay protection and event audit tables.
- Add a post-deploy smoke suite that checks real Gustia UI text and business flows instead of starter-app copy.
- Add a mobile accessibility audit step for `/auth/login`, `/admin/*`, and `/chat/[restaurantId]`.

## Verification Checklist

- [x] Repository inventory captured
- [x] `npm run lint` passed
- [x] `npm run type-check` passed
- [x] `npm run test -- --run` passed
- [x] `npm audit --audit-level=high` passed
- [x] `npm run build` passed
- [x] `/`, `/dashboard`, `/api/health`, onboarding fallback, and 404 smoke checks passed locally
- [ ] All critical issues fixed
- [ ] Security audit passed for launch
- [ ] Performance acceptable for launch
- [ ] Documentation complete and current
- [ ] End-to-end launch journeys covered by tests

## Bottom Line

Gustia is promising and more mature than a raw boilerplate, but it is not ready for enterprise launch yet. The project has a solid baseline and decent docs, yet it still needs a hardening sprint focused on trust boundaries, billing truth, API abuse protection, and workflow drift. If the Critical and High Priority items are addressed first, the product can move from "interesting demo with good bones" to "credible launch candidate" quickly.
