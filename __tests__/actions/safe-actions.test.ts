/* @vitest-environment node */

import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/auth')>()

  return {
    ...actual,
    auth: vi.fn(async () => null),
  }
})

import { auth } from '@/lib/auth'
import {
  getRuntimeStatusAction,
  requireAuthenticatedOperatorAction,
} from '@/lib/actions/runtime-status'

afterEach(() => {
  vi.clearAllMocks()
  vi.unstubAllEnvs()
})

describe('safe actions', () => {
  it('returns typed runtime status data for valid public action input', async () => {
    const result = await getRuntimeStatusAction({
      includeIntegrations: false,
    })

    expect(result.data).toBeDefined()
    expect(result.data?.status).toBe('ok')
    expect(result.data?.summary.total).toBeGreaterThan(0)
    expect('integrations' in (result.data || {})).toBe(false)
  })

  it('normalizes validation errors for invalid input', async () => {
    const result = await getRuntimeStatusAction({
      includeIntegrations: 'yes' as never,
    })

    expect(
      result.validationErrors?.fieldErrors.includeIntegrations
    ).toBeTruthy()
  })

  it('enforces authenticated action middleware', async () => {
    vi.mocked(auth).mockResolvedValueOnce(null)

    const unauthenticatedResult = await requireAuthenticatedOperatorAction()
    expect(unauthenticatedResult.serverError).toBe('Authentication required.')

    vi.mocked(auth).mockResolvedValueOnce({
      user: {
        id: 'user_123',
      },
    } as never)

    const authenticatedResult = await requireAuthenticatedOperatorAction()
    expect(authenticatedResult.data?.operatorId).toBe('user_123')
  })
})
