import { getStripeServerClient } from '@/lib/stripe'
import { ensureServerOnly } from '@/lib/server-only'

ensureServerOnly('lib/billing/customer')

interface EnsureStripeCustomerOptions {
  email?: string | null
  existingCustomerId?: string | null
  name?: string | null
}

export async function ensureStripeCustomer({
  email,
  existingCustomerId,
  name,
}: EnsureStripeCustomerOptions) {
  const stripe = getStripeServerClient()

  if (!stripe || !email) {
    return {
      customerId: existingCustomerId || undefined,
      created: false,
      skipped: true,
    }
  }

  if (existingCustomerId) {
    return {
      customerId: existingCustomerId,
      created: false,
      skipped: false,
    }
  }

  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
  })

  return {
    customerId: customer.id,
    created: true,
    skipped: false,
  }
}
