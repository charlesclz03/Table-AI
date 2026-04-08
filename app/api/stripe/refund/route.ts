import { NextResponse } from 'next/server'
import { getAdminRestaurantForRequest } from '@/lib/admin/server'
import { guardApiRoute } from '@/lib/security/api-protection'
import { RequestGuardError } from '@/lib/security/request-guards'
import { getStripeServerClient } from '@/lib/stripe'

function getStripeReferenceId(value: unknown) {
  if (typeof value === 'string') {
    return value
  }

  if (
    value &&
    typeof value === 'object' &&
    'id' in value &&
    typeof value.id === 'string'
  ) {
    return value.id
  }

  return null
}

export async function POST(request: Request) {
  try {
    const protection = guardApiRoute(request, {
      bucket: 'stripe-refund',
      limit: 5,
      maxBodyBytes: 1024,
      rateLimitSource: 'api.stripe.refund',
      windowMs: 15 * 60 * 1000,
    })
    const restaurant = await getAdminRestaurantForRequest()
    const stripe = getStripeServerClient()

    if (!stripe) {
      throw new Error('Stripe is not configured.')
    }

    if (!restaurant.stripe_customer_id) {
      throw new Error('No Stripe customer is configured for this restaurant.')
    }

    const body = (await request.json().catch(() => null)) as {
      amount?: number
      paymentIntentId?: string
    } | null
    const refundTarget = body?.paymentIntentId?.trim() || ''

    if (!refundTarget) {
      throw new Error('paymentIntentId is required.')
    }

    if (
      typeof body?.amount !== 'undefined' &&
      (!Number.isInteger(body.amount) || body.amount <= 0)
    ) {
      throw new Error('amount must be a positive integer in cents.')
    }

    let paymentIntentId = refundTarget

    if (refundTarget.startsWith('in_')) {
      const invoice = await stripe.invoices.retrieve(refundTarget, {
        expand: ['payment_intent'],
      })

      if (
        getStripeReferenceId(invoice.customer) !== restaurant.stripe_customer_id
      ) {
        throw new Error('This invoice does not belong to your restaurant.')
      }

      paymentIntentId =
        getStripeReferenceId(
          (invoice as unknown as Record<string, unknown>).payment_intent
        ) || ''

      if (!paymentIntentId) {
        throw new Error('This invoice cannot be refunded from the dashboard.')
      }
    } else {
      const paymentIntent = await stripe.paymentIntents.retrieve(refundTarget)

      if (
        getStripeReferenceId(paymentIntent.customer) !==
        restaurant.stripe_customer_id
      ) {
        throw new Error('This payment does not belong to your restaurant.')
      }

      paymentIntentId = paymentIntent.id
    }

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      ...(typeof body?.amount === 'number' ? { amount: body.amount } : {}),
      metadata: {
        restaurantId: restaurant.id,
      },
    })

    return NextResponse.json(
      {
        success: true,
        refundId: refund.id,
      },
      {
        headers: protection.headers,
      }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unable to create refund.',
      },
      {
        status: error instanceof RequestGuardError ? error.status : 400,
      }
    )
  }
}
