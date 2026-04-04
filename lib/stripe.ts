import Stripe from 'stripe'
import { getPublicEnv } from '@/lib/env'
import {
  getEnvGroupStatus,
  type EnvGroupStatus,
  getServerEnv,
} from '@/lib/server-env'
import { ensureServerOnly } from '@/lib/server-only'

ensureServerOnly('lib/stripe')

let stripe: Stripe | null = null
let stripeSecretKey: string | undefined

export function getStripeConfigurationStatus(): EnvGroupStatus {
  const publicEnv = getPublicEnv()
  const serverEnv = getServerEnv()

  return getEnvGroupStatus({
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: publicEnv.stripePublishableKey,
    STRIPE_SECRET_KEY: serverEnv.stripeSecretKey,
  })
}

export function getStripeServerClient() {
  const serverEnv = getServerEnv()
  const status = getStripeConfigurationStatus()

  if (!status.isConfigured || !serverEnv.stripeSecretKey) {
    return null
  }

  if (!stripe || stripeSecretKey !== serverEnv.stripeSecretKey) {
    stripeSecretKey = serverEnv.stripeSecretKey
    stripe = new Stripe(serverEnv.stripeSecretKey, {
      apiVersion: '2026-02-25.clover',
      appInfo: {
        name: 'master-project',
      },
    })
  }

  return stripe
}
