import { writeAuditLogAsync } from '@/lib/audit/server'
import {
  RequestGuardError,
  assertContentLength,
  assertTrustedOrigin,
  getRequestIp,
} from '@/lib/security/request-guards'
import { takeRateLimitToken } from '@/lib/security/rate-limit'
import { ensureServerOnly } from '@/lib/server-only'

ensureServerOnly('lib/security/api-protection')

interface ApiProtectionOptions {
  actorId?: string | null
  bucket: string
  identifier?: string | null
  limit: number
  maxBodyBytes?: number
  rateLimitSource?: string
  requireTrustedOrigin?: boolean
  restaurantId?: string | null
  windowMs: number
}

export interface ApiProtectionResult {
  headers: Record<string, string>
}

export function guardApiRoute(
  request: Request,
  {
    actorId,
    bucket,
    identifier,
    limit,
    maxBodyBytes,
    rateLimitSource,
    requireTrustedOrigin = true,
    restaurantId,
    windowMs,
  }: ApiProtectionOptions
): ApiProtectionResult {
  if (typeof maxBodyBytes === 'number') {
    assertContentLength(request, maxBodyBytes)
  }

  if (requireTrustedOrigin) {
    assertTrustedOrigin(request)
  }

  const rateLimit = takeRateLimitToken({
    bucket,
    key: identifier?.trim() || getRequestIp(request),
    limit,
    windowMs,
  })

  if (!rateLimit.allowed) {
    writeAuditLogAsync({
      action: 'rate_limit.blocked',
      actorId,
      metadata: {
        bucket,
        identifier: identifier?.trim() || getRequestIp(request),
        limit,
        retryAfterSeconds: rateLimit.retryAfterSeconds,
        windowMs,
      },
      reason: 'too_many_requests',
      request,
      restaurantId,
      source: rateLimitSource || bucket,
      status: 'blocked',
    })

    throw new RequestGuardError(
      'Too many requests. Please wait a moment and try again.',
      429
    )
  }

  return {
    headers: {
      'X-RateLimit-Limit': String(limit),
      'X-RateLimit-Remaining': String(rateLimit.remaining),
      'X-RateLimit-Reset': String(rateLimit.retryAfterSeconds),
    },
  }
}
