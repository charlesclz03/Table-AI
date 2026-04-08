# Stripe Integration

## Overview

Gustia uses Stripe Checkout (subscription mode) to handle payments. The integration
lives in `lib/stripe.ts`, `lib/billing/subscriptions.ts`, `lib/billing/checkout-session.ts`,
and the API routes under `app/api/stripe/`.

## Environment Variables

```env
STRIPE_SECRET_KEY=sk_live_...                  # Server-side only
STRIPE_WEBHOOK_SECRET=whsec_...                # Server-side only
STRIPE_PRICE_ID_MONTHLY=price_...              # Optional legacy monthly price id
STRIPE_PRICE_ID_YEARLY=price_...               # Optional legacy yearly price id
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## Checkout Flow

1. Owner selects Monthly (EUR 49/mo) or Annual (EUR 470/yr) on `/admin/billing`
2. `BillingCheckoutButton` POSTs to `/api/stripe/subscribe?plan=monthly|annual`
3. The route creates a Stripe Checkout Session with:
   - a EUR 99 activation fee charged immediately
   - a monthly or annual recurring subscription line item
   - a 30-day trial so recurring billing starts after activation
4. Owner is redirected to Stripe; on success returns to
   `/admin/dashboard?checkout=success&plan={plan}&session_id={id}`
5. Stripe sends a `checkout.session.completed` webhook to
   `lib/billing/subscriptions.ts`, which updates the `restaurants` table and
   appends a `billing_ledger` entry

`/api/stripe/checkout` remains available as a compatibility alias for older callers.

## Webhook Events Handled

| Stripe Event | Handler |
|---|---|
| `checkout.session.completed` | `persistCheckoutSessionBilling` |
| `customer.subscription.created/updated/deleted` | `persistSubscriptionBilling` |
| `invoice.payment_succeeded` | `persistInvoiceBilling` |
| `invoice.payment_failed` | `persistInvoiceBilling` |

All handlers run in `lib/billing/subscriptions.ts` and are called from
`lib/stripe/webhooks.ts`.

## Database Tables

### `public.subscriptions` (migration: `0025_stripe_subscriptions`)

Tracks Stripe subscription state per restaurant:

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `restaurant_id` | uuid FK | -> `restaurants.id` |
| `user_id` | uuid FK | -> `owners.id` |
| `stripe_customer_id` | text | Stripe customer ID |
| `stripe_subscription_id` | text unique | Stripe subscription ID |
| `plan` | text | `'monthly'` \| `'annual'` \| `'free'` |
| `status` | text | `'active'` \| `'past_due'` \| `'cancelled'` \| `'trialing'` \| `'incomplete'` |
| `current_period_start` | timestamptz | |
| `current_period_end` | timestamptz | |
| `cancel_at_period_end` | boolean | |
| `created_at` / `updated_at` | timestamptz | |

RLS: owners select/update own rows; service_role has full access.

### `public.billing_ledger`

Immutable event log for all billing activity (created in earlier migration).
Do NOT recreate in `0025_stripe_subscriptions`.

### `public.stripe_webhook_events`

Deduplicates incoming Stripe webhooks by event ID. Handlers check this table
via `beginBillingWebhookEvent` / `finalizeBillingWebhookEvent` before processing.

## Plans

| Plan | Amount |
|---|---|
| Monthly | EUR 49/mo |
| Annual | EUR 470/yr |
