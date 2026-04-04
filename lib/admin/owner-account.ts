import {
  EMPTY_QUIZ_ANSWERS,
  type AdminOwnerRecord,
  type AdminRestaurantRecord,
} from '@/lib/admin/types'
import { ensureServerOnly } from '@/lib/server-only'
import { getSupabaseServerClient } from '@/lib/supabase/server'

ensureServerOnly('lib/admin/owner-account')

interface EnsureOwnerAccountParams {
  userId: string
  email?: string | null
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

function getOwnerDisplayName({
  email,
  ownerName,
}: Pick<EnsureOwnerAccountParams, 'email' | 'ownerName'>) {
  const normalizedOwnerName = toTitleCase(ownerName?.trim() || '')

  if (normalizedOwnerName) {
    return normalizedOwnerName
  }

  const emailPrefix = normalizeOwnerEmail(email || '').split('@')[0] || ''
  return toTitleCase(emailPrefix) || null
}

function getDefaultRestaurantPayload({
  userId,
  email,
  ownerName,
}: Required<EnsureOwnerAccountParams>) {
  const displayName = getOwnerDisplayName({ email, ownerName })

  return {
    owner_id: userId,
    email,
    name: displayName || 'Your Restaurant',
    menu_json: { items: [] },
    quiz_answers: EMPTY_QUIZ_ANSWERS,
    subscription_status: 'inactive',
    plan_name: 'Founding Restaurant',
  }
}

export async function ensureOwnerAccountForUser({
  userId,
  email,
  ownerName,
}: EnsureOwnerAccountParams): Promise<{
  owner: AdminOwnerRecord | null
  restaurant: AdminRestaurantRecord | null
}> {
  const normalizedEmail = normalizeOwnerEmail(email || '')

  if (!userId || !normalizedEmail) {
    return {
      owner: null,
      restaurant: null,
    }
  }

  const client = getSupabaseServerClient({ serviceRole: true })

  if (!client) {
    return {
      owner: null,
      restaurant: null,
    }
  }

  const { data: owner, error: ownerError } = await client
    .from('owners')
    .upsert(
      {
        id: userId,
        email: normalizedEmail,
        name: getOwnerDisplayName({ email: normalizedEmail, ownerName }),
      },
      {
        onConflict: 'id',
      }
    )
    .select('*')
    .single()

  if (ownerError) {
    throw new Error(ownerError.message)
  }

  const { data: restaurantByOwner, error: restaurantByOwnerError } =
    await client
      .from('restaurants')
      .select('*')
      .eq('owner_id', userId)
      .maybeSingle()

  if (restaurantByOwnerError) {
    throw new Error(restaurantByOwnerError.message)
  }

  if (restaurantByOwner) {
    return {
      owner: owner as AdminOwnerRecord,
      restaurant: restaurantByOwner as AdminRestaurantRecord,
    }
  }

  const { data: restaurantByEmail, error: restaurantByEmailError } =
    await client
      .from('restaurants')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle()

  if (restaurantByEmailError) {
    throw new Error(restaurantByEmailError.message)
  }

  if (restaurantByEmail) {
    const { data: claimedRestaurant, error: claimRestaurantError } =
      await client
        .from('restaurants')
        .update({
          owner_id: userId,
          email: normalizedEmail,
        })
        .eq('id', restaurantByEmail.id)
        .select('*')
        .single()

    if (claimRestaurantError) {
      throw new Error(claimRestaurantError.message)
    }

    return {
      owner: owner as AdminOwnerRecord,
      restaurant: claimedRestaurant as AdminRestaurantRecord,
    }
  }

  const { data: createdRestaurant, error: createRestaurantError } = await client
    .from('restaurants')
    .insert(
      getDefaultRestaurantPayload({
        userId,
        email: normalizedEmail,
        ownerName: ownerName ?? null,
      })
    )
    .select('*')
    .single()

  if (createRestaurantError) {
    throw new Error(createRestaurantError.message)
  }

  return {
    owner: owner as AdminOwnerRecord,
    restaurant: createdRestaurant as AdminRestaurantRecord,
  }
}
