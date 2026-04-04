import { NextResponse } from 'next/server'
import { getChangelogEntries, latestChangelogVersion } from '@/lib/changelog'

export async function GET() {
  return NextResponse.json({
    latestVersion: latestChangelogVersion,
    entries: getChangelogEntries(),
  })
}
