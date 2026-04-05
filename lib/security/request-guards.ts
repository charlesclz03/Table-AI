import { getPublicEnv } from '@/lib/env'
import { getServerEnv } from '@/lib/server-env'
import { ensureServerOnly } from '@/lib/server-only'

ensureServerOnly('lib/security/request-guards')

export class RequestGuardError extends Error {
  status: number

  constructor(message: string, status = 400) {
    super(message)
    this.name = 'RequestGuardError'
    this.status = status
  }
}

function getOriginFromHeaderValue(value: string | null) {
  if (!value) {
    return null
  }

  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

function getAllowedOrigins(request: Request) {
  const requestUrl = new URL(request.url)
  const allowedOrigins = new Set<string>([requestUrl.origin])
  const { siteUrl } = getPublicEnv()

  const publicOrigin = getOriginFromHeaderValue(siteUrl)

  if (publicOrigin) {
    allowedOrigins.add(publicOrigin)
  }

  if (getServerEnv().nodeEnv !== 'production') {
    allowedOrigins.add('http://localhost:3000')
    allowedOrigins.add('http://127.0.0.1:3000')
  }

  return allowedOrigins
}

export function getRequestIp(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for')

  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown'
  }

  return (
    request.headers.get('x-real-ip')?.trim() ||
    request.headers.get('cf-connecting-ip')?.trim() ||
    'unknown'
  )
}

export function getRequestUserAgent(request: Request) {
  return request.headers.get('user-agent')?.trim() || 'unknown'
}

export function assertContentLength(
  request: Request,
  maxBytes: number,
  message = 'Request payload is too large.'
) {
  const rawLength = request.headers.get('content-length')

  if (!rawLength) {
    return
  }

  const contentLength = Number.parseInt(rawLength, 10)

  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new RequestGuardError(message, 413)
  }
}

export function assertTrustedOrigin(
  request: Request,
  options?: {
    allowWithoutOrigin?: boolean
  }
) {
  const origin =
    getOriginFromHeaderValue(request.headers.get('origin')) ||
    getOriginFromHeaderValue(request.headers.get('referer'))

  if (!origin) {
    if (
      options?.allowWithoutOrigin ||
      getServerEnv().nodeEnv === 'test' ||
      getServerEnv().nodeEnv === 'development'
    ) {
      return
    }

    throw new RequestGuardError('Missing trusted origin header.', 403)
  }

  if (!getAllowedOrigins(request).has(origin)) {
    throw new RequestGuardError('Cross-site requests are not allowed.', 403)
  }
}
