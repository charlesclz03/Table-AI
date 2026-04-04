import { NextResponse } from 'next/server'
import { getAdminRestaurantForRequest } from '@/lib/admin/server'
import type { AdminRestaurantRecord } from '@/lib/admin/types'
import {
  ACTIVATION_FEE_AMOUNT,
  BILLING_DELAY_DAYS,
  formatEuroAmount,
  getCheckoutPlan,
} from '@/lib/billing/plans'
import { ensureStripeCustomer } from '@/lib/billing/customer'
import { getPublicEnv } from '@/lib/env'
import { getServerEnv } from '@/lib/server-env'
import { getStripeServerClient } from '@/lib/stripe'
import { getSupabaseServerComponentClient } from '@/lib/supabase/server'

interface CheckoutRequestBody {
  cancelPath?: string
  restaurantId?: string
  restaurantName?: string
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

function normalizeReturnPath(path: string | undefined, fallbackPath: string) {
  return typeof path === 'string' && path.startsWith('/') ? path : fallbackPath
}

export async function POST(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const plan = getCheckoutPlan(requestUrl.searchParams.get('plan'))

    if (!plan) {
      throw new Error('A valid plan query is required: monthly or annual.')
    }

    const body = (await request.json()) as CheckoutRequestBody
    const restaurant = await getAdminRestaurantForRequest()
    const restaurantId = body.restaurantId?.trim() || restaurant.id
    const restaurantName = body.restaurantName?.trim() || restaurant.name

    if (body.restaurantId?.trim() && restaurant.id !== restaurantId) {
      return NextResponse.json(
        {
          error: 'The checkout request does not match this admin account.',
        },
        { status: 403 }
      )
    }

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
    const successPath = normalizeReturnPath(
      body.successPath,
      `/admin/dashboard?checkout=success&plan=${plan.id}`
    )
    const cancelPath = normalizeReturnPath(
      body.cancelPath,
      `/auth/login?plan=${plan.id}&canceled=true`
    )
    const recurringPriceId =
      plan.id === 'monthly'
        ? serverEnv.stripePriceIdMonthly
        : serverEnv.stripePriceIdYearly

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: restaurantId,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Gustia activation for ${restaurantName}`,
              description:
                'One-time activation covering onboarding, customization, and launch preparation.',
            },
            unit_amount: ACTIVATION_FEE_AMOUNT,
          },
          quantity: 1,
        },
        recurringPriceId
          ? {
              price: recurringPriceId,
              quantity: 1,
            }
          : {
              price_data: {
                currency: 'eur',
                product_data: {
                  name: `Gustia ${plan.name.toLowerCase()} subscription for ${restaurantName}`,
                  description: `${plan.billingLabel} after the activation period.`,
                },
                recurring: {
                  interval: plan.interval,
                },
                unit_amount: plan.recurringAmount,
              },
              quantity: 1,
            },
      ],
      metadata: {
        billingLabel: plan.billingLabel,
        plan: plan.id,
        restaurantId,
        type: 'activation-plus-subscription',
      },
      subscription_data: {
        trial_period_days: BILLING_DELAY_DAYS,
        metadata: {
          billingLabel: plan.billingLabel,
          plan: plan.id,
          restaurantId,
          type: 'activation-plus-subscription',
        },
      },
      success_url: `${siteUrl}${successPath}`,
      cancel_url: `${siteUrl}${cancelPath}`,
      custom_text: {
        submit: {
          message: `Today you pay ${formatEuroAmount(ACTIVATION_FEE_AMOUNT)} for activation. Your ${plan.name.toLowerCase()} subscription starts after ${BILLING_DELAY_DAYS} days.`,
        },
      },
    })

    if (!session.url) {
      throw new Error('Stripe did not return a Checkout URL.')
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to create the Stripe Checkout session.',
      },
      { status: 400 }
    )
  }
}
