import {
  defaultOnboardingFields,
  type OnboardingField,
  type OnboardingSuggestion,
} from '@/lib/onboarding/types'
import {
  ingestOnboardingDocuments,
  type IngestedOnboardingDocument,
} from '@/lib/onboarding/ingestion'
import { buildHeuristicSuggestions } from '@/lib/onboarding/heuristics'
import {
  getEnvGroupStatus,
  type EnvGroupStatus,
  getServerEnv,
} from '@/lib/server-env'
import { ensureServerOnly } from '@/lib/server-only'

ensureServerOnly('lib/onboarding/insforge')

interface RequestInsForgeSuggestionsOptions {
  documents: IngestedOnboardingDocument[]
  fields?: OnboardingField[]
  fallbackSuggestions?: OnboardingSuggestion[]
  fetchImpl?: typeof fetch
}

interface SuggestionResult {
  provider: 'insforge' | 'none'
  suggestions: OnboardingSuggestion[]
  warnings: string[]
}

export { buildHeuristicSuggestions }

function makeSuggestion(
  field: OnboardingField,
  suggestedValue: string,
  confidence: number,
  sources: string[],
  rationale: string,
  provider: 'heuristic' | 'insforge'
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

export function getInsForgeConfigurationStatus(): EnvGroupStatus {
  const env = getServerEnv()

  return getEnvGroupStatus({
    INSFORGE_BASE_URL: env.insForgeBaseUrl,
    INSFORGE_API_KEY: env.insForgeApiKey,
  })
}

function getInsForgeEndpoint() {
  const env = getServerEnv()
  const status = getInsForgeConfigurationStatus()

  if (!status.isConfigured || !env.insForgeBaseUrl) {
    return null
  }

  return new URL(
    '/wizard-assistant/suggestions',
    env.insForgeBaseUrl
  ).toString()
}

export function normalizeInsForgeSuggestions(
  value: unknown
): OnboardingSuggestion[] {
  const rawSuggestions = Array.isArray(value)
    ? value
    : value &&
        typeof value === 'object' &&
        'suggestions' in value &&
        Array.isArray((value as { suggestions?: unknown[] }).suggestions)
      ? (value as { suggestions: unknown[] }).suggestions
      : []

  return rawSuggestions
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null
      }

      const candidate = item as Partial<OnboardingSuggestion>

      if (
        !candidate.field ||
        !defaultOnboardingFields.includes(candidate.field) ||
        typeof candidate.suggestedValue !== 'string'
      ) {
        return null
      }

      return makeSuggestion(
        candidate.field,
        candidate.suggestedValue,
        typeof candidate.confidence === 'number' ? candidate.confidence : 0.5,
        Array.isArray(candidate.sources) ? candidate.sources : [],
        typeof candidate.rationale === 'string'
          ? candidate.rationale
          : 'Suggested by InsForge based on the supplied project documents.',
        'insforge'
      )
    })
    .filter((item): item is OnboardingSuggestion => Boolean(item))
}

export async function requestInsForgeSuggestions({
  documents,
  fields = [...defaultOnboardingFields],
  fallbackSuggestions = [],
  fetchImpl = fetch,
}: RequestInsForgeSuggestionsOptions): Promise<SuggestionResult> {
  const endpoint = getInsForgeEndpoint()

  if (!endpoint) {
    return {
      provider: 'none',
      suggestions: [],
      warnings: [],
    }
  }

  const env = getServerEnv()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), env.insForgeTimeoutMs)

  try {
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.insForgeApiKey}`,
      },
      body: JSON.stringify({
        intent: 'onboarding',
        fields,
        documents: documents.map((document) => ({
          path: document.path,
          excerpt: document.excerpt || document.normalizedContent,
          summary: document.summary,
          headings: document.headings,
          frontmatter: document.frontmatter,
          frontmatterFormat: document.frontmatterFormat,
          signalTerms: document.signalTerms,
          chunks: document.chunks,
        })),
        fallbackSuggestions,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`InsForge responded with ${response.status}`)
    }

    const payload = await response.json()
    return {
      provider: 'insforge',
      suggestions: normalizeInsForgeSuggestions(payload),
      warnings: [],
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown InsForge error'

    return {
      provider: 'none',
      suggestions: [],
      warnings: [`InsForge request failed: ${message}`],
    }
  } finally {
    clearTimeout(timer)
  }
}

export async function getOnboardingSuggestions({
  documents,
  fields = [...defaultOnboardingFields],
  fetchImpl = fetch,
}: {
  documents: Array<{
    path: string
    content: string
    excerpt?: string
  }>
  fields?: OnboardingField[]
  fetchImpl?: typeof fetch
}) {
  if (documents.length === 0) {
    return {
      provider: 'none' as const,
      suggestions: [],
      warnings: ['No candidate project documents were found to analyze.'],
    }
  }

  const ingestedDocuments = ingestOnboardingDocuments(documents)
  const heuristicSuggestions = buildHeuristicSuggestions(documents, fields)
  const remoteResult = await requestInsForgeSuggestions({
    documents: ingestedDocuments,
    fields,
    fallbackSuggestions: heuristicSuggestions,
    fetchImpl,
  })
  const insForgeStatus = getInsForgeConfigurationStatus()

  if (
    remoteResult.provider === 'insforge' &&
    remoteResult.suggestions.length > 0
  ) {
    return {
      provider: 'insforge' as const,
      suggestions: remoteResult.suggestions,
      warnings: remoteResult.warnings,
    }
  }

  if (heuristicSuggestions.length > 0) {
    return {
      provider: 'heuristic' as const,
      suggestions: heuristicSuggestions,
      warnings: remoteResult.warnings.length
        ? remoteResult.warnings
        : [
            insForgeStatus.isPartial
              ? `InsForge is partially configured. Missing ${insForgeStatus.missingKeys.join(
                  ', '
                )}, so local heuristics were used instead.`
              : 'InsForge is not configured, so local heuristics were used instead.',
          ],
    }
  }

  return {
    provider: 'none' as const,
    suggestions: [],
    warnings: remoteResult.warnings.length
      ? remoteResult.warnings
      : [
          insForgeStatus.isPartial
            ? `InsForge is partially configured. Missing ${insForgeStatus.missingKeys.join(
                ', '
              )}, and the local heuristics found no strong suggestions.`
            : 'InsForge is not configured and the local heuristics found no strong suggestions.',
        ],
  }
}
