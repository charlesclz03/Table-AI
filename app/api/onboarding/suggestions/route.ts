import { z } from 'zod'
import { NextResponse } from 'next/server'
import { appRoute } from '@/lib/api/zod-route'
import { generateOnboardingSuggestionResponse } from '@/lib/onboarding/service'
import {
  onboardingDocumentSchema,
  onboardingFieldSchema,
} from '@/lib/onboarding/types'

const onboardingSuggestionRequestSchema = z.object({
  fields: z.array(onboardingFieldSchema).optional(),
  documents: z.array(onboardingDocumentSchema).optional(),
  useWorkspaceDiscovery: z.boolean().optional(),
})

export const POST = appRoute
  .metadata({
    routeName: 'onboarding-suggestions',
    visibility: 'internal',
  })
  .body(onboardingSuggestionRequestSchema)
  .handler(async (_request, context) => {
    try {
      const result = await generateOnboardingSuggestionResponse({
        documents: context.body.documents || [],
        fields: context.body.fields,
        useWorkspaceDiscovery: context.body.useWorkspaceDiscovery !== false,
      })

      return result
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to generate suggestions'

      return NextResponse.json(
        {
          documents: [],
          suggestions: [],
          provider: 'none',
          warnings: [message],
        },
        { status: 500 }
      )
    }
  })
