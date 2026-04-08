import { requireAdminContext } from '@/lib/admin/server'
import { listWaitlistLeads } from '@/lib/admin/leads'
import { AdminPageShell } from '@/components/admin/AdminPageShell'
import { LeadsClientPage } from '@/components/admin/LeadsClientPage'

export default async function AdminLeadsPage() {
  await requireAdminContext()
  const initialLeads = await listWaitlistLeads()

  return (
    <AdminPageShell
      eyebrow="Sales Pipeline"
      title="Lead pipeline"
      description="Track and convert waitlist leads into paying customers."
    >
      <LeadsClientPage initialLeads={initialLeads} />
    </AdminPageShell>
  )
}
