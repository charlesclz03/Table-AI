/* @vitest-environment node */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { GET } from '@/app/api/health/route'

function makeContext() {
  return {
    params: Promise.resolve({}),
  }
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('GET /api/health', () => {
  it('returns structured runtime readiness with no optional env configured', async () => {
    const response = await GET(
      new Request('http://localhost:3000/api/health'),
      makeContext()
    )
    const payload = await response.json()

    expect(payload.status).toBe('ok')
    expect(payload.summary.total).toBe(6)
    expect(payload.integrations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'insforge', status: 'Fallback' }),
        expect.objectContaining({ id: 'authentication', status: 'Waiting' }),
      ])
    )
  })

  it('marks selected integrations as configured when their env vars are present', async () => {
    vi.stubEnv('GOOGLE_CLIENT_ID', 'client-id')
    vi.stubEnv('GOOGLE_CLIENT_SECRET', 'client-secret')
    vi.stubEnv('DATABASE_URL', 'postgres://db')
    vi.stubEnv('DIRECT_URL', 'postgres://direct')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://supabase.example.com')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key')
    vi.stubEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 'pk_test_123')
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_123')
    vi.stubEnv('INSFORGE_BASE_URL', 'https://insforge.example.com')
    vi.stubEnv('INSFORGE_API_KEY', 'secret')
    vi.stubEnv('NEXTAUTH_SECRET', 'auth-secret')

    const response = await GET(
      new Request('http://localhost:3000/api/health'),
      makeContext()
    )
    const payload = await response.json()

    expect(payload.integrations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'authentication', status: 'Configured' }),
        expect.objectContaining({ id: 'database', status: 'Configured' }),
        expect.objectContaining({ id: 'supabase', status: 'Configured' }),
        expect.objectContaining({ id: 'stripe', status: 'Configured' }),
        expect.objectContaining({ id: 'insforge', status: 'Configured' }),
        expect.objectContaining({ id: 'authSecret', status: 'Configured' }),
      ])
    )
  })
})
