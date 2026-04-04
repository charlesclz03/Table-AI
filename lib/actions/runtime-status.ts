import { z } from 'zod'
import {
  actionClient,
  authenticatedActionClient,
} from '@/lib/actions/safe-action'
import { getRuntimeStatus } from '@/lib/runtime-status'

const runtimeStatusRequestSchema = z.object({
  includeIntegrations: z.boolean().default(true),
})

export const getRuntimeStatusAction = actionClient
  .metadata({
    actionName: 'get-runtime-status',
    access: 'public',
  })
  .inputSchema(runtimeStatusRequestSchema)
  .action(async ({ parsedInput }) => {
    'use server'

    const runtimeStatus = getRuntimeStatus()

    if (parsedInput.includeIntegrations) {
      return runtimeStatus
    }

    return {
      status: runtimeStatus.status,
      timestamp: runtimeStatus.timestamp,
      environment: runtimeStatus.environment,
      summary: runtimeStatus.summary,
    }
  })

export const requireAuthenticatedOperatorAction = authenticatedActionClient
  .metadata({
    actionName: 'require-authenticated-operator',
    access: 'authenticated',
  })
  .action(async ({ ctx }) => {
    'use server'

    const operatorId = ctx.session.user?.id

    if (!operatorId) {
      throw new Error('Authenticated operator is missing a user id.')
    }

    return {
      operatorId,
    }
  })
