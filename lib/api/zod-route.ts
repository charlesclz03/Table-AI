import { NextResponse } from 'next/server'
import { createZodRoute } from 'next-zod-route'
import { z } from 'zod'
import { ensureServerOnly } from '@/lib/server-only'

ensureServerOnly('lib/api/zod-route')

export const routeMetadataSchema = z.object({
  routeName: z.string().min(1),
  visibility: z.enum(['public', 'internal']).default('internal'),
})

function makeRouteErrorMessage(error: Error) {
  return {
    message: error.message || 'Internal server error',
  }
}

export const appRoute = createZodRoute({
  handleServerError: (error) =>
    NextResponse.json(makeRouteErrorMessage(error), { status: 500 }),
}).defineMetadata(routeMetadataSchema)
