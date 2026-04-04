import {
  EMPTY_QUIZ_ANSWERS,
  type AdminRestaurantRecord,
} from '@/lib/admin/types'
import { ensureServerOnly } from '@/lib/server-only'
import { getSupabaseServerClient } from '@/lib/supabase/server'

ensureServerOnly('lib/admin/owner-restaurant')

interface EnsureRestaurantForOwnerParams {
  email: string
  ownerName?: string | null
}

function normalizeOwnerEmail(email: string) {
  return email.trim().toLowerCase()
}

function toTitleCase(value: string) {
  return value
    .split(/[\s._-]+/)
    .map((part) => {
      const trimmed = part.trim()

      if (!trimmed) {
        return ''
      }

      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
    })
    .filter(Boolean)
    .join(' ')
}

function getDefaultRestaurantName({
  email,
  ownerName,
}: EnsureRestaurantForOwnerParams) {
  const emailPrefix = email.split('@')[0] || ''
  const normalizedEmailName = toTitleCase(emailPrefix)
  const normalizedOwnerName = toTitleCase(ownerName?.trim() || '')

  return normalizedEmailName || normalizedOwnerName || 'Your Restaurant'
}

function getDefaultRestaurantPayload({
  email,
  ownerName,
}: EnsureRestaurantForOwnerParams) {
  return {
    email: normalizeOwnerEmail(email),
    name: getDefaultRestaurantName({ email, ownerName }),
    menu_json: { items: [] },
    quiz_answers: EMPTY_QUIZ_ANSWERS,
    subscription_status: 'inactive',
    plan_name: 'Founding Restaurant',
  }
}

export async function ensureRestaurantForOwner({
  email,
  ownerName,
}: EnsureRestaurantForOwnerParams): Promise<AdminRestaurantRecord | null> {
  const normalizedEmail = normalizeOwnerEmail(email)

  if (!normalizedEmail) {
    return null
  }

  const client = getSupabaseServerClient({ serviceRole: true })

  if (!client) {
    return null
  }

  const { data: existingRestaurant, error: existingRestaurantError } =
    await client
      .from('restaurants')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle()

  if (existingRestaurantError) {
    throw new Error(existingRestaurantError.message)
  }

  if (existingRestaurant) {
    return existingRestaurant as AdminRestaurantRecord
  }

  const { data: createdRestaurant, error: createRestaurantError } = await client
    .from('restaurants')
    .insert(getDefaultRestaurantPayload({ email: normalizedEmail, ownerName }))
    .select('*')
    .single()

  if (!createRestaurantError && createdRestaurant) {
    return createdRestaurant as AdminRestaurantRecord
  }

  const { data: fallbackRestaurant, error: fallbackRestaurantError } =
    await client
      .from('restaurants')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle()

  if (fallbackRestaurantError) {
    throw new Error(fallbackRestaurantError.message)
  }

  if (fallbackRestaurant) {
    return fallbackRestaurant as AdminRestaurantRecord
  }

  throw new Error(
    createRestaurantError?.message ||
      'Unable to create a restaurant for this owner account.'
  )
}
