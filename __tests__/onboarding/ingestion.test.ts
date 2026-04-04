/* @vitest-environment node */

import { describe, expect, it } from 'vitest'
import { buildHeuristicSuggestions } from '@/lib/onboarding/heuristics'
import { ingestOnboardingDocuments } from '@/lib/onboarding/ingestion'

describe('ingestOnboardingDocuments', () => {
  it('parses frontmatter, headings, and chunks', () => {
    const [document] = ingestOnboardingDocuments([
      {
        path: 'README.md',
        content: `---
title: Atlas HQ
brandColor: Sunset Orange
database: Supabase
monetization: Stripe subscriptions
summary: Command center for distributed operators.
---

# Atlas HQ

The runtime cockpit for distributed operators.

More detail here.
`,
      },
    ])

    expect(document.frontmatter.title).toBe('Atlas HQ')
    expect(document.frontmatter.brandColor).toBe('Sunset Orange')
    expect(document.headings).toContain('Atlas HQ')
    expect(document.chunks.length).toBeGreaterThan(0)
    expect(document.summary).toContain('Command center')
  })
})

describe('frontmatter-aware heuristics', () => {
  it('prefers explicit frontmatter values over loose body matches', () => {
    const suggestions = buildHeuristicSuggestions([
      {
        path: 'README.md',
        content: `---
title: Atlas HQ
brandColor: Sunset Orange
database: Supabase
monetization: Stripe subscriptions
summary: Command center for distributed operators.
---

# Atlas HQ

Primary brand color: Ocean Blue.
`,
      },
    ])

    expect(suggestions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'projectIdentity',
          suggestedValue:
            'Atlas HQ - Command center for distributed operators.',
        }),
        expect.objectContaining({
          field: 'brandColor',
          suggestedValue: 'Sunset Orange',
        }),
        expect.objectContaining({
          field: 'databaseStrategy',
          suggestedValue:
            'Use Supabase and set up the connection strings during onboarding.',
        }),
        expect.objectContaining({
          field: 'monetization',
          suggestedValue: 'Yes, use Stripe for subscriptions.',
        }),
      ])
    )
  })
})
