import type Stripe from 'stripe'
import { getServerEnv } from '@/lib/server-env'
import { ensureServerOnly } from '@/lib/server-only'
import { getStripeServerClient } from '@/lib/stripe'

ensureServerOnly('lib/stripe/webhooks')

export interface StripeWebhookResult {
  handled: boolean
  type: string
  detail: string
}

export function constructStripeWebhookEvent(
  payload: string,
  signature: string | null | undefined
) {
  const stripe = getStripeServerClient()
  const env = getServerEnv()

  if (!stripe || !env.stripeWebhookSecret) {
    return null
  }

  if (!signature) {
    throw new Error('Missing stripe-signature header.')
  }

  return stripe.webhooks.constructEvent(
    payload,
    signature,
    env.stripeWebhookSecret
  )
}

export async function handleStripeWebhookEvent(
  event: Stripe.Event
): Promise<StripeWebhookResult> {
  switch (event.type) {
    case 'checkout.session.completed':
      return {
        handled: true,
        type: event.type,
        detail:
          'Checkout session completed. Hook this into your billing fulfillment flow.',
      }
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      return {
        handled: true,
        type: event.type,
        detail:
          'Subscription lifecycle event received. Persist the subscription state in your app-specific billing layer.',
      }
    default:
      return {
        handled: false,
        type: event.type,
        detail:
          'Unhandled event type. Extend handleStripeWebhookEvent() when your product needs it.',
      }
  }
}
