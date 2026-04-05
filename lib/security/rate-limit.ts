import { ensureServerOnly } from '@/lib/server-only'

ensureServerOnly('lib/security/rate-limit')

interface RateLimitStore {
  entries: Map<string, number[]>
}

declare global {
  // eslint-disable-next-line no-var
  var __gustiaRateLimitStore: RateLimitStore | undefined
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

function getStore() {
  if (!globalThis.__gustiaRateLimitStore) {
    globalThis.__gustiaRateLimitStore = {
      entries: new Map<string, number[]>(),
    }
  }

  return globalThis.__gustiaRateLimitStore
}

export function takeRateLimitToken(options: {
  bucket: string
  key: string
  limit: number
  windowMs: number
}): RateLimitResult {
  const store = getStore()
  const entryKey = `${options.bucket}:${options.key}`
  const now = Date.now()
  const windowStart = now - options.windowMs
  const currentEntries = (store.entries.get(entryKey) || []).filter(
    (timestamp) => timestamp > windowStart
  )

  if (currentEntries.length >= options.limit) {
    const oldest = currentEntries[0] || now
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((oldest + options.windowMs - now) / 1000)
    )

    store.entries.set(entryKey, currentEntries)

    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
    }
  }

  currentEntries.push(now)
  store.entries.set(entryKey, currentEntries)

  return {
    allowed: true,
    remaining: Math.max(0, options.limit - currentEntries.length),
    retryAfterSeconds: 0,
  }
}
