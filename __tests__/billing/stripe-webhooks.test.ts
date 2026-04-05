/* @vitest-environment node */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type Stripe from 'stripe'
import {
  beginBillingWebhookEvent,
  finalizeBillingWebhookEvent,
  persistCheckoutSessionBilling,
  persistInvoiceBilling,
  persistSubscriptionBilling,
} from '@/lib/billing/subscriptions'
import { getSupabaseServerClient } from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: vi.fn(),
}))

interface MockState {
  billing_ledger: Record<string, unknown>[]
  restaurants: Record<string, unknown>[]
  stripe_webhook_events: Record<string, unknown>[]
}

function filterRows(
  rows: Record<string, unknown>[],
  filters: Array<(row: Record<string, unknown>) => boolean>
) {
  return rows.filter((row) => filters.every((filter) => filter(row)))
}

function createSupabaseClient(state: MockState) {
  return {
    from(table: keyof MockState) {
      return {
        select() {
          const filters: Array<(row: Record<string, unknown>) => boolean> = []
          let limitCount: number | null = null

          return {
            eq(column: string, value: unknown) {
              filters.push((row) => row[column] === value)
              return this
            },
            is(column: string, value: unknown) {
              filters.push((row) => row[column] === value)
              return this
            },
            order() {
              return this
            },
            limit(value: number) {
              limitCount = value
              return this
            },
            async maybeSingle() {
              const rows = filterRows(state[table], filters)
              const limitedRows =
                typeof limitCount === 'number'
                  ? rows.slice(0, limitCount)
                  : rows

              return {
                data: limitedRows[0] ?? null,
                error: null,
              }
            },
          }
        },
        async upsert(payload: Record<string, unknown>) {
          const existingIndex = state[table].findIndex(
            (row) => row.id === payload.id
          )

          if (existingIndex >= 0) {
            state[table][existingIndex] = {
              ...state[table][existingIndex],
              ...payload,
            }
          } else {
            state[table].push(payload)
          }

          return { error: null }
        },
        async insert(payload: Record<string, unknown>) {
          state[table].push(payload)
          return { error: null }
        },
        update(payload: Record<string, unknown>) {
          return {
            async eq(column: string, value: unknown) {
              for (const row of state[table]) {
                if (row[column] === value) {
                  Object.assign(row, payload)
                }
              }

              return { error: null }
            },
          }
        },
      }
    },
  }
}

describe('billing persistence', () => {
  let state: MockState

  beforeEach(() => {
    state = {
      billing_ledger: [],
      restaurants: [
        {
          id: '11111111-1111-4111-8111-111111111111',
          subscription_status: 'inactive',
        },
      ],
      stripe_webhook_events: [],
    }

    vi.mocked(getSupabaseServerClient).mockReturnValue(
      createSupabaseClient(state) as never
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('persists checkout, subscription, and invoice transitions into billing state', async () => {
    const checkoutCreatedAt = 1_744_123_600
    const billingPeriodEnd = 1_744_987_200

    const checkoutSession = {
      id: 'cs_test_123',
      object: 'checkout.session',
      amount_total: 9900,
      client_reference_id: '11111111-1111-4111-8111-111111111111',
      created: checkoutCreatedAt,
      currency: 'eur',
      customer: 'cus_123',
      metadata: {
        plan: 'monthly',
        restaurantId: '11111111-1111-4111-8111-111111111111',
        type: 'activation-plus-subscription',
      },
      mode: 'subscription',
      payment_status: 'paid',
      subscription: 'sub_123',
    } as unknown as Stripe.Checkout.Session

    const checkoutResult = await persistCheckoutSessionBilling(
      checkoutSession,
      'evt_checkout'
    )

    expect(checkoutResult.handled).toBe(true)
    expect(state.restaurants[0]).toMatchObject({
      plan_name: 'Founding Restaurant Monthly',
      setup_paid_at: new Date(checkoutCreatedAt * 1000).toISOString(),
      stripe_customer_id: 'cus_123',
      stripe_subscription_id: 'sub_123',
      subscription_status: 'trialing',
    })
    expect(state.billing_ledger[0]).toMatchObject({
      amount_minor: 9900,
      entry_type: 'checkout.session.completed',
      restaurant_id: '11111111-1111-4111-8111-111111111111',
      stripe_event_id: 'evt_checkout',
    })

    const subscription = {
      id: 'sub_123',
      object: 'subscription',
      currency: 'eur',
      customer: 'cus_123',
      items: {
        data: [
          {
            current_period_end: billingPeriodEnd,
            current_period_start: checkoutCreatedAt,
            price: {
              currency: 'eur',
              recurring: {
                interval: 'month',
              },
              unit_amount: 4900,
            },
            quantity: 1,
          },
        ],
      },
      metadata: {
        plan: 'monthly',
        restaurantId: '11111111-1111-4111-8111-111111111111',
      },
      status: 'active',
      trial_end: billingPeriodEnd,
    } as unknown as Stripe.Subscription

    const subscriptionResult = await persistSubscriptionBilling(
      subscription,
      'evt_subscription',
      'customer.subscription.updated'
    )

    expect(subscriptionResult.handled).toBe(true)
    expect(state.restaurants[0]).toMatchObject({
      billing_starts_at: new Date(billingPeriodEnd * 1000).toISOString(),
      subscription_status: 'active',
    })
    expect(state.billing_ledger[1]).toMatchObject({
      amount_minor: 4900,
      entry_type: 'customer.subscription.updated',
      stripe_subscription_id: 'sub_123',
    })

    const invoice = {
      id: 'in_123',
      object: 'invoice',
      amount_due: 4900,
      amount_paid: 0,
      billing_reason: 'subscription_cycle',
      currency: 'eur',
      customer: 'cus_123',
      parent: {
        subscription_details: {
          subscription: 'sub_123',
        },
      },
      period_end: billingPeriodEnd,
      period_start: checkoutCreatedAt,
      status: 'open',
    } as unknown as Stripe.Invoice

    const invoiceResult = await persistInvoiceBilling(
      invoice,
      'evt_invoice_failed',
      'invoice.payment_failed'
    )

    expect(invoiceResult.handled).toBe(true)
    expect(state.restaurants[0]).toMatchObject({
      subscription_status: 'past_due',
    })
    expect(state.billing_ledger[2]).toMatchObject({
      entry_type: 'invoice.payment_failed',
      stripe_invoice_id: 'in_123',
    })
  })

  it('tracks webhook idempotency through the event table', async () => {
    const event = {
      id: 'evt_same',
      object: 'event',
      type: 'checkout.session.completed',
    } as Stripe.Event

    const firstPass = await beginBillingWebhookEvent(event)
    expect(firstPass.alreadyProcessed).toBe(false)
    expect(state.stripe_webhook_events[0]).toMatchObject({
      id: 'evt_same',
      processing_status: 'processing',
    })

    await finalizeBillingWebhookEvent({
      detail: 'Checkout session billing state persisted.',
      event,
      handled: true,
      restaurantId: '11111111-1111-4111-8111-111111111111',
    })

    expect(state.stripe_webhook_events[0]).toMatchObject({
      processed_at: expect.any(String),
      processing_status: 'processed',
      restaurant_id: '11111111-1111-4111-8111-111111111111',
    })

    const secondPass = await beginBillingWebhookEvent(event)
    expect(secondPass.alreadyProcessed).toBe(true)
    expect(secondPass.restaurantId).toBe('11111111-1111-4111-8111-111111111111')
  })
})
