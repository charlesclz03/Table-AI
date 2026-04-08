import { writeAuditLogAsync } from '@/lib/audit/server'
import type { AdminRestaurantRecord } from '@/lib/admin/types'
import { ensureServerOnly } from '@/lib/server-only'
import { getSupabaseServerClient } from '@/lib/supabase/server'

ensureServerOnly('lib/referrals')

export const REFERRAL_REWARD_MONTHS = 1
export const REFERRAL_BONUS_DAYS = 30

export interface ReferralCodeRecord {
  id: string
  restaurant_id: string
  code: string
  created_at?: string | null
}

export interface ReferralRecord {
  id: string
  referral_code_id?: string | null
  referrer_restaurant_id: string
  referred_restaurant_id: string
  code: string
  status: 'pending' | 'completed' | 'rewarded'
  reward_months: number
  referred_bonus_months: number
  applied_at?: string | null
  completed_at?: string | null
  rewarded_at?: string | null
  created_at?: string | null
}

export interface ReferralListItem extends ReferralRecord {
  referred_restaurant_name: string
}

export interface ReferralOverview {
  code: ReferralCodeRecord
  shareUrl: string
  signupsCount: number
  pendingCount: number
  pendingMonths: number
  convertedCount: number
  rewardedCount: number
  rewardedMonths: number
  convertedRestaurants: Array<{
    id: string
    name: string
    convertedAt: string | null
  }>
  referrals: ReferralListItem[]
}

function getServiceClient() {
  const client = getSupabaseServerClient({ serviceRole: true })

  if (!client) {
    throw new Error('Supabase is not configured.')
  }

  return client
}

function isUniqueViolation(error: { code?: string } | null | undefined) {
  return error?.code === '23505'
}

function slugifyRestaurantName(name: string) {
  return (
    name
      .normalize('NFKD')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toUpperCase()
      .slice(0, 12) || 'TABLE'
  )
}

function buildReferralCode(restaurantName: string) {
  const slug = slugifyRestaurantName(restaurantName)
  const shortId = crypto
    .randomUUID()
    .replace(/-/g, '')
    .slice(0, 6)
    .toUpperCase()
  return `GUSTIA-${slug}-${shortId}`
}

export function normalizeReferralCode(code: string) {
  return code.trim().toUpperCase()
}

async function findReferralCodeByRestaurant(restaurantId: string) {
  const client = getServiceClient()
  const { data, error } = await client
    .from('referral_codes')
    .select('id, restaurant_id, code, created_at')
    .eq('restaurant_id', restaurantId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return (data || null) as ReferralCodeRecord | null
}

async function findReferralCodeByValue(code: string) {
  const client = getServiceClient()
  const { data, error } = await client
    .from('referral_codes')
    .select('id, restaurant_id, code, created_at')
    .eq('code', normalizeReferralCode(code))
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return (data || null) as ReferralCodeRecord | null
}

async function findReferralByReferredRestaurant(referredRestaurantId: string) {
  const client = getServiceClient()
  const { data, error } = await client
    .from('referrals')
    .select(
      'id, referral_code_id, referrer_restaurant_id, referred_restaurant_id, code, status, reward_months, referred_bonus_months, applied_at, completed_at, rewarded_at, created_at'
    )
    .eq('referred_restaurant_id', referredRestaurantId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return (data || null) as ReferralRecord | null
}

export async function ensureReferralCode(input: {
  restaurantId: string
  restaurantName: string
}) {
  const existingCode = await findReferralCodeByRestaurant(input.restaurantId)

  if (existingCode) {
    return existingCode
  }

  const client = getServiceClient()

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = buildReferralCode(input.restaurantName)
    const { data, error } = await client
      .from('referral_codes')
      .insert({
        restaurant_id: input.restaurantId,
        code,
      })
      .select('id, restaurant_id, code, created_at')
      .single()

    if (!error) {
      return data as ReferralCodeRecord
    }

    if (isUniqueViolation(error)) {
      const retryExistingCode = await findReferralCodeByRestaurant(
        input.restaurantId
      )

      if (retryExistingCode) {
        return retryExistingCode
      }

      continue
    }

    throw new Error(error.message)
  }

  throw new Error('Unable to generate a unique referral code right now.')
}

export async function getReferralOverview(input: {
  restaurantId: string
  restaurantName: string
  siteUrl: string
}) {
  const client = getServiceClient()
  const code = await ensureReferralCode({
    restaurantId: input.restaurantId,
    restaurantName: input.restaurantName,
  })
  const { data, error } = await client
    .from('referrals')
    .select(
      'id, referral_code_id, referrer_restaurant_id, referred_restaurant_id, code, status, reward_months, referred_bonus_months, applied_at, completed_at, rewarded_at, created_at'
    )
    .eq('referrer_restaurant_id', input.restaurantId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  const referrals = (data || []) as ReferralRecord[]
  const referredRestaurantIds = referrals.map(
    (referral) => referral.referred_restaurant_id
  )

  const referredNameMap = new Map<string, string>()

  if (referredRestaurantIds.length > 0) {
    const { data: restaurants, error: restaurantsError } = await client
      .from('restaurants')
      .select('id, name')
      .in('id', referredRestaurantIds)

    if (restaurantsError) {
      throw new Error(restaurantsError.message)
    }

    for (const restaurant of restaurants || []) {
      referredNameMap.set(
        String(restaurant.id),
        String(restaurant.name || 'New restaurant')
      )
    }
  }

  const normalizedReferrals = referrals.map<ReferralListItem>((referral) => ({
    ...referral,
    referred_restaurant_name:
      referredNameMap.get(referral.referred_restaurant_id) || 'New restaurant',
  }))

  const pendingReferrals = normalizedReferrals.filter(
    (referral) => referral.status === 'pending'
  )
  const convertedReferrals = normalizedReferrals.filter(
    (referral) =>
      referral.status === 'completed' || referral.status === 'rewarded'
  )
  const rewardedReferrals = normalizedReferrals.filter(
    (referral) => referral.status === 'rewarded'
  )

  return {
    code,
    shareUrl: `${input.siteUrl.replace(/\/$/, '')}/auth/login?plan=monthly&ref=${encodeURIComponent(code.code)}`,
    signupsCount: normalizedReferrals.length,
    pendingCount: pendingReferrals.length,
    pendingMonths: pendingReferrals.reduce(
      (sum, referral) => sum + referral.reward_months,
      0
    ),
    convertedCount: convertedReferrals.length,
    rewardedCount: rewardedReferrals.length,
    rewardedMonths: rewardedReferrals.reduce(
      (sum, referral) => sum + referral.reward_months,
      0
    ),
    convertedRestaurants: convertedReferrals.map((referral) => ({
      id: referral.referred_restaurant_id,
      name: referral.referred_restaurant_name,
      convertedAt: referral.rewarded_at || referral.completed_at || null,
    })),
    referrals: normalizedReferrals,
  } satisfies ReferralOverview
}

export async function applyReferralCode(input: {
  code: string
  referredRestaurant: AdminRestaurantRecord
  request?: Request
}) {
  const client = getServiceClient()
  const normalizedCode = normalizeReferralCode(input.code)
  const referralCode = await findReferralCodeByValue(normalizedCode)

  if (!referralCode) {
    throw new Error('This referral code does not exist.')
  }

  if (referralCode.restaurant_id === input.referredRestaurant.id) {
    throw new Error('A restaurant cannot apply its own referral code.')
  }

  const existingReferral = await findReferralByReferredRestaurant(
    input.referredRestaurant.id
  )

  if (existingReferral) {
    if (existingReferral.code === normalizedCode) {
      return {
        alreadyApplied: true,
        referral: existingReferral,
      }
    }

    throw new Error(
      'A referral code has already been applied to this restaurant.'
    )
  }

  if (
    input.referredRestaurant.setup_paid_at ||
    input.referredRestaurant.stripe_subscription_id
  ) {
    throw new Error(
      'Referral codes can only be applied before the first checkout is completed.'
    )
  }

  const { data, error } = await client
    .from('referrals')
    .insert({
      referral_code_id: referralCode.id,
      referrer_restaurant_id: referralCode.restaurant_id,
      referred_restaurant_id: input.referredRestaurant.id,
      code: normalizedCode,
      status: 'pending',
      reward_months: REFERRAL_REWARD_MONTHS,
      referred_bonus_months: REFERRAL_REWARD_MONTHS,
    })
    .select(
      'id, referral_code_id, referrer_restaurant_id, referred_restaurant_id, code, status, reward_months, referred_bonus_months, applied_at, completed_at, rewarded_at, created_at'
    )
    .single()

  if (error) {
    throw new Error(error.message)
  }

  const { error: restaurantUpdateError } = await client
    .from('restaurants')
    .update({
      source: `referral:${normalizedCode}`,
    })
    .eq('id', input.referredRestaurant.id)

  if (restaurantUpdateError) {
    throw new Error(restaurantUpdateError.message)
  }

  writeAuditLogAsync({
    action: 'referral.applied',
    metadata: {
      code: normalizedCode,
      rewardMonths: REFERRAL_REWARD_MONTHS,
    },
    request: input.request,
    restaurantId: input.referredRestaurant.id,
    source: 'api.referral.apply',
    status: 'success',
    targetId: data.id,
  })

  return {
    alreadyApplied: false,
    referral: data as ReferralRecord,
  }
}

export async function getReferralTrialBonusDaysForRestaurant(
  referredRestaurantId: string
) {
  const referral = await findReferralByReferredRestaurant(referredRestaurantId)

  if (!referral) {
    return 0
  }

  return referral.referred_bonus_months * REFERRAL_BONUS_DAYS
}

export async function rewardReferralForPaidRestaurant(
  referredRestaurantId: string
) {
  const client = getServiceClient()
  const referral = await findReferralByReferredRestaurant(referredRestaurantId)

  if (!referral) {
    return null
  }

  if (referral.status === 'rewarded') {
    return referral
  }

  const now = new Date().toISOString()

  const { data, error } = await client
    .from('referrals')
    .update({
      status: 'rewarded',
      completed_at: referral.completed_at || now,
      rewarded_at: now,
    })
    .eq('id', referral.id)
    .select(
      'id, referral_code_id, referrer_restaurant_id, referred_restaurant_id, code, status, reward_months, referred_bonus_months, applied_at, completed_at, rewarded_at, created_at'
    )
    .single()

  if (error) {
    throw new Error(error.message)
  }

  writeAuditLogAsync({
    action: 'referral.rewarded',
    metadata: {
      code: referral.code,
      rewardMonths: referral.reward_months,
    },
    restaurantId: referral.referrer_restaurant_id,
    source: 'stripe.webhook',
    status: 'success',
    targetId: referral.id,
  })

  return data as ReferralRecord
}
