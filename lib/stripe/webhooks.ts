import type Stripe from 'stripe'
import {
  beginBillingWebhookEvent,
  finalizeBillingWebhookEvent,
  persistCheckoutSessionBilling,
  persistInvoiceBilling,
  persistSubscriptionBilling,
} from '@/lib/billing/subscriptions'
import { getServerEnv } from '@/lib/server-env'
import { ensureServerOnly } from '@/lib/server-only'
import { getStripeServerClient } from '@/lib/stripe'

ensureServerOnly('lib/stripe/webhooks')

export interface StripeWebhookResult {
  handled: boolean
  restaurantId?: string | null
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
  const webhookState = await beginBillingWebhookEvent(event)

  if (webhookState.alreadyProcessed) {
    return {
      handled: true,
      restaurantId: webhookState.restaurantId || null,
      type: event.type,
      detail: 'Stripe webhook already processed.',
    }
  }

  try {
    let result: StripeWebhookResult

    switch (event.type) {
      case 'checkout.session.completed': {
        const persisted = await persistCheckoutSessionBilling(
          event.data.object as Stripe.Checkout.Session,
          event.id
        )

        result = {
          handled: persisted.handled,
          restaurantId: persisted.restaurantId || null,
          type: event.type,
          detail: persisted.detail,
        }
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const persisted = await persistSubscriptionBilling(
          event.data.object as Stripe.Subscription,
          event.id,
          event.type
        )

        result = {
          handled: persisted.handled,
          restaurantId: persisted.restaurantId || null,
          type: event.type,
          detail: persisted.detail,
        }
        break
      }
      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed': {
        const persisted = await persistInvoiceBilling(
          event.data.object as Stripe.Invoice,
          event.id,
          event.type
        )

        result = {
          handled: persisted.handled,
          restaurantId: persisted.restaurantId || null,
          type: event.type,
          detail: persisted.detail,
        }
        break
      }
      default:
        result = {
          handled: false,
          type: event.type,
          detail: 'Unhandled Stripe event type.',
        }
    }

    await finalizeBillingWebhookEvent({
      detail: result.detail,
      event,
      handled: result.handled,
      restaurantId: result.restaurantId || null,
    })

    return result
  } catch (error) {
    await finalizeBillingWebhookEvent({
      detail: 'Stripe webhook processing failed.',
      event,
      handled: false,
      processingError: error instanceof Error ? error.message : String(error),
    })

    throw error
  }
}
