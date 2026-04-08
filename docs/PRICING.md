# Gustia Pricing

Purpose:

- document the live commercial offer and the corresponding app flow

Audience:

- maintainers
- coding agents

Status:

- active

Source of truth scope:

- current pricing, checkout flow, and owner-facing billing language

Last updated:

- 2026-04-05

Related docs:

- `PRICING_DECISION.md`
- `docs/integrations/stripe.md`
- `docs/API.md`

## Live Offer

- activation: EUR 99
- monthly: EUR 49 per month
- annual: EUR 470 per year
- guarantee: 14-day retraction rights

## App Flow

1. owner lands on `/`
2. owner chooses monthly or annual
3. owner signs in or signs up on `/auth/login?plan=...`
4. owner continues through `/auth/checkout?plan=...`
5. Stripe Checkout opens from `/api/stripe/checkout?plan=...`
6. owner returns to the admin billing/dashboard flow after payment

## Billing Behavior

- the activation amount is charged immediately
- the subscription starts after the activation delay window
- monthly and annual paths are both supported
- Stripe stores the customer against the owner restaurant record
- webhook events update:
  - `stripe_customer_id`
  - `stripe_subscription_id`
  - `subscription_status`
  - `plan_name`
  - `setup_paid_at`
  - `billing_starts_at`

## Owner Billing Surface

`/admin/billing` shows:

- current plan
- subscription status
- setup date
- next billing date
- payment method preview when available
- invoice history
- Stripe billing portal entry

