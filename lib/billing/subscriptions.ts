import type Stripe from 'stripe'
import type { AdminRestaurantRecord } from '@/lib/admin/types'
import { rewardReferralForPaidRestaurant } from '@/lib/referrals'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getStripeServerClient } from '@/lib/stripe'
import { ensureServerOnly } from '@/lib/server-only'

ensureServerOnly('lib/billing/subscriptions')

export interface SubscriptionSummary {
  id: string
  status: string
  currentPeriodEnd?: number
}

export interface BillingPersistenceResult {
  detail: string
  handled: boolean
  restaurantId?: string | null
}

interface StripeWebhookState {
  alreadyProcessed: boolean
  restaurantId?: string | null
}

function getBillingClient() {
  const client = getSupabaseServerClient({ serviceRole: true })

  if (!client) {
    throw new Error('Supabase is not configured.')
  }

  return client
}

function isUuid(value: string | null | undefined) {
  return Boolean(
    value &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value
    )
  )
}

function getStripeReferenceId(
  value: string | { id: string } | null | undefined
) {
  if (!value) {
    return null
  }

  return typeof value === 'string' ? value : value.id
}

function toIsoTimestamp(unixTimestamp: number | null | undefined) {
  if (!unixTimestamp || !Number.isFinite(unixTimestamp)) {
    return null
  }

  return new Date(unixTimestamp * 1000).toISOString()
}

function getPlanName(options: {
  fallbackInterval?: string | null
  metadataPlan?: string | null
}) {
  if (options.metadataPlan === 'annual') {
    return 'Founding Restaurant Annual'
  }

  if (options.metadataPlan === 'monthly') {
    return 'Founding Restaurant Monthly'
  }

  if (options.fallbackInterval === 'year') {
    return 'Founding Restaurant Annual'
  }

  if (options.fallbackInterval === 'month') {
    return 'Founding Restaurant Monthly'
  }

  return 'Founding Restaurant'
}

async function findRestaurantForBillingEvent(options: {
  customerId?: string | null
  restaurantId?: string | null
  subscriptionId?: string | null
}) {
  const client = getBillingClient()

  if (options.restaurantId && isUuid(options.restaurantId)) {
    const { data, error } = await client
      .from('restaurants')
      .select('id')
      .eq('id', options.restaurantId)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    if (data?.id) {
      return data.id as string
    }
  }

  if (options.subscriptionId) {
    const { data, error } = await client
      .from('restaurants')
      .select('id')
      .eq('stripe_subscription_id', options.subscriptionId)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    if (data?.id) {
      return data.id as string
    }
  }

  if (options.customerId) {
    const { data, error } = await client
      .from('restaurants')
      .select('id')
      .eq('stripe_customer_id', options.customerId)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    if (data?.id) {
      return data.id as string
    }
  }

  return null
}

async function updateRestaurantBillingState(
  restaurantId: string,
  payload: Partial<AdminRestaurantRecord>
) {
  const client = getBillingClient()
  const { error } = await client
    .from('restaurants')
    .update(payload)
    .eq('id', restaurantId)

  if (error) {
    throw new Error(error.message)
  }
}

async function appendBillingLedgerEntry(entry: {
  amountMinor?: number | null
  currency?: string | null
  entryType: string
  metadata?: Record<string, unknown>
  periodEnd?: string | null
  periodStart?: string | null
  restaurantId: string
  status?: string | null
  stripeCheckoutSessionId?: string | null
  stripeCustomerId?: string | null
  stripeEventId: string
  stripeInvoiceId?: string | null
  stripeSubscriptionId?: string | null
}) {
  const client = getBillingClient()
  const { error } = await client.from('billing_ledger').insert({
    amount_minor: entry.amountMinor ?? null,
    currency: entry.currency || null,
    entry_type: entry.entryType,
    metadata: entry.metadata || {},
    period_end: entry.periodEnd || null,
    period_start: entry.periodStart || null,
    restaurant_id: entry.restaurantId,
    status: entry.status || null,
    stripe_checkout_session_id: entry.stripeCheckoutSessionId || null,
    stripe_customer_id: entry.stripeCustomerId || null,
    stripe_event_id: entry.stripeEventId,
    stripe_invoice_id: entry.stripeInvoiceId || null,
    stripe_subscription_id: entry.stripeSubscriptionId || null,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function beginBillingWebhookEvent(
  event: Stripe.Event
): Promise<StripeWebhookState> {
  const client = getBillingClient()
  const { data: existing, error: existingError } = await client
    .from('stripe_webhook_events')
    .select('id, processed_at, processing_status, restaurant_id')
    .eq('id', event.id)
    .maybeSingle()

  if (existingError) {
    throw new Error(existingError.message)
  }

  if (
    existing?.processed_at ||
    existing?.processing_status === 'processed' ||
    existing?.processing_status === 'ignored'
  ) {
    return {
      alreadyProcessed: true,
      restaurantId: existing.restaurant_id,
    }
  }

  const { error } = await client.from('stripe_webhook_events').upsert({
    id: event.id,
    event_type: event.type,
    payload: event,
    processing_error: null,
    processing_status: 'processing',
  })

  if (error) {
    throw new Error(error.message)
  }

  return {
    alreadyProcessed: false,
    restaurantId: existing?.restaurant_id || null,
  }
}

export async function finalizeBillingWebhookEvent(options: {
  detail: string
  event: Stripe.Event
  handled: boolean
  processingError?: string | null
  restaurantId?: string | null
}) {
  const client = getBillingClient()
  const { error } = await client
    .from('stripe_webhook_events')
    .update({
      processed_at:
        options.handled || !options.processingError
          ? new Date().toISOString()
          : null,
      processing_error: options.processingError || null,
      processing_status: options.processingError
        ? 'failed'
        : options.handled
          ? 'processed'
          : 'ignored',
      restaurant_id: options.restaurantId || null,
      result_detail: options.detail,
    })
    .eq('id', options.event.id)

  if (error) {
    throw new Error(error.message)
  }
}

export async function persistCheckoutSessionBilling(
  session: Stripe.Checkout.Session,
  eventId: string
): Promise<BillingPersistenceResult> {
  const restaurantId = await findRestaurantForBillingEvent({
    customerId: getStripeReferenceId(session.customer),
    restaurantId:
      session.metadata?.restaurantId || session.client_reference_id || null,
    subscriptionId: getStripeReferenceId(session.subscription),
  })

  if (!restaurantId) {
    return {
      detail: 'Checkout session did not match a restaurant record.',
      handled: false,
      restaurantId: null,
    }
  }

  await updateRestaurantBillingState(restaurantId, {
    billing_starts_at: null,
    plan_name: getPlanName({
      metadataPlan: session.metadata?.plan || null,
    }),
    setup_paid_at:
      session.payment_status === 'paid'
        ? toIsoTimestamp(session.created)
        : undefined,
    stripe_customer_id: getStripeReferenceId(session.customer),
    stripe_subscription_id: getStripeReferenceId(session.subscription),
    subscription_status:
      session.payment_status === 'paid' ? 'trialing' : 'incomplete',
  })

  await appendBillingLedgerEntry({
    amountMinor: session.amount_total ?? null,
    currency: session.currency || null,
    entryType: 'checkout.session.completed',
    metadata: {
      mode: session.mode,
      paymentStatus: session.payment_status,
      plan: session.metadata?.plan || null,
      type: session.metadata?.type || null,
    },
    restaurantId,
    status: session.payment_status,
    stripeCheckoutSessionId: session.id,
    stripeCustomerId: getStripeReferenceId(session.customer),
    stripeEventId: eventId,
    stripeSubscriptionId: getStripeReferenceId(session.subscription),
  })

  if (session.payment_status === 'paid') {
    await rewardReferralForPaidRestaurant(restaurantId)
  }

  return {
    detail: 'Checkout session billing state persisted.',
    handled: true,
    restaurantId,
  }
}

export async function persistSubscriptionBilling(
  subscription: Stripe.Subscription,
  eventId: string,
  eventType: string
): Promise<BillingPersistenceResult> {
  const restaurantId = await findRestaurantForBillingEvent({
    customerId: getStripeReferenceId(subscription.customer),
    restaurantId: subscription.metadata?.restaurantId || null,
    subscriptionId: subscription.id,
  })

  if (!restaurantId) {
    return {
      detail: 'Subscription event did not match a restaurant record.',
      handled: false,
      restaurantId: null,
    }
  }

  const primaryItem = subscription.items.data[0]
  const fallbackInterval = primaryItem?.price.recurring?.interval || null
  const periodStart = toIsoTimestamp(primaryItem?.current_period_start)
  const nextBillingDate = toIsoTimestamp(
    subscription.trial_end || primaryItem?.current_period_end
  )

  await updateRestaurantBillingState(restaurantId, {
    billing_starts_at: nextBillingDate,
    plan_name: getPlanName({
      fallbackInterval,
      metadataPlan: subscription.metadata?.plan || null,
    }),
    stripe_customer_id: getStripeReferenceId(subscription.customer),
    stripe_subscription_id: subscription.id,
    subscription_status: subscription.status,
  })

  await appendBillingLedgerEntry({
    amountMinor:
      primaryItem?.price.unit_amount && primaryItem.quantity
        ? primaryItem.price.unit_amount * primaryItem.quantity
        : (primaryItem?.price.unit_amount ?? null),
    currency: primaryItem?.price.currency || subscription.currency || null,
    entryType: eventType,
    metadata: {
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: primaryItem?.current_period_end ?? null,
      currentPeriodStart: primaryItem?.current_period_start ?? null,
      plan: subscription.metadata?.plan || null,
      trialEnd: subscription.trial_end,
    },
    periodEnd: nextBillingDate,
    periodStart,
    restaurantId,
    status: subscription.status,
    stripeCustomerId: getStripeReferenceId(subscription.customer),
    stripeEventId: eventId,
    stripeSubscriptionId: subscription.id,
  })

  return {
    detail: 'Subscription billing state persisted.',
    handled: true,
    restaurantId,
  }
}

export async function persistInvoiceBilling(
  invoice: Stripe.Invoice,
  eventId: string,
  eventType: string
): Promise<BillingPersistenceResult> {
  const restaurantId = await findRestaurantForBillingEvent({
    customerId: getStripeReferenceId(invoice.customer),
    subscriptionId: getStripeReferenceId(
      invoice.parent?.subscription_details?.subscription || null
    ),
  })

  if (!restaurantId) {
    return {
      detail: 'Invoice event did not match a restaurant record.',
      handled: false,
      restaurantId: null,
    }
  }

  if (eventType === 'invoice.payment_failed') {
    await updateRestaurantBillingState(restaurantId, {
      subscription_status: 'past_due',
    })
  }

  await appendBillingLedgerEntry({
    amountMinor: invoice.amount_paid ?? invoice.amount_due ?? null,
    currency: invoice.currency || null,
    entryType: eventType,
    metadata: {
      billingReason: invoice.billing_reason,
      hostedInvoiceUrl: invoice.hosted_invoice_url,
    },
    periodEnd: toIsoTimestamp(invoice.period_end),
    periodStart: toIsoTimestamp(invoice.period_start),
    restaurantId,
    status: invoice.status,
    stripeCustomerId: getStripeReferenceId(invoice.customer),
    stripeEventId: eventId,
    stripeInvoiceId: invoice.id,
    stripeSubscriptionId: getStripeReferenceId(
      invoice.parent?.subscription_details?.subscription || null
    ),
  })

  return {
    detail: 'Invoice billing ledger entry persisted.',
    handled: true,
    restaurantId,
  }
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
