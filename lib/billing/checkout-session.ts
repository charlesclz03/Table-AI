import { NextResponse } from 'next/server'
import { getAdminRestaurantForRequest } from '@/lib/admin/server'
import type { AdminRestaurantRecord } from '@/lib/admin/types'
import {
  ACTIVATION_FEE_AMOUNT,
  BILLING_DELAY_DAYS,
  getCheckoutPlan,
} from '@/lib/billing/plans'
import { ensureStripeCustomer } from '@/lib/billing/customer'
import { getPublicEnv } from '@/lib/env'
import { guardApiRoute } from '@/lib/security/api-protection'
import { RequestGuardError } from '@/lib/security/request-guards'
import { ensureServerOnly } from '@/lib/server-only'
import { getStripeServerClient } from '@/lib/stripe'
import { getSupabaseServerComponentClient } from '@/lib/supabase/server'

ensureServerOnly('lib/billing/checkout-session')

interface CheckoutRequestBody {
  cancelPath?: string
  plan?: string
  successPath?: string
}

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

async function readCheckoutRequestBody(
  request: Request
): Promise<CheckoutRequestBody> {
  const rawBody = await request.text()

  if (!rawBody.trim()) {
    return {}
  }

  try {
    const parsed = JSON.parse(rawBody) as CheckoutRequestBody

    return typeof parsed === 'object' && parsed ? parsed : {}
  } catch {
    throw new RequestGuardError('Invalid JSON body.', 400)
  }
}

function getSafePath(value: unknown, fallbackPath: string) {
  if (typeof value !== 'string') {
    return fallbackPath
  }

  const trimmedValue = value.trim()

  if (!trimmedValue.startsWith('/') || trimmedValue.startsWith('//')) {
    return fallbackPath
  }

  return trimmedValue
}

function appendSessionId(path: string) {
  return path.includes('?')
    ? `${path}&session_id={CHECKOUT_SESSION_ID}`
    : `${path}?session_id={CHECKOUT_SESSION_ID}`
}

export async function createStripeSubscriptionCheckoutResponse(
  request: Request
) {
  try {
    const protection = guardApiRoute(request, {
      bucket: 'stripe-subscribe',
      limit: 8,
      maxBodyBytes: 8 * 1024,
      rateLimitSource: 'api.stripe.subscribe',
      windowMs: 10 * 60 * 1000,
    })

    const requestUrl = new URL(request.url)
    const body = await readCheckoutRequestBody(request)
    const plan = getCheckoutPlan(
      requestUrl.searchParams.get('plan') || body.plan || null
    )

    if (!plan) {
      throw new Error('A valid plan is required: monthly or annual.')
    }

    const restaurant = await getAdminRestaurantForRequest()
    const stripe = getStripeServerClient()

    if (!stripe) {
      throw new Error('Stripe is not configured.')
    }

    const { customerId } = await ensureStripeCustomer({
      email: restaurant.email,
      existingCustomerId: restaurant.stripe_customer_id,
      name: restaurant.name,
    })

    if (!customerId) {
      throw new Error('Unable to create a Stripe customer for this restaurant.')
    }

    await persistStripeCustomerId(restaurant, customerId)

    const metadata: Record<string, string> = {
      activationFeeAmount: String(ACTIVATION_FEE_AMOUNT),
      billingDelayDays: String(BILLING_DELAY_DAYS),
      plan: plan.id,
      restaurantId: restaurant.id,
      type: 'activation_plus_subscription',
    }

    if (restaurant.owner_id) {
      metadata.userId = restaurant.owner_id
    }

    const successPath = getSafePath(
      body.successPath,
      `/admin/dashboard?checkout=success&plan=${plan.id}`
    )
    const cancelPath = getSafePath(
      body.cancelPath,
      `/admin/billing?canceled=true&plan=${plan.id}`
    )
    const { siteUrl } = getPublicEnv()

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: restaurant.id,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Gustia Activation',
            },
            unit_amount: ACTIVATION_FEE_AMOUNT,
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Gustia ${plan.name}`,
            },
            recurring: {
              interval: plan.interval,
            },
            unit_amount: plan.recurringAmount,
          },
          quantity: 1,
        },
      ],
      metadata,
      subscription_data: {
        metadata,
        trial_period_days: BILLING_DELAY_DAYS,
      },
      success_url: `${siteUrl}${appendSessionId(successPath)}`,
      cancel_url: `${siteUrl}${cancelPath}`,
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
