import { getSupabaseServerClient } from '@/lib/supabase/server'
import { ensureServerOnly } from '@/lib/server-only'
import {
  getRequestIp,
  getRequestUserAgent,
} from '@/lib/security/request-guards'

ensureServerOnly('lib/audit/server')

type AuditStatus = 'success' | 'blocked' | 'failure' | 'info'

interface AuditLogInput {
  action: string
  actorId?: string | null
  metadata?: Record<string, unknown> | null
  reason?: string | null
  request?: Request
  restaurantId?: string | null
  source?: string | null
  status?: AuditStatus
  targetId?: string | null
}

function isMissingAuditTable(errorMessage: string | undefined) {
  const message = errorMessage?.toLowerCase() || ''

  return (
    message.includes('audit_logs') &&
    (message.includes('does not exist') ||
      message.includes('could not find the table'))
  )
}

function sanitizeMetadata(
  metadata: Record<string, unknown> | null | undefined
) {
  if (!metadata) {
    return null
  }

  try {
    return JSON.parse(JSON.stringify(metadata)) as Record<string, unknown>
  } catch {
    return {
      serializationError: true,
    }
  }
}

export async function writeAuditLog({
  action,
  actorId,
  metadata,
  reason,
  request,
  restaurantId,
  source,
  status = 'info',
  targetId,
}: AuditLogInput) {
  const client = getSupabaseServerClient({ serviceRole: true })

  if (!client) {
    return
  }

  const { error } = await client.from('audit_logs').insert({
    action,
    actor_id: actorId || null,
    ip_address: request ? getRequestIp(request) : null,
    metadata: sanitizeMetadata(metadata),
    reason: reason || null,
    restaurant_id: restaurantId || null,
    source: source || 'app',
    status,
    target_id: targetId || null,
    user_agent: request ? getRequestUserAgent(request) : null,
  })

  if (error && !isMissingAuditTable(error.message)) {
    console.error('Unable to write audit log:', error.message)
  }
}

export function writeAuditLogAsync(input: AuditLogInput) {
  void writeAuditLog(input).catch((error) => {
    console.error('Unable to write audit log:', error)
  })
}
