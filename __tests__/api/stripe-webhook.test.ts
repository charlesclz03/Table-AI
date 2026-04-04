/* @vitest-environment node */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { POST } from '@/app/api/stripe/webhook/route'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('POST /api/stripe/webhook', () => {
  it('stays inert when Stripe webhook env vars are missing', async () => {
    const response = await POST(
      new Request('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        body: '{}',
      })
    )
    const payload = await response.json()

    expect(response.status).toBe(202)
    expect(payload.received).toBe(false)
  })
})
