/* @vitest-environment node */

import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildHeuristicSuggestions,
  getOnboardingSuggestions,
  normalizeInsForgeSuggestions,
} from '@/lib/onboarding/insforge'
import type { OnboardingDocument } from '@/lib/onboarding/types'
import { generateOnboardingSuggestionResponse } from '@/lib/onboarding/service'

const documents: OnboardingDocument[] = [
  {
    path: 'README.md',
    content:
      '# Studio Atlas\nA planning workspace for creative teams.\nPrimary brand color: Ocean Blue (#0ea5e9).',
    excerpt:
      '# Studio Atlas\nA planning workspace for creative teams.\nPrimary brand color: Ocean Blue (#0ea5e9).',
  },
  {
    path: 'docs/product-brief.md',
    content:
      'The product uses Supabase for the database and Stripe for subscriptions.',
    excerpt:
      'The product uses Supabase for the database and Stripe for subscriptions.',
  },
]

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('buildHeuristicSuggestions', () => {
  it('extracts onboarding candidates from discovered docs', () => {
    const suggestions = buildHeuristicSuggestions(documents)

    expect(suggestions.map((suggestion) => suggestion.field)).toEqual([
      'projectIdentity',
      'brandColor',
      'databaseStrategy',
      'monetization',
    ])
  })
})

describe('normalizeInsForgeSuggestions', () => {
  it('accepts wrapped suggestion payloads', () => {
    const suggestions = normalizeInsForgeSuggestions({
      suggestions: [
        {
          field: 'projectIdentity',
          suggestedValue: 'Studio Atlas - A planning workspace',
          confidence: 0.91,
          sources: ['README.md'],
          rationale: 'Parsed from the product brief.',
        },
      ],
    })

    expect(suggestions[0]).toMatchObject({
      field: 'projectIdentity',
      provider: 'insforge',
    })
  })
})

describe('getOnboardingSuggestions', () => {
  it('falls back to local heuristics when InsForge is unavailable', async () => {
    const result = await getOnboardingSuggestions({ documents })

    expect(result.provider).toBe('heuristic')
    expect(result.suggestions.length).toBeGreaterThan(0)
    expect(result.warnings[0]).toContain('InsForge is not configured')
  })

  it('uses InsForge when configured and the response is valid', async () => {
    vi.stubEnv('INSFORGE_BASE_URL', 'https://insforge.example.com')
    vi.stubEnv('INSFORGE_API_KEY', 'test-key')

    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        suggestions: [
          {
            field: 'projectIdentity',
            suggestedValue: 'Studio Atlas - AI planning workspace',
            confidence: 0.96,
            sources: ['README.md'],
            rationale: 'InsForge synthesized the existing docs.',
          },
        ],
      }),
    })) as unknown as typeof fetch

    const result = await getOnboardingSuggestions({ documents, fetchImpl })

    expect(result.provider).toBe('insforge')
    expect(fetchImpl).toHaveBeenCalledOnce()
    expect(result.suggestions[0].suggestedValue).toContain('Studio Atlas')
  })

  it('returns a first-class warning when workspace discovery is disabled', async () => {
    const result = await generateOnboardingSuggestionResponse({
      useWorkspaceDiscovery: false,
    })

    expect(result.documents).toEqual([])
    expect(result.provider).toBe('none')
    expect(result.warnings).toContain(
      'Workspace discovery was disabled and no documents were supplied.'
    )
  })
})
