import type {
  AdminAnalyticsPayload,
  AdminAnalyticsRange,
  AdminAnalyticsRecord,
  AdminDishStat,
  AdminEngagementMetrics,
  AdminLanguageStat,
  AdminMonthlyVolumePoint,
  AdminPeakUsage,
  AdminPeakHourSlot,
  AdminQuestionStat,
  AdminRevenuePoint,
  AdminRestaurantRecord,
  AdminUsagePoint,
  ConversationMessage,
  ConversationRecord,
} from '@/lib/admin/types'
import { ensureServerOnly } from '@/lib/server-only'
import { getStripeServerClient } from '@/lib/stripe'
import { getSupabaseServerClient } from '@/lib/supabase/server'

ensureServerOnly('lib/analytics')

const DEFAULT_RESPONSE_PREVIEW_LENGTH = 220
const QUESTION_RECOMMENDATION_PATTERN =
  /\b(recommend|recommendation|suggest|special|signature|best|popular|order)\b/i

function createEmptyAnalyticsPayload(
  range: AdminAnalyticsRange
): AdminAnalyticsPayload {
  const emptyMonthlyRevenue = createMonthSeries().map((point) => ({
    month: point.month,
    label: point.label,
    amount: 0,
    currency: 'eur',
  }))

  return {
    range,
    totals: {
      selected: 0,
      previousPeriod: 0,
      last7Days: 0,
      last30Days: 0,
    },
    avgMessagesPerConversation: 0,
    peakUsage: {
      hourLabel: 'No traffic yet',
      hour: null,
      dayLabel: 'No traffic yet',
      day: null,
    },
    peakHourSlots: buildPeakHourSlots([]),
    languageDistribution: [],
    topQuestions: [],
    usageByDay: [],
    topDishes: [],
    monthlyChatVolume: createMonthSeries().map((point) => ({
      month: point.month,
      label: point.label,
      count: 0,
    })),
    monthlyRevenue: emptyMonthlyRevenue,
    engagement: {
      followUpRate: 0,
      recommendationRate: 0,
      avgGuestMessages: 0,
    },
    generatedAt: new Date().toISOString(),
  }
}

function isValidDate(value?: string | null) {
  if (!value) {
    return false
  }

  return !Number.isNaN(new Date(value).getTime())
}

function createUtcDayKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function createUtcMonthKey(date: Date) {
  return date.toISOString().slice(0, 7)
}

function shiftDateByDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setUTCDate(nextDate.getUTCDate() + days)
  return nextDate
}

function shiftDateByMonths(date: Date, months: number) {
  const nextDate = new Date(date)
  nextDate.setUTCMonth(nextDate.getUTCMonth() + months)
  return nextDate
}

function startOfUtcDay(date: Date) {
  const nextDate = new Date(date)
  nextDate.setUTCHours(0, 0, 0, 0)
  return nextDate
}

function startOfUtcMonth(date: Date) {
  const nextDate = new Date(date)
  nextDate.setUTCDate(1)
  nextDate.setUTCHours(0, 0, 0, 0)
  return nextDate
}

function formatHourLabel(hour: number) {
  const normalizedHour = ((hour % 24) + 24) % 24
  const suffix = normalizedHour >= 12 ? 'PM' : 'AM'
  const hour12 = normalizedHour % 12 || 12
  return `${hour12} ${suffix}`
}

function formatWeekday(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone: 'UTC',
  }).format(date)
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    timeZone: 'UTC',
  }).format(date)
}

function createMonthSeries(monthCount = 6) {
  const currentMonth = startOfUtcMonth(new Date())
  const firstMonth = shiftDateByMonths(currentMonth, -(monthCount - 1))

  return Array.from({ length: monthCount }, (_, index) => {
    const monthDate = shiftDateByMonths(firstMonth, index)

    return {
      month: createUtcMonthKey(monthDate),
      label: formatMonthLabel(monthDate),
    }
  })
}

export function normalizeConversationMessages(
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

export function normalizeQuestionText(question: string) {
  return question
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function sanitizeAnalyticsText(value: string, maxLength = 280) {
  return value
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[redacted email]')
    .replace(/\b(?:https?:\/\/|www\.)\S+\b/gi, '[redacted link]')
    .replace(/(?<!\w)(?:\+?\d[\d\s().-]{7,}\d)(?!\w)/g, '[redacted phone]')
    .replace(/\b\d{12,19}\b/g, '[redacted number]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

function getMenuItems(menu: AdminRestaurantRecord['menu_json']) {
  if (Array.isArray(menu)) {
    return menu
  }

  if (menu && Array.isArray(menu.items)) {
    return menu.items
  }

  return []
}

function isMissingRelationError(
  errorMessage: string | undefined,
  relationName: string
) {
  const message = errorMessage?.toLowerCase() || ''

  return (
    (message.includes('could not find the table') ||
      (message.includes('relation') && message.includes('does not exist'))) &&
    message.includes(relationName.toLowerCase())
  )
}

function buildRangeBounds(range: AdminAnalyticsRange) {
  const now = new Date()
  const last7Start = shiftDateByDays(now, -7)
  const last30Start = shiftDateByDays(now, -30)
  const previous7Start = shiftDateByDays(now, -14)
  const previous30Start = shiftDateByDays(now, -60)

  return {
    now,
    last7Start,
    last30Start,
    previous7Start,
    previous30Start,
    selectedStart:
      range === 'all' ? null : range === '30' ? last30Start : last7Start,
    comparisonStart:
      range === 'all'
        ? last30Start
        : range === '30'
          ? previous30Start
          : previous7Start,
  }
}

function isRecordInRange(
  value: string | null | undefined,
  start: Date | null,
  end?: Date
) {
  if (!isValidDate(value)) {
    return false
  }

  const date = new Date(value as string)

  if (start && date < start) {
    return false
  }

  if (end && date >= end) {
    return false
  }

  return true
}

function buildUsageSeries(
  conversations: ConversationRecord[]
): AdminUsagePoint[] {
  const today = startOfUtcDay(new Date())
  const firstDay = shiftDateByDays(today, -13)
  const counts = new Map<string, number>()

  for (let index = 0; index < 14; index += 1) {
    const day = shiftDateByDays(firstDay, index)
    counts.set(createUtcDayKey(day), 0)
  }

  for (const conversation of conversations) {
    if (!isRecordInRange(conversation.created_at, firstDay)) {
      continue
    }

    const dayKey = createUtcDayKey(
      startOfUtcDay(new Date(conversation.created_at!))
    )

    if (!counts.has(dayKey)) {
      continue
    }

    counts.set(dayKey, (counts.get(dayKey) || 0) + 1)
  }

  return [...counts.entries()].map(([date, count]) => ({
    date,
    label: formatShortDate(new Date(`${date}T00:00:00.000Z`)),
    count,
  }))
}

function buildMonthlyChatVolume(
  conversations: ConversationRecord[]
): AdminMonthlyVolumePoint[] {
  const monthSeries = createMonthSeries()
  const firstMonthKey = monthSeries[0]?.month || createUtcMonthKey(new Date())
  const counts = new Map(monthSeries.map((point) => [point.month, 0]))

  for (const conversation of conversations) {
    if (!isValidDate(conversation.created_at)) {
      continue
    }

    const monthKey = createUtcMonthKey(new Date(conversation.created_at!))

    if (monthKey < firstMonthKey || !counts.has(monthKey)) {
      continue
    }

    counts.set(monthKey, (counts.get(monthKey) || 0) + 1)
  }

  return monthSeries.map((point) => ({
    month: point.month,
    label: point.label,
    count: counts.get(point.month) || 0,
  }))
}

function getAverageMessagesPerConversation(
  conversations: ConversationRecord[]
) {
  if (conversations.length === 0) {
    return 0
  }

  const totalMessages = conversations.reduce(
    (sum, conversation) =>
      sum + normalizeConversationMessages(conversation.messages).length,
    0
  )

  return Number((totalMessages / conversations.length).toFixed(1))
}

function getTopQuestions(
  conversations: ConversationRecord[]
): AdminQuestionStat[] {
  const counts = new Map<
    string,
    { count: number; original: string; conversationIds: Set<string> }
  >()

  for (const conversation of conversations) {
    const messages = normalizeConversationMessages(conversation.messages)

    for (const message of messages) {
      const questionText =
        message.role === 'user'
          ? sanitizeAnalyticsText(message.content || '')
          : ''
      const normalized = normalizeQuestionText(questionText)

      if (!normalized) {
        continue
      }

      const existing = counts.get(normalized) || {
        count: 0,
        original: questionText,
        conversationIds: new Set<string>(),
      }

      existing.count += 1
      existing.conversationIds.add(conversation.id)
      counts.set(normalized, existing)
    }
  }

  const totalConversations = conversations.length || 1

  return [...counts.values()]
    .sort((left, right) => right.count - left.count)
    .slice(0, 10)
    .map((entry) => ({
      text: entry.original,
      count: entry.count,
      conversationShare: Number(
        ((entry.conversationIds.size / totalConversations) * 100).toFixed(1)
      ),
    }))
}

function getPeakUsage(conversations: ConversationRecord[]): AdminPeakUsage {
  if (conversations.length === 0) {
    return {
      hourLabel: 'No traffic yet',
      hour: null,
      dayLabel: 'No traffic yet',
      day: null,
    }
  }

  const hourCounts = new Map<number, number>()
  const dayCounts = new Map<string, number>()

  for (const conversation of conversations) {
    if (!isValidDate(conversation.created_at)) {
      continue
    }

    const date = new Date(conversation.created_at!)
    const hour = date.getUTCHours()
    const dayLabel = formatWeekday(date)

    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1)
    dayCounts.set(dayLabel, (dayCounts.get(dayLabel) || 0) + 1)
  }

  const topHourEntry =
    [...hourCounts.entries()].sort((left, right) => right[1] - left[1])[0] ||
    null
  const topDayEntry =
    [...dayCounts.entries()].sort((left, right) => right[1] - left[1])[0] ||
    null

  return {
    hour: topHourEntry?.[0] ?? null,
    hourLabel: topHourEntry
      ? formatHourLabel(topHourEntry[0])
      : 'No traffic yet',
    day: topDayEntry?.[0] ?? null,
    dayLabel: topDayEntry?.[0] || 'No traffic yet',
  }
}

function getLanguageDistribution(
  analyticsRows: AdminAnalyticsRecord[],
  fallbackConversationCount: number
): AdminLanguageStat[] {
  const counts = new Map<string, number>()

  for (const row of analyticsRows) {
    const language = row.language?.trim().toLowerCase() || 'unknown'
    counts.set(language, (counts.get(language) || 0) + 1)
  }

  if (counts.size === 0 && fallbackConversationCount > 0) {
    counts.set('unknown', fallbackConversationCount)
  }

  const total = [...counts.values()].reduce((sum, value) => sum + value, 0) || 1

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([language, count]) => ({
      language,
      label: language === 'unknown' ? 'Unknown' : language.toUpperCase(),
      count,
      share: Number(((count / total) * 100).toFixed(1)),
    }))
}

export function trackDishMention(input: {
  counts: Map<string, number>
  dishName: string
  content: string
}) {
  const normalizedDish = normalizeQuestionText(input.dishName)
  const normalizedContent = normalizeQuestionText(input.content)

  if (!normalizedDish || !normalizedContent.includes(normalizedDish)) {
    return false
  }

  input.counts.set(input.dishName, (input.counts.get(input.dishName) || 0) + 1)
  return true
}

export function getTopDishes(
  analyticsRows: AdminAnalyticsRecord[],
  restaurant: AdminRestaurantRecord,
  limit = 5
): AdminDishStat[] {
  const menuItems = getMenuItems(restaurant.menu_json)
  const menuNames = menuItems
    .map((item) => item.name?.trim())
    .filter((item): item is string => Boolean(item))
  const counts = new Map<string, number>()

  for (const row of analyticsRows) {
    const combinedContent = [
      row.question_text?.trim() || '',
      row.response_preview?.trim() || '',
    ]
      .filter(Boolean)
      .join(' ')

    for (const dishName of menuNames) {
      void trackDishMention({
        counts,
        dishName,
        content: combinedContent,
      })
    }
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([name, count]) => ({
      name,
      count,
    }))
}

function buildPeakHourSlots(
  conversations: ConversationRecord[]
): AdminPeakHourSlot[] {
  const slots = [12, 14, 19, 21]
  const counts = new Map(slots.map((hour) => [hour, 0]))

  for (const conversation of conversations) {
    if (!isValidDate(conversation.created_at)) {
      continue
    }

    const hour = new Date(conversation.created_at!).getUTCHours()

    if (!counts.has(hour)) {
      continue
    }

    counts.set(hour, (counts.get(hour) || 0) + 1)
  }

  const total = [...counts.values()].reduce((sum, count) => sum + count, 0) || 1

  return slots.map((hour) => {
    const count = counts.get(hour) || 0

    return {
      hour,
      label: formatHourLabel(hour),
      count,
      share: Number(((count / total) * 100).toFixed(1)),
    }
  })
}

async function getMonthlyRevenue(
  restaurant: AdminRestaurantRecord
): Promise<AdminRevenuePoint[]> {
  const monthSeries = createMonthSeries()
  const revenueByMonth = new Map(
    monthSeries.map((point) => [
      point.month,
      {
        month: point.month,
        label: point.label,
        amount: 0,
        currency: 'eur',
      },
    ])
  )
  const stripe = getStripeServerClient()

  if (!stripe || !restaurant.stripe_customer_id) {
    return [...revenueByMonth.values()]
  }

  const firstMonth = startOfUtcMonth(
    shiftDateByMonths(new Date(), -(monthSeries.length - 1))
  )
  const invoices = await stripe.invoices.list({
    customer: restaurant.stripe_customer_id,
    created: {
      gte: Math.floor(firstMonth.getTime() / 1000),
    },
    limit: 100,
  })

  for (const invoice of invoices.data) {
    if (invoice.status !== 'paid' || !invoice.created) {
      continue
    }

    const monthKey = createUtcMonthKey(new Date(invoice.created * 1000))
    const current = revenueByMonth.get(monthKey)

    if (!current) {
      continue
    }

    current.amount = Number(
      (current.amount + (invoice.amount_paid || 0) / 100).toFixed(2)
    )
    current.currency = invoice.currency || current.currency
  }

  return [...revenueByMonth.values()]
}

function getEngagementMetrics(
  conversations: ConversationRecord[],
  analyticsRows: AdminAnalyticsRecord[]
): AdminEngagementMetrics {
  if (conversations.length === 0) {
    return {
      followUpRate: 0,
      recommendationRate: 0,
      avgGuestMessages: 0,
    }
  }

  const conversationsWithFollowUps = conversations.filter((conversation) => {
    const guestMessages = normalizeConversationMessages(
      conversation.messages
    ).filter((message) => message.role === 'user' && message.content?.trim())

    return guestMessages.length >= 2
  }).length

  const recommendationConversationIds = new Set(
    analyticsRows
      .filter((row) =>
        QUESTION_RECOMMENDATION_PATTERN.test(row.question_text || '')
      )
      .map((row) => row.conversation_id)
      .filter(Boolean)
  )

  const totalGuestMessages = conversations.reduce((sum, conversation) => {
    return (
      sum +
      normalizeConversationMessages(conversation.messages).filter(
        (message) => message.role === 'user' && message.content?.trim()
      ).length
    )
  }, 0)

  return {
    followUpRate: Number(
      ((conversationsWithFollowUps / conversations.length) * 100).toFixed(1)
    ),
    recommendationRate: Number(
      (
        (recommendationConversationIds.size / conversations.length) *
        100
      ).toFixed(1)
    ),
    avgGuestMessages: Number(
      (totalGuestMessages / conversations.length).toFixed(1)
    ),
  }
}

export function parseAnalyticsRange(
  value: string | null | undefined
): AdminAnalyticsRange {
  if (value === '30' || value === 'all') {
    return value
  }

  return '7'
}

export async function persistConversationAnalytics(input: {
  conversationId: string
  tableNumber?: string | null
  language?: string | null
  questionText: string
  responsePreview: string
  restaurant: Pick<AdminRestaurantRecord, 'id'>
  messages: ConversationMessage[]
}) {
  const client = getSupabaseServerClient({ serviceRole: true })

  if (!client) {
    return
  }

  const sanitizedQuestion = sanitizeAnalyticsText(input.questionText)
  const sanitizedResponse = sanitizeAnalyticsText(
    input.responsePreview,
    DEFAULT_RESPONSE_PREVIEW_LENGTH
  )

  if (!sanitizedQuestion || !sanitizedResponse) {
    return
  }

  const { error: conversationError } = await client
    .from('conversations')
    .upsert(
      {
        id: input.conversationId,
        restaurant_id: input.restaurant.id,
        table_number: input.tableNumber?.trim() || null,
        messages: input.messages,
      },
      {
        onConflict: 'id',
      }
    )

  if (conversationError) {
    throw new Error(conversationError.message)
  }

  const { error: analyticsError } = await client
    .from('conversation_analytics')
    .insert({
      restaurant_id: input.restaurant.id,
      conversation_id: input.conversationId,
      question_text: sanitizedQuestion,
      response_preview: sanitizedResponse,
      language: input.language?.trim().toLowerCase() || 'unknown',
    })

  if (
    analyticsError &&
    !isMissingRelationError(analyticsError.message, 'conversation_analytics')
  ) {
    throw new Error(analyticsError.message)
  }
}

export async function getRestaurantAnalytics(
  restaurant: AdminRestaurantRecord,
  range: AdminAnalyticsRange
): Promise<AdminAnalyticsPayload> {
  const client = getSupabaseServerClient({ serviceRole: true })

  if (!client) {
    return createEmptyAnalyticsPayload(range)
  }

  const [
    { data: conversationRows, error: conversationsError },
    { data: analyticsRows, error: analyticsError },
    monthlyRevenue,
  ] = await Promise.all([
    client
      .from('conversations')
      .select('id, table_number, messages, created_at')
      .eq('restaurant_id', restaurant.id)
      .order('created_at', { ascending: false }),
    client
      .from('conversation_analytics')
      .select(
        'id, restaurant_id, conversation_id, question_text, response_preview, language, created_at'
      )
      .eq('restaurant_id', restaurant.id)
      .order('created_at', { ascending: false }),
    getMonthlyRevenue(restaurant),
  ])

  if (conversationsError) {
    throw new Error(conversationsError.message)
  }

  if (
    analyticsError &&
    !isMissingRelationError(analyticsError.message, 'conversation_analytics')
  ) {
    throw new Error(analyticsError.message)
  }

  const conversations = (conversationRows as ConversationRecord[] | null) || []
  const analytics = isMissingRelationError(
    analyticsError?.message,
    'conversation_analytics'
  )
    ? []
    : (analyticsRows as AdminAnalyticsRecord[] | null) || []
  const bounds = buildRangeBounds(range)

  const last7Conversations = conversations.filter((conversation) =>
    isRecordInRange(conversation.created_at, bounds.last7Start)
  )
  const previous7Conversations = conversations.filter((conversation) =>
    isRecordInRange(
      conversation.created_at,
      bounds.previous7Start,
      bounds.last7Start
    )
  )
  const last30Conversations = conversations.filter((conversation) =>
    isRecordInRange(conversation.created_at, bounds.last30Start)
  )
  const previous30Conversations = conversations.filter((conversation) =>
    isRecordInRange(
      conversation.created_at,
      bounds.previous30Start,
      bounds.last30Start
    )
  )
  const selectedConversations = bounds.selectedStart
    ? conversations.filter((conversation) =>
        isRecordInRange(conversation.created_at, bounds.selectedStart)
      )
    : conversations
  const selectedAnalytics = bounds.selectedStart
    ? analytics.filter((row) =>
        isRecordInRange(row.created_at, bounds.selectedStart)
      )
    : analytics

  return {
    range,
    totals: {
      selected: selectedConversations.length,
      previousPeriod:
        range === 'all'
          ? last30Conversations.length
          : range === '30'
            ? previous30Conversations.length
            : previous7Conversations.length,
      last7Days: last7Conversations.length,
      last30Days: last30Conversations.length,
    },
    avgMessagesPerConversation: getAverageMessagesPerConversation(
      selectedConversations
    ),
    peakUsage: getPeakUsage(selectedConversations),
    peakHourSlots: buildPeakHourSlots(selectedConversations),
    languageDistribution: getLanguageDistribution(
      selectedAnalytics,
      selectedConversations.length
    ),
    topQuestions: getTopQuestions(selectedConversations),
    usageByDay: buildUsageSeries(conversations),
    topDishes: getTopDishes(selectedAnalytics, restaurant),
    monthlyChatVolume: buildMonthlyChatVolume(conversations),
    monthlyRevenue,
    engagement: getEngagementMetrics(selectedConversations, selectedAnalytics),
    generatedAt: new Date().toISOString(),
  }
}
