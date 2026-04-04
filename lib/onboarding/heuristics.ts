import {
  defaultOnboardingFields,
  type OnboardingDocument,
  type OnboardingField,
  type OnboardingSuggestion,
} from '@/lib/onboarding/types'
import {
  ingestOnboardingDocuments,
  type IngestedOnboardingDocument,
} from '@/lib/onboarding/ingestion'
import { ensureServerOnly } from '@/lib/server-only'

ensureServerOnly('lib/onboarding/heuristics')

function normalizeNewlines(value: string) {
  return value.replace(/\r\n/g, '\n')
}

function makeSuggestion(
  field: OnboardingField,
  suggestedValue: string,
  confidence: number,
  sources: string[],
  rationale: string,
  provider: 'heuristic' | 'insforge' = 'heuristic'
): OnboardingSuggestion {
  return {
    field,
    suggestedValue,
    confidence,
    sources,
    rationale,
    provider,
  }
}

function getFrontmatterString(
  document: IngestedOnboardingDocument,
  keys: string[]
) {
  for (const key of keys) {
    const value = document.frontmatter[key]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return null
}

function pickFirstMatch(
  documents: IngestedOnboardingDocument[],
  pattern: RegExp
) {
  for (const document of documents) {
    const match = normalizeNewlines(document.normalizedContent).match(pattern)
    if (match) {
      return { document, match }
    }
  }

  return null
}

export function buildHeuristicSuggestionsFromIngestedDocuments(
  documents: IngestedOnboardingDocument[],
  fields: OnboardingField[] = [...defaultOnboardingFields]
): OnboardingSuggestion[] {
  const suggestions: OnboardingSuggestion[] = []

  if (fields.includes('projectIdentity')) {
    const frontmatterMatch = documents.find((document) =>
      getFrontmatterString(document, [
        'title',
        'name',
        'project',
        'projectName',
        'product',
        'productName',
        'app',
        'appName',
      ])
    )

    if (frontmatterMatch) {
      const title =
        getFrontmatterString(frontmatterMatch, [
          'title',
          'name',
          'project',
          'projectName',
          'product',
          'productName',
          'app',
          'appName',
        ]) || frontmatterMatch.headings[0]
      const summary =
        getFrontmatterString(frontmatterMatch, [
          'summary',
          'description',
          'tagline',
        ]) || frontmatterMatch.summary

      suggestions.push(
        makeSuggestion(
          'projectIdentity',
          summary && summary !== title ? `${title} - ${summary}` : title,
          0.84,
          [frontmatterMatch.path],
          'Derived from explicit frontmatter metadata in the existing project docs.'
        )
      )
    } else {
      const titleMatch = documents.find((document) => document.headings[0])

      if (titleMatch) {
        const title = titleMatch.headings[0]
        const summaryLine = normalizeNewlines(titleMatch.normalizedContent)
          .split('\n')
          .find((line) => line.trim() && !line.startsWith('#'))
        const suggestedValue = summaryLine
          ? `${title} - ${summaryLine.trim()}`
          : title

        suggestions.push(
          makeSuggestion(
            'projectIdentity',
            suggestedValue,
            0.62,
            [titleMatch.path],
            'Derived from the primary project heading and summary text in the existing docs.'
          )
        )
      }
    }
  }

  if (fields.includes('brandColor')) {
    const frontmatterMatch = documents.find((document) =>
      getFrontmatterString(document, [
        'brandColor',
        'brand_color',
        'primaryColor',
        'primary_color',
        'accentColor',
        'accent_color',
        'themeColor',
        'theme_color',
      ])
    )

    if (frontmatterMatch) {
      suggestions.push(
        makeSuggestion(
          'brandColor',
          getFrontmatterString(frontmatterMatch, [
            'brandColor',
            'brand_color',
            'primaryColor',
            'primary_color',
            'accentColor',
            'accent_color',
            'themeColor',
            'theme_color',
          ]) || '',
          0.82,
          [frontmatterMatch.path],
          'Matched an explicit frontmatter color token in the project docs.'
        )
      )
    } else {
      const colorMatch = pickFirstMatch(
        documents,
        /(brand|primary|accent)\s+color[^#\n]*?(#(?:[0-9a-f]{3}){1,2}|[A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)*)/im
      )

      if (colorMatch) {
        suggestions.push(
          makeSuggestion(
            'brandColor',
            colorMatch.match[2].trim(),
            0.58,
            [colorMatch.document.path],
            'Matched an explicit brand or primary color reference in the project docs.'
          )
        )
      }
    }
  }

  if (fields.includes('databaseStrategy')) {
    const frontmatterMatch = documents.find((document) =>
      getFrontmatterString(document, [
        'database',
        'databaseStrategy',
        'database_strategy',
        'databaseProvider',
        'database_provider',
      ])
    )
    const databaseHint = frontmatterMatch
      ? getFrontmatterString(frontmatterMatch, [
          'database',
          'databaseStrategy',
          'database_strategy',
          'databaseProvider',
          'database_provider',
        ])?.toLowerCase()
      : null

    if (databaseHint) {
      const suggestedValue = databaseHint.includes('supabase')
        ? 'Use Supabase and set up the connection strings during onboarding.'
        : 'Use a non-Supabase SQL database.'

      suggestions.push(
        makeSuggestion(
          'databaseStrategy',
          suggestedValue,
          0.8,
          [frontmatterMatch?.path || ''],
          'Derived from explicit database metadata in the frontmatter.'
        )
      )
    } else {
      const supabaseMatch = pickFirstMatch(
        documents,
        /(supabase).{0,120}(placeholder|later|future|eventually)?/im
      )
      const postgresMatch = pickFirstMatch(
        documents,
        /(postgres|postgresql|mysql|sqlite).{0,120}/im
      )

      if (supabaseMatch) {
        const mode = supabaseMatch.match[2]
          ? 'Use Supabase and leave placeholders for connection strings.'
          : 'Use Supabase and set up the connection strings during onboarding.'

        suggestions.push(
          makeSuggestion(
            'databaseStrategy',
            mode,
            0.68,
            [supabaseMatch.document.path],
            'Supabase is explicitly referenced in the existing docs.'
          )
        )
      } else if (postgresMatch) {
        suggestions.push(
          makeSuggestion(
            'databaseStrategy',
            'Use a non-Supabase SQL database.',
            0.46,
            [postgresMatch.document.path],
            'The docs reference SQL infrastructure but do not mention Supabase directly.'
          )
        )
      }
    }
  }

  if (fields.includes('monetization')) {
    const frontmatterMatch = documents.find((document) =>
      getFrontmatterString(document, [
        'monetization',
        'billing',
        'pricing',
        'subscriptions',
      ])
    )
    const monetizationHint = frontmatterMatch
      ? getFrontmatterString(frontmatterMatch, [
          'monetization',
          'billing',
          'pricing',
          'subscriptions',
        ])?.toLowerCase()
      : null

    if (monetizationHint) {
      const suggestedValue = /(stripe|subscription|paid|pricing)/.test(
        monetizationHint
      )
        ? 'Yes, use Stripe for subscriptions.'
        : 'No, do not add Stripe subscriptions.'

      suggestions.push(
        makeSuggestion(
          'monetization',
          suggestedValue,
          0.8,
          [frontmatterMatch?.path || ''],
          'Derived from explicit billing metadata in the frontmatter.'
        )
      )
    } else {
      const billingMatch = pickFirstMatch(
        documents,
        /(stripe|subscription|billing|paid tier|pricing)/im
      )
      const noBillingMatch = pickFirstMatch(
        documents,
        /(free forever|no billing|non-commercial|open source only)/im
      )

      if (billingMatch) {
        suggestions.push(
          makeSuggestion(
            'monetization',
            'Yes, use Stripe for subscriptions.',
            0.63,
            [billingMatch.document.path],
            'Billing or subscriptions are already part of the documented product plan.'
          )
        )
      } else if (noBillingMatch) {
        suggestions.push(
          makeSuggestion(
            'monetization',
            'No, do not add Stripe subscriptions.',
            0.52,
            [noBillingMatch.document.path],
            'The docs describe a free or non-billing model.'
          )
        )
      }
    }
  }

  return suggestions.filter(
    (suggestion, index, list) =>
      list.findIndex((candidate) => candidate.field === suggestion.field) ===
      index
  )
}

export function buildHeuristicSuggestions(
  documents: OnboardingDocument[],
  fields: OnboardingField[] = [...defaultOnboardingFields]
) {
  return buildHeuristicSuggestionsFromIngestedDocuments(
    ingestOnboardingDocuments(documents),
    fields
  )
}
