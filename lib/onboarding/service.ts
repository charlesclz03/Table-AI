import { discoverProjectDocuments } from '@/lib/onboarding/document-discovery'
import { buildHeuristicSuggestionsFromIngestedDocuments } from '@/lib/onboarding/heuristics'
import { ingestOnboardingDocuments } from '@/lib/onboarding/ingestion'
import {
  getInsForgeConfigurationStatus,
  requestInsForgeSuggestions,
} from '@/lib/onboarding/insforge'
import type {
  OnboardingDocument,
  OnboardingField,
  OnboardingSuggestionResponse,
} from '@/lib/onboarding/types'
import { ensureServerOnly } from '@/lib/server-only'

ensureServerOnly('lib/onboarding/service')

interface GenerateOnboardingSuggestionResponseOptions {
  documents?: OnboardingDocument[]
  fields?: OnboardingField[]
  useWorkspaceDiscovery?: boolean
  rootDir?: string
  fetchImpl?: typeof fetch
}

function dedupeWarnings(warnings: string[]) {
  return [...new Set(warnings.filter(Boolean))]
}

export async function generateOnboardingSuggestionResponse({
  documents = [],
  fields,
  useWorkspaceDiscovery = true,
  rootDir,
  fetchImpl,
}: GenerateOnboardingSuggestionResponseOptions = {}): Promise<OnboardingSuggestionResponse> {
  const hasSuppliedDocuments = documents.length > 0
  const shouldDiscoverWorkspace = useWorkspaceDiscovery && !hasSuppliedDocuments

  const resolvedDocuments = hasSuppliedDocuments
    ? documents
    : shouldDiscoverWorkspace
      ? await discoverProjectDocuments(rootDir)
      : []

  const discoveryWarnings =
    !useWorkspaceDiscovery && !hasSuppliedDocuments
      ? ['Workspace discovery was disabled and no documents were supplied.']
      : []

  if (resolvedDocuments.length === 0) {
    return {
      documents: resolvedDocuments,
      suggestions: [],
      provider: 'none',
      warnings: dedupeWarnings([
        ...discoveryWarnings,
        'No candidate project documents were found to analyze.',
      ]),
    }
  }

  const ingestedDocuments = ingestOnboardingDocuments(resolvedDocuments)

  if (ingestedDocuments.length === 0) {
    return {
      documents: resolvedDocuments,
      suggestions: [],
      provider: 'none',
      warnings: dedupeWarnings([
        ...discoveryWarnings,
        'Project documents were found, but no usable onboarding text remained after normalization.',
      ]),
    }
  }

  const heuristicSuggestions = buildHeuristicSuggestionsFromIngestedDocuments(
    ingestedDocuments,
    fields
  )
  const remoteResult = await requestInsForgeSuggestions({
    documents: ingestedDocuments,
    fields,
    fallbackSuggestions: heuristicSuggestions,
    fetchImpl,
  })
  const insForgeStatus = getInsForgeConfigurationStatus()

  const warnings = [...discoveryWarnings, ...remoteResult.warnings]

  if (
    remoteResult.provider === 'insforge' &&
    remoteResult.suggestions.length > 0
  ) {
    return {
      documents: resolvedDocuments,
      suggestions: remoteResult.suggestions,
      provider: 'insforge',
      warnings: dedupeWarnings(warnings),
    }
  }

  if (heuristicSuggestions.length > 0) {
    if (!remoteResult.warnings.length) {
      warnings.push(
        insForgeStatus.isPartial
          ? `InsForge is partially configured. Missing ${insForgeStatus.missingKeys.join(
              ', '
            )}, so local heuristics were used instead.`
          : 'InsForge is not configured, so local heuristics were used instead.'
      )
    }

    return {
      documents: resolvedDocuments,
      suggestions: heuristicSuggestions,
      provider: 'heuristic',
      warnings: dedupeWarnings(warnings),
    }
  }

  if (!remoteResult.warnings.length) {
    warnings.push(
      insForgeStatus.isPartial
        ? `InsForge is partially configured. Missing ${insForgeStatus.missingKeys.join(
            ', '
          )}, and the local heuristics found no strong suggestions.`
        : 'InsForge is not configured and the local heuristics found no strong suggestions.'
    )
  }

  return {
    documents: resolvedDocuments,
    suggestions: [],
    provider: 'none',
    warnings: dedupeWarnings(warnings),
  }
}
