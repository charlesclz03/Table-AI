import { getPublicEnv } from '@/lib/env'
import {
  getEnvGroupStatus,
  type EnvGroupStatus,
  getServerEnv,
} from '@/lib/server-env'
import { ensureServerOnly } from '@/lib/server-only'

ensureServerOnly('lib/billing/config')

export interface BillingPlanDefinition {
  id: 'starter-monthly' | 'starter-yearly'
  name: string
  interval: 'month' | 'year'
  stripePriceId?: string
  enabled: boolean
}

export function getBillingConfigurationStatus(): EnvGroupStatus {
  const publicEnv = getPublicEnv()
  const serverEnv = getServerEnv()

  return getEnvGroupStatus({
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: publicEnv.stripePublishableKey,
    STRIPE_SECRET_KEY: serverEnv.stripeSecretKey,
    STRIPE_PRICE_ID_MONTHLY: serverEnv.stripePriceIdMonthly,
    STRIPE_PRICE_ID_YEARLY: serverEnv.stripePriceIdYearly,
  })
}

export function getBillingPlans(): BillingPlanDefinition[] {
  const env = getServerEnv()

  return [
    {
      id: 'starter-monthly',
      name: 'Starter Monthly',
      interval: 'month',
      stripePriceId: env.stripePriceIdMonthly,
      enabled: Boolean(env.stripePriceIdMonthly),
    },
    {
      id: 'starter-yearly',
      name: 'Starter Yearly',
      interval: 'year',
      stripePriceId: env.stripePriceIdYearly,
      enabled: Boolean(env.stripePriceIdYearly),
    },
  ]
}
