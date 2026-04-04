import { format, parseISO } from 'date-fns'

export type ChangelogChangeType = 'feature' | 'fix' | 'improvement'

export interface ChangelogChange {
  type: ChangelogChangeType
  text: string
}

export interface ChangelogEntry {
  version: string
  date: string
  changes: ChangelogChange[]
}

export const changelog: ChangelogEntry[] = [
  {
    version: '1.0.1',
    date: '2026-04-04',
    changes: [
      {
        type: 'feature',
        text: 'Owner admin now supports Supabase email/password login',
      },
      {
        type: 'improvement',
        text: 'Owner Google login now runs through Supabase Auth with safer session handling',
      },
      {
        type: 'fix',
        text: 'Owner restaurant access is now linked through owner accounts and RLS-ready ownership rules',
      },
    ],
  },
  {
    version: '1.0.0',
    date: '2026-04-04',
    changes: [
      { type: 'feature', text: 'AI concierge chat with voice support' },
      {
        type: 'feature',
        text: 'Multi-language support (EN, FR, ES, PT, IT, RU)',
      },
      { type: 'feature', text: 'Restaurant onboarding with quiz' },
      { type: 'feature', text: 'QR code generation' },
      { type: 'feature', text: 'Wine-themed AI avatar' },
      { type: 'feature', text: 'Google OAuth for restaurant owners' },
      { type: 'feature', text: 'Stripe payment integration' },
      {
        type: 'improvement',
        text: 'Owner admin dashboard for menu, QR, billing, and release visibility',
      },
    ],
  },
]

function compareSemanticVersions(a: string, b: string) {
  const partsA = a.split('.').map((part) => Number(part))
  const partsB = b.split('.').map((part) => Number(part))
  const length = Math.max(partsA.length, partsB.length)

  for (let index = 0; index < length; index += 1) {
    const partA = partsA[index] ?? 0
    const partB = partsB[index] ?? 0

    if (partA !== partB) {
      return partB - partA
    }
  }

  return 0
}

function getTimestamp(value: string) {
  const parsed = parseISO(value)

  if (Number.isNaN(parsed.getTime())) {
    return 0
  }

  return parsed.getTime()
}

export function getChangelogEntries() {
  return [...changelog].sort((entryA, entryB) => {
    const dateDifference = getTimestamp(entryB.date) - getTimestamp(entryA.date)

    if (dateDifference !== 0) {
      return dateDifference
    }

    return compareSemanticVersions(entryA.version, entryB.version)
  })
}

export function getGroupedChangelogEntries(entries = getChangelogEntries()) {
  return entries.reduce<
    Array<{
      date: string
      formattedDate: string
      entries: ChangelogEntry[]
    }>
  >((groups, entry) => {
    const existingGroup = groups.find((group) => group.date === entry.date)

    if (existingGroup) {
      existingGroup.entries.push(entry)
      return groups
    }

    groups.push({
      date: entry.date,
      formattedDate: format(parseISO(entry.date), 'EEEE, MMMM d, yyyy'),
      entries: [entry],
    })

    return groups
  }, [])
}

export const latestChangelogVersion =
  getChangelogEntries()[0]?.version ?? '0.0.0'
