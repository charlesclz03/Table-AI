/* @vitest-environment node */

import Stripe from 'stripe'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  constructStripeWebhookEvent,
  handleStripeWebhookEvent,
} from '@/lib/stripe/webhooks'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('Stripe webhook helpers', () => {
  it('returns null when Stripe webhook env vars are absent', () => {
    const event = constructStripeWebhookEvent('{}', 'missing')

    expect(event).toBeNull()
  })

  it('verifies and handles a signed checkout event', async () => {
    vi.stubEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 'pk_test_123')
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_123')
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test_123')

    const stripe = new Stripe('sk_test_123', {
      apiVersion: '2026-02-25.clover',
    })
    const payload = JSON.stringify({
      id: 'evt_123',
      object: 'event',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          object: 'checkout.session',
        },
      },
    })
    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: 'whsec_test_123',
    })
    const event = constructStripeWebhookEvent(payload, signature)

    expect(event?.type).toBe('checkout.session.completed')

    const result = await handleStripeWebhookEvent(event!)

    expect(result.handled).toBe(true)
    expect(result.type).toBe('checkout.session.completed')
  })
})
