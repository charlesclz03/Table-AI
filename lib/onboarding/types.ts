import { z } from 'zod'

export const onboardingFieldSchema = z.enum([
  'projectIdentity',
  'brandColor',
  'databaseStrategy',
  'monetization',
])

export type OnboardingField = z.infer<typeof onboardingFieldSchema>

export const onboardingDocumentSchema = z.object({
  path: z.string(),
  content: z.string(),
  excerpt: z.string().optional(),
})

export type OnboardingDocument = z.infer<typeof onboardingDocumentSchema>

export const onboardingSuggestionProviderSchema = z.enum([
  'heuristic',
  'insforge',
  'none',
])

export type OnboardingSuggestionProvider = z.infer<
  typeof onboardingSuggestionProviderSchema
>

export const onboardingSuggestionSchema = z.object({
  field: onboardingFieldSchema,
  suggestedValue: z.string(),
  confidence: z.number().min(0).max(1),
  sources: z.array(z.string()),
  rationale: z.string(),
  provider: z.enum(['heuristic', 'insforge']),
})

export type OnboardingSuggestion = z.infer<typeof onboardingSuggestionSchema>

export interface OnboardingSuggestionResponse {
  documents: OnboardingDocument[]
  suggestions: OnboardingSuggestion[]
  provider: OnboardingSuggestionProvider
  warnings: string[]
}

export const defaultOnboardingFields = onboardingFieldSchema.options
