import { appRoute } from '@/lib/api/zod-route'
import { getRuntimeStatus } from '@/lib/runtime-status'

export const GET = appRoute
  .metadata({
    routeName: 'health',
    visibility: 'public',
  })
  .handler(() => getRuntimeStatus())
