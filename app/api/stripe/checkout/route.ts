import { NextResponse } from 'next/server'
import { getAdminRestaurantForRequest } from '@/lib/admin/server'
import type { AdminRestaurantRecord } from '@/lib/admin/types'
import { getCheckoutPlan } from '@/lib/billing/plans'
import { ensureStripeCustomer } from '@/lib/billing/customer'
import { getPublicEnv } from '@/lib/env'
import { guardApiRoute } from '@/lib/security/api-protection'
import { RequestGuardError } from '@/lib/security/request-guards'
import { getServerEnv } from '@/lib/server-env'
import { getStripeServerClient } from '@/lib/stripe'
import { getSupabaseServerComponentClient } from '@/lib/supabase/server'

async function persistStripeCustomerId(
  restaurant: AdminRestaurantRecord,
  customerId: string
) {
  if (restaurant.stripe_customer_id === customerId) {
    return
  }

  const client = await getSupabaseServerComponentClient()

  if (!client) {
    throw new Error('Supabase is not configured.')
  }

  const { error } = await client
    .from('restaurants')
    .update({ stripe_customer_id: customerId })
    .eq('id', restaurant.id)

  if (error) {
    throw new Error(error.message)
  }
}

export async function POST(request: Request) {
  try {
    const protection = guardApiRoute(request, {
      bucket: 'stripe-checkout',
      limit: 8,
      maxBodyBytes: 8 * 1024,
      rateLimitSource: 'api.stripe.checkout',
      windowMs: 10 * 60 * 1000,
    })

    const requestUrl = new URL(request.url)
    const plan = getCheckoutPlan(requestUrl.searchParams.get('plan'))

    if (!plan) {
      throw new Error('A valid plan query is required: monthly or annual.')
    }

    const restaurant = await getAdminRestaurantForRequest()

    const stripe = getStripeServerClient()

    if (!stripe) {
      throw new Error('Stripe is not configured.')
    }

    const serverEnv = getServerEnv()
    const { customerId } = await ensureStripeCustomer({
      email: restaurant.email,
      existingCustomerId: restaurant.stripe_customer_id,
      name: restaurant.name,
    })

    if (!customerId) {
      throw new Error('Unable to create a Stripe customer for this restaurant.')
    }

    await persistStripeCustomerId(restaurant, customerId)

    const { siteUrl } = getPublicEnv()
    const priceId =
      plan.id === 'monthly'
        ? serverEnv.stripePriceIdMonthly
        : serverEnv.stripePriceIdYearly

    const lineItem = priceId
      ? { price: priceId, quantity: 1 }
      : {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Gustia ${plan.name} subscription`,
              description: plan.billingLabel,
            },
            recurring: { interval: plan.interval },
            unit_amount: plan.recurringAmount,
          },
          quantity: 1,
        }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId as string,
      client_reference_id: restaurant.id,
      line_items: [lineItem],
      metadata: {
        plan: plan.id,
        restaurantId: restaurant.id,
        userId: restaurant.owner_id ?? '',
      },
      customer_email: restaurant.email,
      success_url: `${siteUrl}/admin/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/admin/billing?cancelled=true`,
    })

    if (!session.url) {
      throw new Error('Stripe did not return a Checkout URL.')
    }

    return NextResponse.json(
      { sessionId: session.id, url: session.url },
      {
        headers: protection.headers,
      }
    )
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to create the Stripe Checkout session.',
      },
      {
        status: error instanceof RequestGuardError ? error.status : 400,
      }
    )
  }
}
