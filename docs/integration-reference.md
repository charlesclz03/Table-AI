# Integration Reference

This starter now incorporates all 11 researched GitHub candidates through one of three modes:

| Candidate                                | Mode               | How it is used                                                                                                     |
| ---------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `t3-oss/t3-env`                          | Direct dependency  | Typed env parsing and optional integration gating in `lib/env.ts` and `lib/server-env.ts`.                         |
| `next-safe-action/next-safe-action`      | Direct dependency  | Shared safe-action client and starter action conventions in `lib/actions/`.                                        |
| `Melvynx/next-zod-route`                 | Direct dependency  | Shared route handler conventions for JSON APIs in `lib/api/zod-route.ts`.                                          |
| `jonschlinkert/gray-matter`              | Direct dependency  | Frontmatter parsing for onboarding ingestion in `lib/onboarding/ingestion.ts`.                                     |
| `remarkjs/remark-frontmatter`            | Direct dependency  | Markdown AST parsing for headings/frontmatter-aware onboarding ingestion.                                          |
| `sammcj/ingest`                          | Local pattern port | Inspired the normalized document chunking and metadata pipeline in `lib/onboarding/ingestion.ts`.                  |
| `supabase/ssr`                           | Direct dependency  | Optional browser/server/middleware helpers in `lib/supabase/`.                                                     |
| `KolbySisk/next-supabase-stripe-starter` | Local pattern port | Billing config and service boundaries in `lib/billing/`.                                                           |
| `vercel/nextjs-subscription-payments`    | Local pattern port | Stripe webhook verification/testing conventions in `lib/stripe/webhooks.ts` and `app/api/stripe/webhook/route.ts`. |
| `upptime/upptime`                        | Companion scaffold | Setup templates under `ops/upptime/` that point to the starter health surfaces.                                    |
| `openstatusHQ/openstatus`                | Companion scaffold | Setup templates under `ops/openstatus/` that consume the same health/readiness endpoint.                           |

## Provenance Matrix

| Behavior                                               | Source candidates                   |
| ------------------------------------------------------ | ----------------------------------- |
| Typed server/public env access                         | `t3-env`                            |
| Safe server action conventions                         | `next-safe-action`                  |
| Route input validation                                 | `next-zod-route`                    |
| Frontmatter-aware onboarding                           | `gray-matter`, `remark-frontmatter` |
| Ingest-style chunking and source preservation          | `sammcj/ingest`                     |
| Optional Supabase SSR helpers                          | `supabase/ssr`                      |
| Billing plan and customer/service layering             | `next-supabase-stripe-starter`      |
| Stripe webhook verification and local testing guidance | `nextjs-subscription-payments`      |
| External status monitoring scaffolds                   | `upptime`, `openstatus`             |
