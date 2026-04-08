import { format } from 'date-fns'
import { requireAdminContext } from '@/lib/admin/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { AdminPageShell } from '@/components/admin/AdminPageShell'

interface WaitlistLead {
  id: string
  name: string
  email: string
  restaurant_name: string | null
  notes: string | null
  created_at: string
}

async function getWaitlistLeads(): Promise<WaitlistLead[]> {
  const client = getSupabaseServerClient({ serviceRole: true })

  if (!client) {
    return []
  }

  const { data, error } = await client
    .from('waitlist_leads')
    .select('id, name, email, restaurant_name, notes, created_at')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) {
    return []
  }

  return (data as WaitlistLead[]) ?? []
}

export default async function AdminWaitlistPage() {
  await requireAdminContext()
  const leads = await getWaitlistLeads()

  return (
    <AdminPageShell
      eyebrow="Waitlist"
      title="Early access submissions"
      description="People who signed up for early access."
      actions={
        leads.length > 0 ? (
          <a
            href="/api/admin/waitlist/export"
            className="rounded-full border border-amber-300/40 bg-amber-300/10 px-5 py-2.5 text-sm text-amber-100 transition hover:bg-amber-300/20"
          >
            Export CSV
          </a>
        ) : undefined
      }
    >
      <div>
        {leads.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-white/10 bg-white/5 px-6 py-12 text-center">
            <p className="text-sm text-white/55">
              No waitlist submissions yet. Share /waitlist to collect early
              interest.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[24px] border border-white/10">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm text-white/80">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-[0.2em] text-white/45">
                    Name
                  </th>
                  <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-[0.2em] text-white/45">
                    Email
                  </th>
                  <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-[0.2em] text-white/45">
                    Restaurant
                  </th>
                  <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-[0.2em] text-white/45">
                    Notes
                  </th>
                  <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-[0.2em] text-white/45">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-black/20">
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td className="px-5 py-4">{lead.name}</td>
                    <td className="px-5 py-4">
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-amber-100/80 underline-offset-2 transition hover:text-amber-100 hover:underline"
                      >
                        {lead.email}
                      </a>
                    </td>
                    <td className="px-5 py-4">{lead.restaurant_name ?? '—'}</td>
                    <td className="max-w-[200px] truncate px-5 py-4 text-white/60">
                      {lead.notes ?? '—'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-white/60">
                      {format(new Date(lead.created_at), 'MMM d, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminPageShell>
  )
}
