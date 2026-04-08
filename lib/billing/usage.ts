import { cookies } from 'next/headers'
import { getServerEnv } from '@/lib/server-env'
import { ensureServerOnly } from '@/lib/server-only'
import { getSupabaseServerClient } from '@/lib/supabase/server'

ensureServerOnly('lib/billing/usage')

const FREE_TIER_MONTHLY_QUERY_CAP = 50
const USAGE_WARNING_THRESHOLD_RATIO = 0.8

export const GUSTIA_USAGE_WARNING_HEADER = 'X-Gustia-Usage-Warning'
export const GUSTIA_USAGE_UPGRADE_URL = '/admin/billing'

interface UsageLogRecord {
  id: string
  query_count?: number | null
  period_start?: string | null
  period_end?: string | null
}

export interface RestaurantUsageSnapshot {
  blocked: boolean
  cap: number
  percentUsed: number
  periodEnd: string
  periodStart: string
  remaining: number
  upgradeUrl: string
  used: number
  warning: boolean
}

export interface RestaurantUsageWarning {
  cap: number
  message: string
  percentUsed: number
  remaining: number
  upgradeUrl: string
  used: number
}

function getCurrentUsagePeriod(now = new Date()) {
  const periodStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  )
  const periodEnd = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
  )

  return {
    periodStart: periodStart.toISOString().slice(0, 10),
    periodEnd: periodEnd.toISOString().slice(0, 10),
  }
}

function normalizeUsageCount(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : 0
}

function buildUsageSnapshot({
  periodEnd,
  periodStart,
  used,
}: {
  periodEnd: string
  periodStart: string
  used: number
}): RestaurantUsageSnapshot {
  const cap = FREE_TIER_MONTHLY_QUERY_CAP
  const remaining = Math.max(cap - used, 0)
  const percentUsed = cap > 0 ? Number(((used / cap) * 100).toFixed(1)) : 0
  const warningThreshold = Math.ceil(cap * USAGE_WARNING_THRESHOLD_RATIO)

  return {
    blocked: used >= cap,
    cap,
    percentUsed,
    periodEnd,
    periodStart,
    remaining,
    upgradeUrl: GUSTIA_USAGE_UPGRADE_URL,
    used,
    warning: used >= warningThreshold,
  }
}

function isMissingUsageLogsRelationError(errorMessage: string | undefined) {
  const message = errorMessage?.toLowerCase() || ''

  return (
    (message.includes('usage_logs') &&
      (message.includes('does not exist') ||
        message.includes('could not find the table'))) ||
    (message.includes('relation') &&
      message.includes('does not exist') &&
      message.includes('usage_logs'))
  )
}

function createUsageLogsError(errorMessage?: string) {
  if (isMissingUsageLogsRelationError(errorMessage)) {
    return new Error(
      'Supabase usage_logs is not configured. Apply the latest Supabase schema updates before enforcing chat usage caps.'
    )
  }

  return new Error(errorMessage || 'Unable to read usage logs.')
}

async function getUsageLogForCurrentPeriod(restaurantId: string) {
  const client = getSupabaseServerClient({ serviceRole: true })

  if (!client) {
    throw new Error('Supabase is not configured.')
  }

  const { periodEnd, periodStart } = getCurrentUsagePeriod()
  const { data, error } = await client
    .from('usage_logs')
    .select('id, query_count, period_start, period_end')
    .eq('restaurant_id', restaurantId)
    .eq('period_start', periodStart)
    .maybeSingle()

  if (error) {
    throw createUsageLogsError(error.message)
  }

  return {
    periodEnd,
    periodStart,
    record: (data as UsageLogRecord | null) || null,
  }
}

async function getAuthenticatedUserForUsageBypass() {
  const cookieStore = await cookies()
  const authClient = getSupabaseServerClient({
    cookies: {
      getAll: () =>
        cookieStore.getAll().map((cookie) => ({
          name: cookie.name,
          value: cookie.value,
        })),
      setAll: () => undefined,
    },
  })

  if (!authClient) {
    return null
  }

  const {
    data: { user },
    error,
  } = await authClient.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

export async function shouldBypassRestaurantUsageCap(restaurantId: string) {
  const user = await getAuthenticatedUserForUsageBypass()

  if (!user) {
    return false
  }

  const normalizedEmail = user.email?.trim().toLowerCase()
  const superadminEmails = getServerEnv().superadminEmails.map((email) =>
    email.trim().toLowerCase()
  )

  if (normalizedEmail && superadminEmails.includes(normalizedEmail)) {
    return true
  }

  const client = getSupabaseServerClient({ serviceRole: true })

  if (!client) {
    return false
  }

  const { data, error } = await client
    .from('restaurants')
    .select('id')
    .eq('id', restaurantId)
    .eq('owner_id', user.id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return Boolean(data?.id)
}

export async function getRestaurantUsageSnapshot(restaurantId: string) {
  const { periodEnd, periodStart, record } =
    await getUsageLogForCurrentPeriod(restaurantId)

  return buildUsageSnapshot({
    periodEnd,
    periodStart,
    used: normalizeUsageCount(record?.query_count),
  })
}

export async function incrementRestaurantUsage(restaurantId: string) {
  const client = getSupabaseServerClient({ serviceRole: true })

  if (!client) {
    throw new Error('Supabase is not configured.')
  }

  const { periodEnd, periodStart, record } =
    await getUsageLogForCurrentPeriod(restaurantId)

  if (record?.id) {
    const nextCount = normalizeUsageCount(record.query_count) + 1
    const { data, error } = await client
      .from('usage_logs')
      .update({
        period_end: periodEnd,
        query_count: nextCount,
      })
      .eq('id', record.id)
      .select('query_count')
      .single()

    if (error) {
      throw createUsageLogsError(error.message)
    }

    return buildUsageSnapshot({
      periodEnd,
      periodStart,
      used: normalizeUsageCount(data?.query_count),
    })
  }

  const { data, error } = await client
    .from('usage_logs')
    .insert({
      period_end: periodEnd,
      period_start: periodStart,
      query_count: 1,
      restaurant_id: restaurantId,
    })
    .select('query_count')
    .single()

  if (error) {
    throw createUsageLogsError(error.message)
  }

  return buildUsageSnapshot({
    periodEnd,
    periodStart,
    used: normalizeUsageCount(data?.query_count),
  })
}

export function getRestaurantUsageWarning(
  usage: RestaurantUsageSnapshot
): RestaurantUsageWarning | null {
  if (!usage.warning || usage.blocked) {
    return null
  }

  return {
    cap: usage.cap,
    message: `${usage.used}/${usage.cap} free queries used this month. ${usage.remaining} remaining before chat is blocked.`,
    percentUsed: usage.percentUsed,
    remaining: usage.remaining,
    upgradeUrl: usage.upgradeUrl,
    used: usage.used,
  }
}
