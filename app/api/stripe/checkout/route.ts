import { NextResponse } from 'next/server'
import { getAdminRestaurantForRequest } from '@/lib/admin/server'
import type { AdminRestaurantRecord } from '@/lib/admin/types'
import { ensureStripeCustomer } from '@/lib/billing/customer'
import { getPublicEnv } from '@/lib/env'
import { getStripeServerClient } from '@/lib/stripe'
import { getSupabaseServerClient } from '@/lib/supabase/server'

const SETUP_FEE_AMOUNT = 29900
const MONTHLY_SUBSCRIPTION_AMOUNT = 4900
const FIRST_MONTH_TRIAL_DAYS = 30

interface CheckoutRequestBody {
  restaurantId?: string
  restaurantName?: string
}

async function persistStripeCustomerId(
  restaurant: AdminRestaurantRecord,
  customerId: string
) {
  if (restaurant.stripe_customer_id === customerId) {
    return
  }

  const client = getSupabaseServerClient({ serviceRole: true })

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
    const body = (await request.json()) as CheckoutRequestBody
    const restaurantId = body.restaurantId?.trim()
    const restaurantName = body.restaurantName?.trim()

    if (!restaurantId || !restaurantName) {
      throw new Error('restaurantId and restaurantName are required.')
    }

    const restaurant = await getAdminRestaurantForRequest()

    if (restaurant.id !== restaurantId) {
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
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: restaurantId,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `TableIA setup for ${restaurantName}`,
              description:
                'Founding setup fee covering onboarding, customization, and launch preparation.',
            },
            unit_amount: SETUP_FEE_AMOUNT,
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `TableIA monthly subscription for ${restaurantName}`,
              description:
                'Ongoing TableIA concierge access after the included first month.',
            },
            recurring: {
              interval: 'month',
            },
            unit_amount: MONTHLY_SUBSCRIPTION_AMOUNT,
          },
          quantity: 1,
        },
      ],
      metadata: {
        restaurantId,
        type: 'setup',
      },
      subscription_data: {
        trial_period_days: FIRST_MONTH_TRIAL_DAYS,
        metadata: {
          restaurantId,
          type: 'setup',
        },
      },
      success_url: `${siteUrl}/admin/billing?success=true`,
      cancel_url: `${siteUrl}/admin/billing?canceled=true`,
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
