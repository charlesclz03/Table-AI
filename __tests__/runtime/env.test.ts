/* @vitest-environment node */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { getPublicEnv } from '@/lib/env'
import { getEnvGroupStatus, getServerEnv } from '@/lib/server-env'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('env access', () => {
  it('applies safe defaults for public and server env values', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '')
    vi.stubEnv('INSFORGE_TIMEOUT_MS', '0')

    expect(getPublicEnv().siteUrl).toBe('http://localhost:3000')
    expect(getServerEnv().insForgeTimeoutMs).toBe(5000)
  })

  it('computes consistent group status for partial integrations', () => {
    const status = getEnvGroupStatus({
      GOOGLE_CLIENT_ID: 'configured',
      GOOGLE_CLIENT_SECRET: undefined,
    })

    expect(status.state).toBe('partial')
    expect(status.isPartial).toBe(true)
    expect(status.missingKeys).toEqual(['GOOGLE_CLIENT_SECRET'])
  })
})
