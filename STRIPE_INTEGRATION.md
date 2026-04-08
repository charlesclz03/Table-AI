# Gustia Stripe Integration Guide

Last updated: 2026-04-05

## Overview

Stripe handles:

- EUR 99 activation billing
- EUR 49 monthly subscriptions
- EUR 470 annual subscriptions
- billing portal access
- webhook-based billing-state persistence

## Live App Routes

- pricing entry: `/`
- auth gate: `/auth/login?plan=monthly|annual`
- checkout handoff: `/auth/checkout?plan=monthly|annual`
- checkout API: `/api/stripe/checkout?plan=monthly|annual`
- webhook API: `/api/stripe/webhook`
- billing portal API: `/api/admin/billing/portal`
- owner billing page: `/admin/billing`

## Required Environment Variables

```env
STRIPE_SECRET_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_PRICE_ID_MONTHLY=...
STRIPE_PRICE_ID_YEARLY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Billing Model

- activation is charged immediately
- subscription billing starts after the activation delay window
- both monthly and annual plans are supported
- the checkout session is tied to the authenticated owner restaurant

## Persistence

Stripe webhook processing updates:

- `restaurants.stripe_customer_id`
- `restaurants.stripe_subscription_id`
- `restaurants.subscription_status`
- `restaurants.plan_name`
- `restaurants.setup_paid_at`
- `restaurants.billing_starts_at`

Webhook events and ledger entries are also persisted in:

- `stripe_webhook_events`
- `billing_ledger`

## Local Testing

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
stripe trigger checkout.session.completed
```

## Notes

- the current app no longer uses the older `STRIPE_SETUP_PRICE_ID` or `STRIPE_MONTHLY_PRICE_ID` naming
- the live billing portal route is `/api/admin/billing/portal`, not `/api/stripe/portal`

