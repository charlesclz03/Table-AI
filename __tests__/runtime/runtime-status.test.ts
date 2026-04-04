/* @vitest-environment node */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { getRuntimeStatus } from '@/lib/runtime-status'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('getRuntimeStatus', () => {
  it('reports fallback and development states when optional integrations are absent', () => {
    const status = getRuntimeStatus()
    const insForge = status.integrations.find(
      (integration) => integration.id === 'insforge'
    )
    const authSecret = status.integrations.find(
      (integration) => integration.id === 'authSecret'
    )

    expect(status.status).toBe('ok')
    expect(status.summary.total).toBe(6)
    expect(insForge?.status).toBe('Fallback')
    expect(authSecret?.status).toBe('Development')
  })

  it('surfaces partial configuration details in runtime status', () => {
    vi.stubEnv('GOOGLE_CLIENT_ID', 'client-id-only')

    const status = getRuntimeStatus()
    const authentication = status.integrations.find(
      (integration) => integration.id === 'authentication'
    )

    expect(authentication?.status).toBe('Waiting')
    expect(authentication?.detail).toContain('GOOGLE_CLIENT_SECRET')
  })
})
