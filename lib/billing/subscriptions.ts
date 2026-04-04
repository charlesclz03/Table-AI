import { getStripeServerClient } from '@/lib/stripe'
import { ensureServerOnly } from '@/lib/server-only'

ensureServerOnly('lib/billing/subscriptions')

export interface SubscriptionSummary {
  id: string
  status: string
  currentPeriodEnd?: number
}

export async function listCustomerSubscriptions(customerId: string) {
  const stripe = getStripeServerClient()

  if (!stripe) {
    return []
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
    limit: 10,
  })

  return subscriptions.data.map<SubscriptionSummary>((subscription) => ({
    id: subscription.id,
    status: subscription.status,
    currentPeriodEnd: subscription.items.data[0]?.current_period_end,
  }))
}
