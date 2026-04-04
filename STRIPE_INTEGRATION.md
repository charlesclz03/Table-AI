# Gustia - Stripe Integration Guide
**Date:** 2026-04-03

---

## Overview

Stripe handles:

- EUR 299 setup payment collected immediately
- EUR 49/month recurring billing starting after the included first month
- webhook notifications for setup and subscription events
- customer portal for managing the recurring subscription

---

## BILLING MODEL

The commercial offer is:

- **EUR 299 one-time setup**
- **First month included**
- **EUR 49/month after 30 days**

The cleanest Stripe implementation is:

- create one **one-time** setup price
- create one **recurring monthly** price
- use a **subscription checkout session**
- attach both line items
- add a **30-day trial** to the subscription so the first monthly charge happens after launch month

This gives:

- immediate cash collection now
- automatic recurring billing later
- a customer portal for cancel/update flows

---

## Step 1: Create Stripe Account

1. Go to `dashboard.stripe.com`
2. Create account / log in
3. Go to Developers -> API keys
4. Copy test keys for development

---

## Step 2: Create Products and Prices

In Stripe Dashboard -> Products -> Add Product:

### Product 1: Setup
```
Name: Gustia - Restaurant Setup
Price: EUR 299.00
Billing: One-time
```

### Product 2: Monthly plan
```
Name: Gustia - Restaurant Concierge Monthly
Price: EUR 49.00/month
Billing: Recurring
Interval: Monthly
```

Copy both Price IDs:
```
Setup Price ID: price_setup_123
Monthly Price ID: price_monthly_123
```

---

## Step 3: Add Keys to `.env.local`

```env
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SETUP_PRICE_ID=price_setup_123
STRIPE_MONTHLY_PRICE_ID=price_monthly_123
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

---

## Step 4: Create Checkout Session (Next.js API Route)

`app/api/stripe/checkout/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  const { restaurantId, email } = await request.json()

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: process.env.STRIPE_SETUP_PRICE_ID,
        quantity: 1,
      },
      {
        price: process.env.STRIPE_MONTHLY_PRICE_ID,
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: 30,
      metadata: {
        restaurantId,
      },
    },
    customer_email: email,
    metadata: {
      restaurantId,
      offer: 'founding_299_setup_49_month',
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard?canceled=true`,
  })

  return NextResponse.json({ url: session.url })
}
```

### Why this structure works

- The setup line item is charged immediately.
- The recurring line item creates the subscription.
- The 30-day trial delays the first EUR 49 invoice.
- The same customer later gets access to the Stripe billing portal.

---

## Step 5: Suggested Supabase Fields

Add fields like these to the `restaurants` table if not already present:

```sql
alter table restaurants
  add column if not exists stripe_subscription_id text,
  add column if not exists setup_paid_at timestamp,
  add column if not exists billing_starts_at timestamp,
  add column if not exists plan_name text default 'founding';
```

These are useful for:

- knowing setup payment landed
- tracking when recurring billing begins
- handling trial/active/past_due states cleanly

---

## Step 6: Create Webhook Handler

`app/api/stripe/webhook/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const restaurantId = session.metadata?.restaurantId
      const customerId = session.customer as string
      const subscriptionId = session.subscription as string

      await supabase
        .from('restaurants')
        .update({
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          subscription_status: 'active_trial',
          setup_paid_at: new Date().toISOString(),
          plan_name: 'founding',
        })
        .eq('id', restaurantId)

      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string
      const status =
        subscription.status === 'trialing' ? 'active_trial' : subscription.status

      await supabase
        .from('restaurants')
        .update({
          subscription_status: status,
          billing_starts_at: new Date(subscription.trial_end! * 1000).toISOString(),
        })
        .eq('stripe_customer_id', customerId)

      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      await supabase
        .from('restaurants')
        .update({ subscription_status: 'inactive' })
        .eq('stripe_customer_id', customerId)

      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string

      await supabase
        .from('restaurants')
        .update({ subscription_status: 'past_due' })
        .eq('stripe_customer_id', customerId)

      break
    }
  }

  return NextResponse.json({ received: true })
}
```

---

## Step 7: Set Up Webhook Local Testing

1. Install Stripe CLI
2. Log in:
   ```
   stripe login
   ```
3. Forward events to localhost:
   ```
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. Copy the webhook signing secret (`whsec_xxx`) into `.env.local`

---

## Step 8: Customer Portal

`app/api/stripe/portal/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  const { customerId } = await request.json()

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard`,
  })

  return NextResponse.json({ url: portalSession.url })
}
```

---

## Subscription Status Flow

```
inactive -> [checkout completed] -> active_trial
active_trial -> [trial ends, first successful invoice] -> active
active -> [payment failed] -> past_due
active or active_trial -> [subscription deleted] -> inactive
```

---

## Testing With Stripe Test Cards

Use test card numbers:

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires auth: `4000 0025 0000 3155`

Test expiry: any future date  
Test CVC: any 3 digits

---

## Dunning (Failed Payment Recovery)

Stripe automatically handles:

- retry attempts over several days
- customer emails if enabled
- final failure -> subscription cancellation or unpaid state depending on settings

Recommended:

- let Stripe retry automatically
- mark the restaurant `past_due`
- pause advanced support until billing is resolved

---

## Fair-Use Enforcement (Optional but Recommended)

If you keep a 2,000 query monthly allowance:

```typescript
const { data } = await supabase
  .from('analytics')
  .select('query_count')
  .eq('restaurant_id', restaurantId)
  .eq('month', currentMonth)
  .single()

if ((data?.query_count ?? 0) >= 2000) {
  return { error: 'Monthly usage limit reached' }
}
```

You do not need to lead with overages in the sales pitch, but the system should still protect margins.

