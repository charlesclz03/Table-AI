# Pricing Decision

Purpose:

- capture the current public pricing structure and the required auth-before-checkout flow

Audience:

- maintainers
- coding agents

Status:

- active

Source of truth scope:

- public landing pricing
- owner auth handoff into Stripe Checkout

Last updated:

- 2026-04-08

## Current Pricing

- activation fee: `EUR 99` charged when the restaurant starts setup
- monthly plan: `EUR 49 / month`
- annual plan: `EUR 470 / year`
- annual savings: `EUR 118`
- guarantee: `14-day guarantee`

## Checkout Flow Decision

1. restaurant owner selects `Monthly` or `Annual` on the landing page
2. owner signs in or creates an account before any Stripe payment step
3. Google OAuth is the primary auth path, with email/password as the fallback
4. after auth, Gustia creates a Stripe Checkout session for the selected plan
5. Stripe is pre-filled with the authenticated owner email
6. successful checkout returns the owner to `/admin/dashboard`

## Billing Shape

- activation is charged today
- the selected subscription starts after the `30-day` activation period
- the Stripe Checkout session carries the selected plan in metadata for future billing reconciliation

## Free Tier Usage Cap

- guest chat usage is capped at `50` queries per restaurant per calendar month
- usage is tracked in the Supabase `usage_logs` table
- once a restaurant reaches `80%` of the cap, `/api/chat` returns an `X-Gustia-Usage-Warning` header plus a warning payload in the JSON response
- once a restaurant has used the full monthly allocation, `/api/chat` returns `429` with `blocked: true` and `upgradeUrl: '/admin/billing'`
- authenticated admin sessions for the same restaurant, plus configured superadmins, bypass the cap so internal testing does not consume the free allocation
