import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminContext } from '@/lib/admin/server'
import { type LeadPipelineStatus } from '@/lib/admin/lead-pipeline'
import { listWaitlistLeads, updateWaitlistLeadStatus } from '@/lib/admin/leads'
import { guardApiRoute } from '@/lib/security/api-protection'
import { RequestGuardError } from '@/lib/security/request-guards'

const ALL_STATUSES: [LeadPipelineStatus, ...LeadPipelineStatus[]] = [
  'new',
  'contacted',
  'qualified',
  'converted',
]

const patchLeadSchema = z.object({
  leadId: z.string().uuid(),
  status: z.enum(ALL_STATUSES),
})

export async function GET(request: Request) {
  try {
    const protection = guardApiRoute(request, {
      bucket: 'admin-leads-read',
      limit: 20,
      maxBodyBytes: 1024,
      rateLimitSource: 'api.admin.leads.read',
      windowMs: 5 * 60 * 1000,
    })

    await requireAdminContext()
    const leads = await listWaitlistLeads()

    return NextResponse.json(
      { leads },
      {
        headers: protection.headers,
      }
    )
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to load the lead pipeline right now.',
      },
      {
        status: error instanceof RequestGuardError ? error.status : 400,
      }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const protection = guardApiRoute(request, {
      bucket: 'admin-leads-update',
      limit: 30,
      maxBodyBytes: 4 * 1024,
      rateLimitSource: 'api.admin.leads.update',
      windowMs: 10 * 60 * 1000,
    })

    await requireAdminContext()
    const body = patchLeadSchema.parse(await request.json())
    const lead = await updateWaitlistLeadStatus(body)

    return NextResponse.json(
      { lead },
      {
        headers: protection.headers,
      }
    )
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to update the lead status right now.',
      },
      {
        status: error instanceof RequestGuardError ? error.status : 400,
      }
    )
  }
}
