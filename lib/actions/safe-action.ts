import { createSafeActionClient } from 'next-safe-action'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { ensureServerOnly } from '@/lib/server-only'

ensureServerOnly('lib/actions/safe-action')

const actionMetadataSchema = z.object({
  actionName: z.string().min(1),
  access: z.enum(['public', 'authenticated']).default('public'),
})

export const actionClient = createSafeActionClient({
  defineMetadataSchema: () => actionMetadataSchema,
  defaultValidationErrorsShape: 'flattened',
  handleServerError(error) {
    return error.message || 'Unable to complete the action.'
  },
})

export const authenticatedActionClient = actionClient.use(async ({ next }) => {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error('Authentication required.')
  }

  return next({
    ctx: {
      session,
    },
  })
})
