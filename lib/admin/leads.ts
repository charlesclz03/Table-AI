import {
  LEAD_PIPELINE_STATUSES,
  type LeadPipelineStatus,
  type WaitlistLeadRecord,
} from '@/lib/admin/lead-pipeline'
import { ensureServerOnly } from '@/lib/server-only'
import { getSupabaseServerClient } from '@/lib/supabase/server'

ensureServerOnly('lib/admin/leads')

const LEAD_SELECT =
  'id, name, email, restaurant_name, notes, created_at, source, status, last_contacted_at, converted_at, converted_restaurant_id'

function getServiceClient() {
  const client = getSupabaseServerClient({ serviceRole: true })

  if (!client) {
    throw new Error('Supabase is not configured.')
  }

  return client
}

function isMissingColumnError(errorMessage: string | undefined) {
  const message = errorMessage?.toLowerCase() || ''

  return (
    message.includes('column') &&
    (message.includes('status') ||
      message.includes('source') ||
      message.includes('last_contacted_at') ||
      message.includes('converted_at') ||
      message.includes('converted_restaurant_id'))
  )
}

function normalizeLeadStatus(value: unknown): LeadPipelineStatus {
  return LEAD_PIPELINE_STATUSES.includes(value as LeadPipelineStatus)
    ? (value as LeadPipelineStatus)
    : 'new'
}

function normalizeLeadSource(value: unknown) {
  const source = typeof value === 'string' ? value.trim() : ''
  return source || 'waitlist'
}

function normalizeLeadRecord(
  lead: Partial<WaitlistLeadRecord> & Record<string, unknown>
): WaitlistLeadRecord {
  return {
    id: String(lead.id || ''),
    name: String(lead.name || ''),
    email: String(lead.email || ''),
    restaurant_name:
      typeof lead.restaurant_name === 'string' ? lead.restaurant_name : null,
    notes: typeof lead.notes === 'string' ? lead.notes : null,
    created_at: String(lead.created_at || new Date().toISOString()),
    source: normalizeLeadSource(lead.source),
    status: normalizeLeadStatus(lead.status),
    last_contacted_at:
      typeof lead.last_contacted_at === 'string'
        ? lead.last_contacted_at
        : null,
    converted_at:
      typeof lead.converted_at === 'string' ? lead.converted_at : null,
    converted_restaurant_id:
      typeof lead.converted_restaurant_id === 'string'
        ? lead.converted_restaurant_id
        : null,
  }
}

export async function listWaitlistLeads(limit = 500) {
  const client = getServiceClient()
  const requestedLimit = Math.min(Math.max(limit, 1), 500)
  const fullQuery = await client
    .from('waitlist_leads')
    .select(LEAD_SELECT)
    .order('created_at', { ascending: false })
    .limit(requestedLimit)

  if (!fullQuery.error) {
    return ((fullQuery.data || []) as Array<Record<string, unknown>>).map(
      normalizeLeadRecord
    )
  }

  if (!isMissingColumnError(fullQuery.error.message)) {
    throw new Error(fullQuery.error.message)
  }

  const fallbackQuery = await client
    .from('waitlist_leads')
    .select('id, name, email, restaurant_name, notes, created_at')
    .order('created_at', { ascending: false })
    .limit(requestedLimit)

  if (fallbackQuery.error) {
    throw new Error(fallbackQuery.error.message)
  }

  return ((fallbackQuery.data || []) as Array<Record<string, unknown>>).map(
    normalizeLeadRecord
  )
}

export async function updateWaitlistLeadStatus(input: {
  leadId: string
  status: LeadPipelineStatus
}) {
  const client = getServiceClient()
  const nextStatus = normalizeLeadStatus(input.status)
  const { data: lead, error: leadError } = await client
    .from('waitlist_leads')
    .select(
      'id, status, converted_at, converted_restaurant_id, last_contacted_at'
    )
    .eq('id', input.leadId)
    .maybeSingle()

  if (leadError) {
    throw new Error(
      isMissingColumnError(leadError.message)
        ? 'Apply the lead pipeline migration before changing statuses.'
        : leadError.message
    )
  }

  if (!lead?.id) {
    throw new Error('Lead not found.')
  }

  const now = new Date().toISOString()
  const updates: Record<string, unknown> = {
    status: nextStatus,
  }

  if (
    (nextStatus === 'contacted' || nextStatus === 'qualified') &&
    !lead.last_contacted_at
  ) {
    updates.last_contacted_at = now
  }

  if (nextStatus === 'contacted') {
    updates.last_contacted_at = now
  }

  if (nextStatus === 'converted') {
    updates.converted_at = lead.converted_at || now
  }

  if (nextStatus !== 'converted' && lead.status === 'converted') {
    updates.converted_at = null
    updates.converted_restaurant_id = null
  }

  const { data, error } = await client
    .from('waitlist_leads')
    .update(updates)
    .eq('id', input.leadId)
    .select(LEAD_SELECT)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return normalizeLeadRecord(data as Record<string, unknown>)
}

export async function syncConvertedWaitlistLead(input: {
  email: string
  restaurantId: string
}) {
  const normalizedEmail = input.email.trim().toLowerCase()

  if (!normalizedEmail) {
    return null
  }

  const client = getServiceClient()
  const { data: lead, error } = await client
    .from('waitlist_leads')
    .select('id')
    .ilike('email', normalizedEmail)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    if (isMissingColumnError(error.message)) {
      return null
    }

    throw new Error(error.message)
  }

  if (!lead?.id) {
    return null
  }

  const { data, error: updateError } = await client
    .from('waitlist_leads')
    .update({
      converted_at: new Date().toISOString(),
      converted_restaurant_id: input.restaurantId,
      status: 'converted',
    })
    .eq('id', lead.id)
    .select(LEAD_SELECT)
    .single()

  if (updateError) {
    if (isMissingColumnError(updateError.message)) {
      return null
    }

    throw new Error(updateError.message)
  }

  return normalizeLeadRecord(data as Record<string, unknown>)
}
