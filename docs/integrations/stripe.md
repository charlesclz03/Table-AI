# Stripe and Billing

Billing now has explicit starter boundaries:

- `lib/billing/config.ts`
- `lib/billing/customer.ts`
- `lib/billing/subscriptions.ts`
- `lib/stripe/webhooks.ts`
- `app/api/stripe/webhook/route.ts`
- `app/api/stripe/checkout/route.ts`

Local testing guidance:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
stripe trigger checkout.session.completed
```

Hosted billing entry points:

- `/admin/billing` shows the setup CTA and billing portal actions
- `/api/stripe/checkout` creates the founding-offer Checkout Session
- `/admin/billing?success=true` and `/admin/billing?canceled=true` reflect the immediate Checkout result

Recommended env vars:

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_MONTHLY`
- `STRIPE_PRICE_ID_YEARLY`
