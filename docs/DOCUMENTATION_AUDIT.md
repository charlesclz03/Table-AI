# Gustia Documentation Audit
Date: 2026-04-05

## Summary

Overall health is now strong.

- The original documentation drift was remediated in the same session.
- The requested missing docs now exist: `docs/API.md`, `docs/ARCHITECTURE.md`, `docs/ONBOARDING.md`, `docs/PRICING.md`, `docs/DEPLOY.md`, and `docs/CHANGELOG.md`.
- The main stale product docs were rewritten to match the live Supabase-first auth, invite claiming, Stripe billing flow, owner admin surface, and four-theme guest onboarding.
- Older root planning notes were converted into archive notes so they no longer present retired pricing or legacy-auth assumptions as current truth.
- The main remaining gap is external configuration, not code/documentation drift: Google OAuth still needs valid credentials enabled in Supabase Auth.

Scope note:

- This audit reflects the post-remediation state of the first-party project docs.
- Historical logs and release notes intentionally preserve older states and are not counted as active documentation drift.

## Documentation Inventory

### Core Docs

| Doc | Status | What it claims |
| --- | --- | --- |
| `README.md` | Current | Product overview, live routes, pricing flow, admin surfaces, known gaps, and release discipline. |
| `SPEC.md` | Current | High-level Gustia product spec aligned to the live offer and runtime model. |
| `docs/ARCHITECTURE.md` | Current | Runtime architecture, trust boundaries, auth model, billing flow, and analytics flow. |
| `docs/API.md` | Current | Live HTTP route reference for guest, auth, admin, and billing APIs. |

### Feature Docs

| Doc | Status | What it claims |
| --- | --- | --- |
| `docs/ONBOARDING.md` | Current | Guest onboarding plus owner setup and training flow. |
| `docs/PRICING.md` | Current | Live commercial offer, checkout flow, and owner billing surface. |
| `docs/DEPLOY.md` | Current | Short deploy pointer that routes release work to the canonical runbooks. |
| `docs/CHANGELOG.md` | Current | Canonical pointer for release history sources. |

### Current Product and Ops Docs Reviewed

| Doc | Status | What it claims |
| --- | --- | --- |
| `docs/README.md` | Current | Canonical docs hub and read order. |
| `docs/next-session-handoff.md` | Current | Immediate product truth, live blockers, production notes, and next work. |
| `docs/SPEC.md` | Current | Supabase-auth admin model, pricing auth flow, owner and admin routes, and restaurant record fields. |
| `docs/architecture/system-map.md` | Generic support doc | Starter-level runtime map; useful as a support artifact but not the main Gustia runtime spec. |
| `docs/OPS_ARCHITECTURE.md` | Support doc | Agentic operations concept, not the app runtime architecture. |
| `docs/UX_FLOW.md` | Current | QR -> language -> theme -> chat flow, owner flow, and session persistence. |
| `docs/UI_DESIGN.md` | Current | Wine sphere visual language, animation behavior, and active theme design language. |
| `docs/V1_LIVE_INTERACTION.md` | Current | What is live now versus what is still future work. |
| `docs/FEATURE_ASSESSMENT.md` | Conceptual support doc | Product-thinking artifact, not the canonical runtime truth. |
| `SUPABASE_SCHEMA.md` | Current | Canonical Supabase owner-auth schema and migration path. |
| `SUPABASE_SETUP.md` | Current | Current Supabase setup guide and auth redirect requirements. |
| `STRIPE_INTEGRATION.md` | Current | Current Stripe route design, env names, and billing persistence model. |
| `PRICING_DECISION.md` | Current | EUR 99 activation, EUR 49 monthly, EUR 470 yearly, 14-day retraction rights. |
| `PROJECT_STATUS.md` | Current | High-level status snapshot aligned to the live app. |
| `docs/reference/PATCH_NOTES.md` | Current | Release history of shipped changes. |
| `docs/progress-log.md` | Current | Product progress history. |
| `docs/session-log.md` | Current | Session-by-session log. |
| `docs/reference/commands.md` | Current | Current commands and release doc-sync contract. |
| `docs/reference/env-vars.md` | Current | Current env groups, including a clear distinction between live Supabase auth and legacy NextAuth envs. |
| `docs/runbooks/local-development.md` | Mostly current | Local setup, auth notes, and import notes. |
| `docs/runbooks/release.md` | Current | Release flow and Supabase owner-auth gate. |
| `docs/runbooks/verification.md` | Current | Verification commands and doc review gate. |
| `docs/DEPLOY_CHECKLIST.md` | Current | Deployment checklist and doc sync expectations. |
| `docs/ENTERPRISE_AUDIT.md` | Audit artifact | Prior audit findings; should be read as point-in-time review material, not canonical runtime truth. |

### Marketing Docs

| Surface | What it claims now |
| --- | --- |
| Landing page `/` | Four-step owner setup, premium AI concierge, monthly and annual plans, 14-day guarantee, guest journey preview, and legal/contact links. |
| Pricing surfaces `/`, `/auth/login`, `/auth/checkout` | EUR 99 activation, EUR 49 monthly or EUR 470 annual, authenticated Stripe handoff. |
| Admin marketing copy | Owners can manage menu, onboarding and training, QR, billing, analytics, invites, and changelog. |

## Code Inventory

### Pages

| Route | Status | What it does |
| --- | --- | --- |
| `/` | Implemented | Marketing landing page with owner setup, guest journey preview, pricing, FAQ, and legal/contact CTAs. |
| `/auth/login` | Implemented | Pricing-gated login/signup page before checkout. |
| `/auth/signup` | Missing | No standalone page. Signup is handled inside `/auth/login` and `/admin/login`. |
| `/auth/checkout` | Implemented | Authenticated Stripe handoff screen. |
| `/admin` | Implemented | Owner dashboard home. |
| `/admin/dashboard` | Implemented as alias | Redirects to `/admin`. |
| `/admin/login` | Implemented | Owner auth screen with email/password and Google. |
| `/admin/menu` | Implemented | Menu editor. |
| `/admin/billing` | Implemented | Billing overview, CTA, invoices, and portal access. |
| `/admin/onboarding` | Implemented | Google Maps import plus concierge training editor. |
| `/admin/analytics` | Implemented | Owner analytics dashboard. |
| `/admin/quiz` | Implemented | Seven-question owner quiz editor. |
| `/admin/qr` | Implemented | QR poster studio with download, print, and share. |
| `/admin/invite` | Implemented | Owner invite management. |
| `/admin/changelog` | Implemented | Owner-facing release feed. |
| `/chat/demo` | Implemented via dynamic route | `/chat/demo` is handled by `/chat/[restaurantId]` with demo fallback when `restaurantId === "demo"`. |
| `/chat/[restaurantId]` | Implemented | Guest chat UI with voice/text, subtitles, demo fallback, and CTA after three guest messages. |
| `/chat/[restaurantId]/onboarding/language` | Implemented | Language selector. |
| `/chat/[restaurantId]/onboarding/theme` | Implemented | Orbital theme selector with preview audio and text fallback. |
| `/invite/[code]` | Implemented | Invite claim flow for co-owners. |

### API Routes

| Route | Status | What it does |
| --- | --- | --- |
| `/api/chat` | Implemented | Server-side GPT-4o-mini chat using restaurant context fetched from Supabase. Persists conversation snapshots plus analytics metadata. |
| `/api/tts` | Implemented | OpenAI TTS with optional voice selection. |
| `/api/stripe/checkout` | Implemented | Authenticated activation-plus-subscription Stripe Checkout. |
| `/api/stripe/webhook` | Implemented | Idempotent Stripe webhook processing with ledger and event persistence. |
| `/api/auth/login` | Implemented | Supabase email/password or Google sign-in. |
| `/api/auth/signup` | Implemented | Supabase email/password or Google sign-up. |
| `/api/auth/logout` | Implemented | Supabase sign-out. |
| `/api/auth/[...nextauth]` | Implemented | Legacy NextAuth catch-all still present. |
| `/api/admin/menu` | Implemented | Save menu items for the owner restaurant. |
| `/api/menu/parse` | Implemented | Parse uploaded menu images and PDFs with OpenAI. |
| `/api/admin/onboarding` | Implemented | Save concierge training, markdown, and menu data. |
| `/api/admin/onboarding/import` | Implemented | Import Google Maps restaurant data. |
| `/api/admin/quiz` | Implemented | Save quiz answers. |
| `/api/admin/analytics` | Implemented | Return owner analytics payload. |
| `/api/admin/billing/portal` | Implemented | Create Stripe billing portal session. |
| `/api/changelog` | Implemented | Return owner changelog entries. |
| `/api/health` | Implemented | Return runtime integration status. |
| `/api/onboarding/suggestions` | Implemented | Internal onboarding suggestion generation. |
| `/api/restaurants/[restaurantId]` | Implemented | Public-safe restaurant profile fetch via `restaurant_public_profiles`. |

### Components

| Surface | Status | Where it lives |
| --- | --- | --- |
| WineSphere | Implemented | `app/chat/[restaurantId]/onboarding/_layout.tsx` |
| Onboarding flow shell | Implemented | `app/chat/[restaurantId]/onboarding/_layout.tsx` |
| Theme selector | Implemented | `app/chat/[restaurantId]/onboarding/theme/page.tsx` and `components/onboarding/ThemePreview.tsx` |
| Chat interface | Implemented | `app/chat/[restaurantId]/page.tsx` |
| Menu editor | Implemented | `components/admin/MenuEditor.tsx` |
| Menu photo upload | Implemented | `components/admin/MenuPhotoUpload.tsx` |
| QR studio | Implemented | `components/admin/QrStudio.tsx` |
| Quiz editor | Implemented | `components/admin/QuizEditor.tsx` |
| Analytics dashboard | Implemented | `components/admin/AdminAnalyticsDashboard.tsx` |

### Database Tables

Current Supabase product tables and view:

- `public.owners`
- `public.restaurants`
- `public.conversations`
- `public.conversation_analytics`
- `public.restaurant_owner_invites`
- `public.audit_logs`
- `public.stripe_webhook_events`
- `public.billing_ledger`
- `public.restaurant_public_profiles` view
- `auth.users`

Legacy Prisma starter tables still present in the repo:

- `Account`
- `Session`
- `User`
- `VerificationToken`
- `UserPreferences`
- `Subscription`

## Comparison Matrix

| Doc says | Code does | Match? |
| --- | --- | --- |
| `README.md`: pricing auth flow goes through `/auth/login` and `/auth/checkout` | `app/auth/login/page.tsx` and `app/auth/checkout/page.tsx` implement this | Yes |
| `README.md`: owner admin exists under `/admin` | `app/admin/*` routes implement dashboard, menu, onboarding, analytics, quiz, QR, billing, invite, and changelog | Yes |
| `docs/API.md`: `/api/restaurants/[restaurantId]` returns the guest-safe bootstrap payload | `app/api/restaurants/[restaurantId]/route.ts` does this | Yes |
| `docs/ARCHITECTURE.md`: owner auth is Supabase-first and NextAuth is legacy | Middleware, auth routes, and admin guards use Supabase; legacy NextAuth route remains in repo | Yes |
| `docs/ONBOARDING.md`: guest onboarding exposes four active themes | Selector exposes four guest themes | Yes |
| `docs/PRICING.md`: live offer is EUR 99 activation plus monthly or annual billing | Landing and billing code use EUR 99 + EUR 49/month or EUR 470/year | Yes |
| `SUPABASE_SCHEMA.md`: documented table list includes invites, audit logs, webhook events, billing ledger, and public profile view | Migration and code use all of these | Yes |
| `STRIPE_INTEGRATION.md`: billing portal route is `/api/admin/billing/portal` | Route exists at that path | Yes |
| Audit brief: `/chat/demo` page exists as dedicated page | Demo works through the dynamic chat route instead of its own file | Partial |
| Audit brief: `/auth/signup` page exists | No standalone page exists | No |
| Audit brief: `/api/menu` exists | No root route exists; menu APIs are split into admin save and parse | No |

## Perfect Matches

- `README.md` matches the landing page, pricing auth flow, owner admin, onboarding and training, menu editor, analytics, invite flow, changelog feed, and legal/contact pages.
- `docs/SPEC.md` matches the current admin surface, owner auth direction, invite claim flow, and restaurant record shape.
- `docs/API.md`, `docs/ARCHITECTURE.md`, `docs/ONBOARDING.md`, `docs/PRICING.md`, `docs/DEPLOY.md`, and `docs/CHANGELOG.md` now cover the major documentation gaps identified in the initial audit.
- `SUPABASE_SCHEMA.md`, `SUPABASE_SETUP.md`, and `STRIPE_INTEGRATION.md` now match the current auth, data, and billing model.
- `docs/UX_FLOW.md`, `docs/UI_DESIGN.md`, and `docs/V1_LIVE_INTERACTION.md` now match the shipped guest and owner experience.
- The known live Google OAuth blocker is accurately documented as a configuration issue rather than a missing code path.

## Discrepancies

### Documentation Says, Code Does Not

| Documentation claim | Code reality | Match? |
| --- | --- | --- |
| Active product docs say Google OAuth is available when configured | Live production still blocks Google OAuth until Supabase provider credentials are set | Partial |
| `docs/architecture/system-map.md` can look like a runtime architecture source | The real Gustia runtime truth now lives in `docs/ARCHITECTURE.md` | Partial |

### Code Has, Documentation Does Not

No major active documentation gaps remain after the remediation pass.

Optional future expansion:

- `/dashboard` runtime status page
- deeper operator notes for `/api/health`

### Feature Works Differently Than Documented

| Doc says | Code does |
| --- | --- |
| The audit brief treats `/chat/demo` as a dedicated page | The app serves `/chat/demo` through the dynamic `[restaurantId]` route |
| The audit brief expects `/auth/signup` as a standalone page | Signup is a mode inside `/auth/login` and `/admin/login` |
| The audit brief expects a root `/api/menu` route | The app splits menu save and parsing across `/api/admin/menu` and `/api/menu/parse` |

## Missing Pieces

### Features Documented But Not Built

| Feature | Priority | Effort |
| --- | --- | --- |
| Live Google OAuth enablement in Supabase Auth | High | External config |
| Standalone `/auth/signup` page | Low | Low |
| Dedicated `/api/menu` root route | Low | Low |
| Dedicated `/api/stripe` root route | Low | Low |
| Dedicated `/api/auth` root route | Low | Low |

### Features Built But Not Documented

None critical after the remediation pass.

### APIs Exist But Are Not Documented

None critical after the remediation pass.

## Missing Documentation

None critical after the remediation pass.

Optional follow-up:

- add a short note inside `docs/architecture/system-map.md` that it is a generic starter support artifact, not the canonical Gustia runtime map
- expand `/dashboard` and `/api/health` documentation if those surfaces become part of normal operator workflows

## Action Items

1. Enable Google OAuth in Supabase Auth with valid client credentials, then re-verify the live owner login flow.
2. Keep `docs/ARCHITECTURE.md`, `docs/API.md`, `docs/ONBOARDING.md`, `docs/PRICING.md`, and `SUPABASE_SCHEMA.md` synchronized whenever product routes or data contracts change.
3. Decide whether the legacy NextAuth route should remain as starter scaffolding or be removed in a future cleanup.
4. Decide later whether Champagne should return to the active guest theme selector.

## Plain-Language Handback For Bidi -> Ember

I audited the first-party project docs against the real app, then fixed the documentation drift in the same session.

What changed:

- I added the missing current docs for API, architecture, onboarding, pricing, deploy guidance, and changelog references.
- I rewrote the stale setup and status docs so they now match the live Supabase auth, invite claiming, Stripe billing flow, owner admin features, and four-theme guest onboarding.
- I converted the misleading older root planning notes into archive stubs so future sessions stop picking up retired pricing and legacy-auth assumptions.

What is still not fully fixed:

- Google OAuth still needs valid credentials enabled in Supabase Auth. That is now the main remaining blocker, and it is a configuration issue rather than a documentation mismatch.
