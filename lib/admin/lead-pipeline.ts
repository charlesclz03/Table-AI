export const LEAD_PIPELINE_STATUSES = [
  'new',
  'contacted',
  'qualified',
  'converted',
] as const

export type LeadPipelineStatus = (typeof LEAD_PIPELINE_STATUSES)[number]

export const LEAD_STATUS_LABELS: Record<LeadPipelineStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  converted: 'Converted',
}

export interface WaitlistLeadRecord {
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
