import { format } from 'date-fns'
import { NextResponse } from 'next/server'
import { requireAdminContext } from '@/lib/admin/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    await requireAdminContext()
    const client = getSupabaseServerClient({ serviceRole: true })

    if (!client) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { data, error } = await client
      .from('waitlist_leads')
      .select(
        'id, name, email, restaurant_name, notes, created_at, source, status, last_contacted_at, converted_at'
      )
      .order('created_at', { ascending: false })
      .limit(500)

    if (error) {
      throw error
    }

    const rows: string[][] = [
      [
        'Name',
        'Email',
        'Restaurant',
        'Source',
        'Status',
        'Last Contact',
        'Converted',
        'Notes',
        'Date',
      ],
      ...(data ?? []).map(
        (lead: {
          name: string
          email: string
          restaurant_name: string | null
          notes: string | null
          source?: string | null
          status?: string | null
          last_contacted_at?: string | null
          converted_at?: string | null
          created_at: string
        }) => [
          lead.name,
          lead.email,
          lead.restaurant_name ?? '',
          lead.source ?? 'waitlist',
          lead.status ?? 'new',
          lead.last_contacted_at
            ? format(new Date(lead.last_contacted_at), 'yyyy-MM-dd HH:mm')
            : '',
          lead.converted_at
            ? format(new Date(lead.converted_at), 'yyyy-MM-dd HH:mm')
            : '',
          (lead.notes ?? '').replace(/\n/g, ' '),
          format(new Date(lead.created_at), 'yyyy-MM-dd HH:mm'),
        ]
      ),
    ]

    const csv = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      )
      .join('\n')

    const filename = `gustia-waitlist-${format(new Date(), 'yyyy-MM-dd')}.csv`

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch {
    return new NextResponse('Unable to export.', { status: 400 })
  }
}
