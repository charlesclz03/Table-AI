import {
  EMPTY_QUIZ_ANSWERS,
  type AdminOwnerRecord,
  type AdminRestaurantRecord,
} from '@/lib/admin/types'
import { syncConvertedWaitlistLead } from '@/lib/admin/leads'
import { writeAuditLogAsync } from '@/lib/audit/server'
import { ensureServerOnly } from '@/lib/server-only'
import { getSupabaseServerClient } from '@/lib/supabase/server'

ensureServerOnly('lib/admin/owner-account')

interface EnsureOwnerAccountParams {
  allowRestaurantClaim?: boolean
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
}: {
  userId: string
  email: string
  ownerName: string | null
}) {
  const displayName = getOwnerDisplayName({ email, ownerName })

  return {
    owner_id: userId,
    email,
    name: displayName || 'Your Restaurant',
    menu_json: { items: [] },
    quiz_answers: EMPTY_QUIZ_ANSWERS,
    source: 'direct',
    subscription_status: 'inactive',
    plan_name: 'Founding Restaurant',
  }
}

function isMissingTableError(
  errorMessage: string | undefined,
  tableName: string
) {
  const message = errorMessage?.toLowerCase() || ''

  return (
    message.includes(tableName.toLowerCase()) &&
    (message.includes('does not exist') ||
      message.includes('could not find the table'))
  )
}

export async function ensureOwnerAccountForUser({
  allowRestaurantClaim = true,
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

  if (allowRestaurantClaim) {
    const { data: invite, error: inviteError } = await client
      .from('restaurant_owner_invites')
      .select('id, restaurant_id')
      .eq('invitee_email', normalizedEmail)
      .is('accepted_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (
      inviteError &&
      !isMissingTableError(inviteError.message, 'restaurant_owner_invites')
    ) {
      throw new Error(inviteError.message)
    }

    if (invite?.restaurant_id) {
      const { data: claimedRestaurant, error: claimRestaurantError } =
        await client
          .from('restaurants')
          .update({
            owner_id: userId,
            email: normalizedEmail,
          })
          .eq('id', invite.restaurant_id)
          .is('owner_id', null)
          .select('*')
          .single()

      if (claimRestaurantError) {
        throw new Error(claimRestaurantError.message)
      }

      const { error: inviteUpdateError } = await client
        .from('restaurant_owner_invites')
        .update({
          accepted_at: new Date().toISOString(),
          accepted_by_owner_id: userId,
        })
        .eq('id', invite.id)

      if (
        inviteUpdateError &&
        !isMissingTableError(
          inviteUpdateError.message,
          'restaurant_owner_invites'
        )
      ) {
        throw new Error(inviteUpdateError.message)
      }

      writeAuditLogAsync({
        action: 'owner.restaurant_claimed',
        actorId: userId,
        restaurantId: claimedRestaurant.id,
        source: 'owner-account.ensure',
        status: 'success',
        targetId: invite.id,
      })

      await syncConvertedWaitlistLead({
        email: normalizedEmail,
        restaurantId: claimedRestaurant.id,
      })

      return {
        owner: owner as AdminOwnerRecord,
        restaurant: claimedRestaurant as AdminRestaurantRecord,
      }
    }
  }

  const { data: restaurantByEmail, error: restaurantByEmailError } =
    await client
      .from('restaurants')
      .select('id, owner_id')
      .eq('email', normalizedEmail)
      .maybeSingle()

  if (restaurantByEmailError) {
    throw new Error(restaurantByEmailError.message)
  }

  if (restaurantByEmail && !restaurantByEmail.owner_id) {
    writeAuditLogAsync({
      action: 'owner.restaurant_claim_blocked',
      actorId: userId,
      metadata: {
        email: normalizedEmail,
      },
      reason: 'matching_restaurant_requires_invite',
      restaurantId: restaurantByEmail.id,
      source: 'owner-account.ensure',
      status: 'blocked',
    })
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

  writeAuditLogAsync({
    action: 'owner.restaurant_created',
    actorId: userId,
    restaurantId: createdRestaurant.id,
    source: 'owner-account.ensure',
    status: 'success',
  })

  await syncConvertedWaitlistLead({
    email: normalizedEmail,
    restaurantId: createdRestaurant.id,
  })

  return {
    owner: owner as AdminOwnerRecord,
    restaurant: createdRestaurant as AdminRestaurantRecord,
  }
}
