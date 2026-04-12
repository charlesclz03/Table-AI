'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import {
  LEAD_STATUS_LABELS,
  type LeadPipelineStatus,
} from '@/lib/admin/lead-pipeline'
import { cn } from '@/lib/utils'

interface WaitlistLeadRecord {
  id: string
  name: string
  email: string
  restaurant_name: string | null
  notes: string | null
  created_at: string
  source: string
  status: LeadPipelineStatus
  last_contacted_at?: string | null
  converted_at?: string | null
  converted_restaurant_id?: string | null
}

const STATUS_ORDER: LeadPipelineStatus[] = [
  'new',
  'contacted',
  'qualified',
  'converted',
]

const SOURCE_LABELS: Record<string, string> = {
  waitlist: 'Waitlist',
  referral: 'Referral',
  direct: 'Direct',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  google: 'Google',
}

function SourceBadge({ source }: { source: string }) {
  return (
    <span
      className={cn(
        'rounded-full border px-2 py-0.5 text-[11px] font-medium',
        source === 'referral'
          ? 'border-emerald-300/30 bg-emerald-400/10 text-emerald-100'
          : 'border-white/20 bg-white/5 text-white/60'
      )}
    >
      {SOURCE_LABELS[source] ?? source}
    </span>
  )
}

function StatusPill({ status }: { status: LeadPipelineStatus }) {
  const styles: Record<LeadPipelineStatus, string> = {
    new: 'border-blue-300/30 bg-blue-400/10 text-blue-100',
    contacted: 'border-amber-300/30 bg-amber-400/10 text-amber-100',
    qualified: 'border-purple-300/30 bg-purple-400/10 text-purple-100',
    converted: 'border-emerald-300/30 bg-emerald-400/10 text-emerald-100',
  }

  return (
    <span
      className={cn(
        'rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide',
        styles[status]
      )}
    >
      {LEAD_STATUS_LABELS[status]}
    </span>
  )
}

function LeadRow({
  lead,
  onUpdate,
  isUpdating,
}: {
  lead: WaitlistLeadRecord
  onUpdate: (leadId: string, status: LeadPipelineStatus) => void
  isUpdating: boolean
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[24px] border border-white/10 bg-black/20 p-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-white">{lead.name}</p>
          <SourceBadge source={lead.source} />
          <StatusPill status={lead.status} />
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/60">
          <a
            href={`mailto:${lead.email}`}
            className="text-amber-100/80 underline-offset-2 transition hover:text-amber-100 hover:underline"
          >
            {lead.email}
          </a>
          {lead.restaurant_name ? <span>{lead.restaurant_name}</span> : null}
          <span>Added {format(new Date(lead.created_at), 'MMM d, yyyy')}</span>
          {lead.last_contacted_at ? (
            <span>
              Last contact {format(new Date(lead.last_contacted_at), 'MMM d')}
            </span>
          ) : null}
        </div>
        {lead.notes ? (
          <p className="mt-2 max-w-xl text-xs leading-5 text-white/50">
            {lead.notes}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {STATUS_ORDER.filter((s) => s !== lead.status).map((nextStatus) => (
          <button
            key={nextStatus}
            onClick={() => onUpdate(lead.id, nextStatus)}
            disabled={isUpdating}
            className={cn(
              'rounded-full border px-3 py-1.5 text-[11px] font-medium transition',
              'border-white/20 bg-white/5 text-white/60',
              'hover:border-white/40 hover:bg-white/10 hover:text-white',
              'disabled:cursor-not-allowed disabled:opacity-40'
            )}
          >
            → {LEAD_STATUS_LABELS[nextStatus]}
          </button>
        ))}
      </div>
    </div>
  )
}

interface LeadsClientPageProps {
  initialLeads: WaitlistLeadRecord[]
}

export function LeadsClientPage({ initialLeads }: LeadsClientPageProps) {
  const [leads, setLeads] = useState<WaitlistLeadRecord[]>(initialLeads)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<LeadPipelineStatus | 'all'>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  async function fetchLeads() {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/leads')
      const data = (await response.json()) as { leads?: WaitlistLeadRecord[] }
      if (!response.ok) throw new Error('Unable to load leads.')
      setLeads(data.leads ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load leads.')
    } finally {
      setIsLoading(false)
    }
  }

  const filtered =
    filter === 'all' ? leads : leads.filter((l) => l.status === filter)

  const counts: Record<LeadPipelineStatus, number> = {
    new: 0,
    contacted: 0,
    qualified: 0,
    converted: 0,
  }
  for (const lead of leads) {
    counts[lead.status]++
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-medium transition',
              filter === 'all'
                ? 'border-amber-300/50 bg-amber-300/15 text-amber-100'
                : 'border-white/20 bg-white/5 text-white/60 hover:border-white/40 hover:text-white'
            )}
          >
            All ({leads.length})
          </button>
          {STATUS_ORDER.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                'rounded-full border px-4 py-2 text-sm font-medium transition',
                filter === s
                  ? 'border-amber-300/50 bg-amber-300/15 text-amber-100'
                  : 'border-white/20 bg-white/5 text-white/60 hover:border-white/40 hover:text-white'
              )}
            >
              {LEAD_STATUS_LABELS[s]} ({counts[s]})
            </button>
          ))}
        </div>

        <button
          onClick={fetchLeads}
          disabled={isLoading}
          className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/60 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error ? (
        <div className="mb-4 rounded-[20px] border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-white/10 bg-white/5 px-6 py-12 text-center">
          <p className="text-sm text-white/55">
            {filter === 'all'
              ? 'No leads yet. Share the waitlist page to start collecting interest.'
              : `No ${LEAD_STATUS_LABELS[filter as LeadPipelineStatus]} leads.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => (
            <LeadRow
              key={lead.id}
              lead={lead}
              isUpdating={updatingId === lead.id}
              onUpdate={async (leadId, status) => {
                setUpdatingId(leadId)
                try {
                  const res = await fetch('/api/admin/leads', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ leadId, status }),
                  })
                  if (res.ok) {
                    setLeads((prev) =>
                      prev.map((l) => (l.id === leadId ? { ...l, status } : l))
                    )
                  }
                } finally {
                  setUpdatingId(null)
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
