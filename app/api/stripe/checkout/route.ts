import { createStripeSubscriptionCheckoutResponse } from '@/lib/billing/checkout-session'

export async function POST(request: Request) {
  return createStripeSubscriptionCheckoutResponse(request)
}
