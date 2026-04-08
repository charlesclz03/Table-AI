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
      .select('id, name, email, restaurant_name, notes, created_at')
      .order('created_at', { ascending: false })
      .limit(500)

    if (error) {
      throw error
    }

    const rows: string[][] = [
      ['Name', 'Email', 'Restaurant', 'Notes', 'Date'],
      ...(data ?? []).map(
        (lead: {
          name: string
          email: string
          restaurant_name: string | null
          notes: string | null
          created_at: string
        }) => [
          lead.name,
          lead.email,
          lead.restaurant_name ?? '',
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
