/* @vitest-environment node */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/onboarding/suggestions/route'

function makeRequest(payload: unknown) {
  return new NextRequest('http://localhost:3000/api/onboarding/suggestions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

function makeContext() {
  return {
    params: Promise.resolve({}),
  }
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('POST /api/onboarding/suggestions', () => {
  it('uses supplied docs without requiring workspace discovery', async () => {
    const response = await POST(
      makeRequest({
        useWorkspaceDiscovery: false,
        documents: [
          {
            path: 'README.md',
            content:
              '# Studio Atlas\nA planning workspace for creative teams.\nPrimary brand color: Ocean Blue (#0ea5e9).',
          },
        ],
      }),
      makeContext()
    )
    const payload = await response.json()

    expect(payload.documents).toHaveLength(1)
    expect(payload.provider).toBe('heuristic')
    expect(payload.suggestions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'projectIdentity' }),
        expect.objectContaining({ field: 'brandColor' }),
      ])
    )
  })

  it('uses frontmatter-rich docs through the same API contract', async () => {
    const response = await POST(
      makeRequest({
        useWorkspaceDiscovery: false,
        documents: [
          {
            path: 'README.md',
            content: `---
title: Atlas HQ
brandColor: Sunset Orange
---

# Atlas HQ

Control room for distributed operators.`,
          },
        ],
      }),
      makeContext()
    )
    const payload = await response.json()

    expect(payload.provider).toBe('heuristic')
    expect(payload.suggestions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'brandColor',
          suggestedValue: 'Sunset Orange',
        }),
      ])
    )
  })

  it('returns normalized warnings when discovery is disabled and no docs are supplied', async () => {
    const response = await POST(
      makeRequest({
        useWorkspaceDiscovery: false,
      }),
      makeContext()
    )
    const payload = await response.json()

    expect(payload.documents).toEqual([])
    expect(payload.provider).toBe('none')
    expect(payload.warnings).toContain(
      'Workspace discovery was disabled and no documents were supplied.'
    )
    expect(payload.warnings).toContain(
      'No candidate project documents were found to analyze.'
    )
  })

  it('falls back to heuristics when InsForge fails', async () => {
    vi.stubEnv('INSFORGE_BASE_URL', 'https://insforge.example.com')
    vi.stubEnv('INSFORGE_API_KEY', 'api-key')
    const fetchMock = vi.fn(async () => ({
      ok: false,
      status: 503,
    }))
    vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch)

    const response = await POST(
      makeRequest({
        useWorkspaceDiscovery: false,
        documents: [
          {
            path: 'README.md',
            content:
              '# Studio Atlas\nA planning workspace for creative teams.\nStripe billing is required.',
          },
        ],
      }),
      makeContext()
    )
    const payload = await response.json()

    expect(payload.provider).toBe('heuristic')
    expect(payload.suggestions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'projectIdentity' }),
      ])
    )
    expect(payload.warnings[0]).toContain('InsForge request failed')
  })

  it('rejects malformed payloads with route-level validation', async () => {
    const response = await POST(
      makeRequest({
        useWorkspaceDiscovery: 'sometimes',
      }),
      makeContext()
    )
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.message).toBe('Invalid body')
  })
})
