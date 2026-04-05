import { writeAuditLogAsync } from '@/lib/audit/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { ensureServerOnly } from '@/lib/server-only'

ensureServerOnly('lib/admin/invites')

export interface RestaurantInviteRecord {
  id: string
  restaurant_id: string
  invitee_email: string
  invited_by_owner_id?: string | null
  accepted_by_owner_id?: string | null
  invite_token?: string | null
  accepted_at?: string | null
  created_at?: string | null
}

export interface InviteRestaurantRecord {
  id: string
  name: string
  owner_id?: string | null
}

export function normalizeInviteEmail(email: string) {
  return email.trim().toLowerCase()
}

function buildInviteToken() {
  return crypto.randomUUID().replace(/-/g, '')
}

function getServiceClient() {
  const client = getSupabaseServerClient({ serviceRole: true })

  if (!client) {
    throw new Error('Supabase is not configured.')
  }

  return client
}

function getOwnerDisplayName({
  email,
  ownerName,
}: {
  email: string
  ownerName?: string | null
}) {
  const normalizedName = ownerName?.trim()

  if (normalizedName) {
    return normalizedName
  }

  const prefix = normalizeInviteEmail(email).split('@')[0] || 'Owner'
  return prefix.charAt(0).toUpperCase() + prefix.slice(1)
}

export async function listRestaurantInvites(restaurantId: string) {
  const client = getServiceClient()
  const { data, error } = await client
    .from('restaurant_owner_invites')
    .select(
      'id, restaurant_id, invitee_email, invited_by_owner_id, accepted_by_owner_id, invite_token, accepted_at, created_at'
    )
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data || []) as RestaurantInviteRecord[]
}

export async function createRestaurantInvite(input: {
  invitedByOwnerId?: string | null
  inviteeEmail: string
  restaurantId: string
}) {
  const client = getServiceClient()
  const normalizedEmail = normalizeInviteEmail(input.inviteeEmail)
  const inviteToken = buildInviteToken()

  const { data: existingInvite, error: existingInviteError } = await client
    .from('restaurant_owner_invites')
    .select(
      'id, restaurant_id, invitee_email, invited_by_owner_id, accepted_by_owner_id, invite_token, accepted_at, created_at'
    )
    .eq('restaurant_id', input.restaurantId)
    .eq('invitee_email', normalizedEmail)
    .is('accepted_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existingInviteError) {
    throw new Error(existingInviteError.message)
  }

  if (existingInvite?.id) {
    const { data, error } = await client
      .from('restaurant_owner_invites')
      .update({
        invite_token: inviteToken,
        invited_by_owner_id: input.invitedByOwnerId || null,
      })
      .eq('id', existingInvite.id)
      .select(
        'id, restaurant_id, invitee_email, invited_by_owner_id, accepted_by_owner_id, invite_token, accepted_at, created_at'
      )
      .single()

    if (error) {
      throw new Error(error.message)
    }

    writeAuditLogAsync({
      action: 'owner.invite_refreshed',
      actorId: input.invitedByOwnerId || null,
      metadata: {
        inviteeEmail: normalizedEmail,
      },
      restaurantId: input.restaurantId,
      source: 'admin.invites',
      status: 'success',
      targetId: data.id,
    })

    return data as RestaurantInviteRecord
  }

  const { data, error } = await client
    .from('restaurant_owner_invites')
    .insert({
      restaurant_id: input.restaurantId,
      invitee_email: normalizedEmail,
      invited_by_owner_id: input.invitedByOwnerId || null,
      invite_token: inviteToken,
    })
    .select(
      'id, restaurant_id, invitee_email, invited_by_owner_id, accepted_by_owner_id, invite_token, accepted_at, created_at'
    )
    .single()

  if (error) {
    throw new Error(error.message)
  }

  writeAuditLogAsync({
    action: 'owner.invite_created',
    actorId: input.invitedByOwnerId || null,
    metadata: {
      inviteeEmail: normalizedEmail,
    },
    restaurantId: input.restaurantId,
    source: 'admin.invites',
    status: 'success',
    targetId: data.id,
  })

  return data as RestaurantInviteRecord
}

export async function getInviteByCode(code: string) {
  const client = getServiceClient()
  const { data: invite, error: inviteError } = await client
    .from('restaurant_owner_invites')
    .select(
      'id, restaurant_id, invitee_email, invited_by_owner_id, accepted_by_owner_id, invite_token, accepted_at, created_at'
    )
    .eq('invite_token', code)
    .maybeSingle()

  if (inviteError) {
    throw new Error(inviteError.message)
  }

  if (!invite) {
    return {
      invite: null,
      restaurant: null,
    }
  }

  const { data: restaurant, error: restaurantError } = await client
    .from('restaurants')
    .select('id, name, owner_id')
    .eq('id', invite.restaurant_id)
    .maybeSingle()

  if (restaurantError) {
    throw new Error(restaurantError.message)
  }

  return {
    invite: invite as RestaurantInviteRecord,
    restaurant: (restaurant || null) as InviteRestaurantRecord | null,
  }
}

export async function claimInviteByCode(input: {
  code: string
  ownerName?: string | null
  request?: Request
  userEmail: string
  userId: string
}) {
  const client = getServiceClient()
  const normalizedEmail = normalizeInviteEmail(input.userEmail)
  const { invite, restaurant } = await getInviteByCode(input.code)

  if (!invite || !restaurant) {
    throw new Error('This invite link is invalid or has expired.')
  }

  if (normalizeInviteEmail(invite.invitee_email) !== normalizedEmail) {
    throw new Error(
      `This invite was sent to ${invite.invitee_email}. Please sign in with that email address.`
    )
  }

  const { error: ownerError } = await client.from('owners').upsert(
    {
      id: input.userId,
      email: normalizedEmail,
      name: getOwnerDisplayName({
        email: normalizedEmail,
        ownerName: input.ownerName,
      }),
    },
    {
      onConflict: 'id',
    }
  )

  if (ownerError) {
    throw new Error(ownerError.message)
  }

  if (restaurant.owner_id && restaurant.owner_id !== input.userId) {
    throw new Error('This restaurant has already been claimed.')
  }

  const { data: claimedRestaurant, error: claimRestaurantError } = await client
    .from('restaurants')
    .update({
      owner_id: input.userId,
      email: normalizedEmail,
    })
    .eq('id', restaurant.id)
    .or(`owner_id.is.null,owner_id.eq.${input.userId}`)
    .select('id, name, owner_id')
    .single()

  if (claimRestaurantError) {
    throw new Error(claimRestaurantError.message)
  }

  const { error: inviteUpdateError } = await client
    .from('restaurant_owner_invites')
    .update({
      accepted_at: new Date().toISOString(),
      accepted_by_owner_id: input.userId,
    })
    .eq('id', invite.id)

  if (inviteUpdateError) {
    throw new Error(inviteUpdateError.message)
  }

  writeAuditLogAsync({
    action: 'owner.invite_claimed',
    actorId: input.userId,
    metadata: {
      inviteeEmail: normalizedEmail,
      inviteToken: input.code,
    },
    request: input.request,
    restaurantId: claimedRestaurant.id,
    source: 'public.invite',
    status: 'success',
    targetId: invite.id,
  })

  return {
    invite: {
      ...invite,
      accepted_at: new Date().toISOString(),
      accepted_by_owner_id: input.userId,
    } satisfies RestaurantInviteRecord,
    restaurant: claimedRestaurant as InviteRestaurantRecord,
  }
}
