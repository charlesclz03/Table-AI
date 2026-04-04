import { redirect } from 'next/navigation'
import { getPublicEnv } from '@/lib/env'
import { auth } from '@/lib/auth'
import { ensureRestaurantForOwner } from '@/lib/admin/owner-restaurant'
import { getStripeServerClient } from '@/lib/stripe'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { ensureServerOnly } from '@/lib/server-only'
import {
  EMPTY_QUIZ_ANSWERS,
  type AdminMenuItem,
  type AdminQuizAnswers,
  type AdminRestaurantRecord,
  type BillingInvoiceSummary,
  type BillingOverview,
  type ConversationMessage,
  type ConversationPreview,
  type ConversationRecord,
  type DashboardStats,
} from '@/lib/admin/types'

ensureServerOnly('lib/admin/server')

interface AdminContext {
  restaurant: AdminRestaurantRecord | null
  userEmail: string
}

function getAdminSupabaseClient() {
  return getSupabaseServerClient({ serviceRole: true })
}

function startOfCurrentWeek() {
  const date = new Date()
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function normalizeAllergens(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map((entry) => String(entry).trim()).filter(Boolean)
}

export function normalizeMenuItems(
  menu: AdminRestaurantRecord['menu_json']
): AdminMenuItem[] {
  const rawItems = Array.isArray(menu) ? menu : menu?.items

  if (!Array.isArray(rawItems)) {
    return []
  }

  return rawItems
    .map((item, index) => {
      const safeItem = item as Partial<AdminMenuItem> | undefined
      const priceValue =
        typeof safeItem?.price === 'number'
          ? safeItem.price
          : Number.parseFloat(String(safeItem?.price ?? 0))

      return {
        id: safeItem?.id || createId(),
        name: String(safeItem?.name ?? '').trim(),
        price: Number.isFinite(priceValue) ? Number(priceValue.toFixed(2)) : 0,
        category: String(safeItem?.category ?? 'mains').trim() || 'mains',
        description: String(safeItem?.description ?? '').trim(),
        allergens: normalizeAllergens(safeItem?.allergens),
        is_vegetarian: Boolean(safeItem?.is_vegetarian),
        is_vegan: Boolean(safeItem?.is_vegan),
        sort_order:
          typeof safeItem?.sort_order === 'number'
            ? safeItem.sort_order
            : index,
      }
    })
    .sort((left, right) => left.sort_order - right.sort_order)
}

export function normalizeQuizAnswers(
  quizAnswers: AdminRestaurantRecord['quiz_answers']
): AdminQuizAnswers {
  return {
    ...EMPTY_QUIZ_ANSWERS,
    ...(quizAnswers || {}),
  }
}

function normalizeConversationMessages(
  messages: unknown
): ConversationMessage[] {
  if (!Array.isArray(messages)) {
    return []
  }

  return messages.map((message) => ({
    role: typeof message?.role === 'string' ? message.role : '',
    content: typeof message?.content === 'string' ? message.content : '',
  }))
}

function normalizeQuestion(question: string) {
  return question
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function getConversationPreview(
  conversation: ConversationRecord
): ConversationPreview {
  const messages = normalizeConversationMessages(conversation.messages)
  const lastQuestion =
    [...messages]
      .reverse()
      .find((message) => message.role === 'user')
      ?.content?.trim() || 'No guest question yet.'
  const lastReply =
    [...messages]
      .reverse()
      .find((message) => message.role === 'assistant')
      ?.content?.trim() || 'No concierge reply yet.'

  return {
    id: conversation.id,
    tableNumber: conversation.table_number?.trim() || 'Unknown table',
    createdAt: conversation.created_at || null,
    lastQuestion,
    lastReply,
  }
}

function getMostAskedQuestions(conversations: ConversationRecord[]) {
  const counts = new Map<string, { count: number; original: string }>()

  for (const conversation of conversations) {
    const messages = normalizeConversationMessages(conversation.messages)

    for (const message of messages) {
      const content =
        message.role === 'user' ? message.content?.trim() || '' : ''
      const normalized = normalizeQuestion(content)

      if (!normalized) {
        continue
      }

      const current = counts.get(normalized)

      counts.set(normalized, {
        count: (current?.count || 0) + 1,
        original: current?.original || content,
      })
    }
  }

  return [...counts.values()]
    .sort((left, right) => right.count - left.count)
    .slice(0, 3)
    .map((entry) => entry.original)
}

export async function requireAdminContext(): Promise<AdminContext> {
  const session = await auth()
  const userEmail = session?.user?.email?.trim().toLowerCase()
  const userName = session?.user?.name

  if (!userEmail) {
    redirect('/admin/login')
  }

  return {
    restaurant: await ensureRestaurantForOwner({
      email: userEmail,
      ownerName: userName,
    }),
    userEmail,
  }
}

export async function requireAdminRestaurant() {
  const context = await requireAdminContext()

  if (!context.restaurant) {
    redirect('/admin/login?missing=restaurant')
  }

  return context.restaurant
}

export async function getAdminRestaurantForRequest() {
  const session = await auth()
  const userEmail = session?.user?.email?.trim().toLowerCase()
  const userName = session?.user?.name

  if (!userEmail) {
    throw new Error('You must be signed in to manage the admin dashboard.')
  }

  const restaurant = await ensureRestaurantForOwner({
    email: userEmail,
    ownerName: userName,
  })

  if (!restaurant) {
    throw new Error('No restaurant record was found for this account.')
  }

  return restaurant
}

export async function getDashboardStats(
  restaurantId: string
): Promise<DashboardStats> {
  const client = getAdminSupabaseClient()

  if (!client) {
    return {
      conversationsThisWeek: 0,
      mostAskedQuestions: [],
      recentConversations: [],
    }
  }

  const weekStartIso = startOfCurrentWeek().toISOString()

  const [{ data: weeklyData }, { data: recentData }] = await Promise.all([
    client
      .from('conversations')
      .select('id, table_number, messages, created_at')
      .eq('restaurant_id', restaurantId)
      .gte('created_at', weekStartIso),
    client
      .from('conversations')
      .select('id, table_number, messages, created_at')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const weeklyConversations = (weeklyData as ConversationRecord[] | null) || []
  const recentConversations = (recentData as ConversationRecord[] | null) || []

  return {
    conversationsThisWeek: weeklyConversations.length,
    mostAskedQuestions: getMostAskedQuestions(weeklyConversations),
    recentConversations: recentConversations.map(getConversationPreview),
  }
}

export async function updateRestaurantMenu(
  restaurantId: string,
  menuItems: AdminMenuItem[]
) {
  const client = getAdminSupabaseClient()

  if (!client) {
    throw new Error('Supabase is not configured.')
  }

  const payload = normalizeMenuItems(menuItems).map((item, index) => ({
    ...item,
    sort_order: index,
  }))

  const { error } = await client
    .from('restaurants')
    .update({ menu_json: { items: payload } })
    .eq('id', restaurantId)

  if (error) {
    throw new Error(error.message)
  }

  return payload
}

export async function updateRestaurantQuiz(
  restaurantId: string,
  quizAnswers: AdminQuizAnswers
) {
  const client = getAdminSupabaseClient()

  if (!client) {
    throw new Error('Supabase is not configured.')
  }

  const payload = {
    ...EMPTY_QUIZ_ANSWERS,
    ...quizAnswers,
    completed_at: new Date().toISOString(),
  }

  const { error } = await client
    .from('restaurants')
    .update({ quiz_answers: payload })
    .eq('id', restaurantId)

  if (error) {
    throw new Error(error.message)
  }

  return payload
}

function formatBillingDate(dateValue?: string | null) {
  if (!dateValue) {
    return null
  }

  const date = new Date(dateValue)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function mapInvoices(invoices: unknown[]): BillingInvoiceSummary[] {
  return invoices.map((invoice) => {
    const safeInvoice = invoice as Record<string, unknown>

    return {
      id: String(safeInvoice.id),
      created: Number(safeInvoice.created || 0),
      amountPaid: Number(safeInvoice.amount_paid || 0),
      currency: String(safeInvoice.currency || 'eur'),
      status: String(safeInvoice.status || 'draft'),
      hostedInvoiceUrl:
        typeof safeInvoice.hosted_invoice_url === 'string'
          ? safeInvoice.hosted_invoice_url
          : null,
      invoicePdf:
        typeof safeInvoice.invoice_pdf === 'string'
          ? safeInvoice.invoice_pdf
          : null,
    }
  })
}

export async function getBillingOverview(
  restaurant: AdminRestaurantRecord
): Promise<BillingOverview> {
  const stripe = getStripeServerClient()

  if (!stripe || !restaurant.stripe_customer_id) {
    return {
      planName: restaurant.plan_name || 'Founding Restaurant',
      subscriptionStatus: restaurant.subscription_status || 'inactive',
      setupDate: formatBillingDate(
        restaurant.setup_paid_at || restaurant.created_at
      ),
      nextBillingDate: formatBillingDate(restaurant.billing_starts_at),
      paymentMethodLast4: null,
      invoices: [],
      hasPortalAccess: false,
    }
  }

  const [customer, invoices] = await Promise.all([
    stripe.customers.retrieve(restaurant.stripe_customer_id, {
      expand: ['invoice_settings.default_payment_method'],
    }),
    stripe.invoices.list({
      customer: restaurant.stripe_customer_id,
      limit: 3,
    }),
  ])

  const paymentMethod =
    !customer.deleted &&
    customer.invoice_settings.default_payment_method &&
    typeof customer.invoice_settings.default_payment_method !== 'string' &&
    customer.invoice_settings.default_payment_method.type === 'card'
      ? customer.invoice_settings.default_payment_method.card?.last4 || null
      : null

  return {
    planName: restaurant.plan_name || 'Founding Restaurant',
    subscriptionStatus: restaurant.subscription_status || 'inactive',
    setupDate: formatBillingDate(
      restaurant.setup_paid_at || restaurant.created_at
    ),
    nextBillingDate: formatBillingDate(restaurant.billing_starts_at),
    paymentMethodLast4: paymentMethod,
    invoices: mapInvoices(invoices.data),
    hasPortalAccess: true,
  }
}

export async function createBillingPortalSession(
  restaurant: AdminRestaurantRecord
) {
  const stripe = getStripeServerClient()

  if (!stripe || !restaurant.stripe_customer_id) {
    throw new Error(
      'Stripe billing portal is not configured for this restaurant.'
    )
  }

  const publicEnv = getPublicEnv()

  const session = await stripe.billingPortal.sessions.create({
    customer: restaurant.stripe_customer_id,
    return_url: `${publicEnv.siteUrl}/admin/billing`,
  })

  return session.url
}
