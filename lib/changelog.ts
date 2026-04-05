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
    version: '1.1.3',
    date: '2026-04-05',
    changes: [
      {
        type: 'feature',
        text: 'Owners can now create invite links from the admin area and send guests directly into a claim flow for restaurant ownership',
      },
      {
        type: 'improvement',
        text: 'Email confirmation and billing handoff are now production-ready again, with live signup returning to Gustia and Stripe Checkout opening from the authenticated owner flow',
      },
      {
        type: 'fix',
        text: 'Demo chat no longer pings the live chat API in demo mode, which removes the old console 404 before the fallback reply appears',
      },
    ],
  },
  {
    version: '1.1.2',
    date: '2026-04-05',
    changes: [
      {
        type: 'improvement',
        text: 'Guest chat now builds concierge prompts only from server-fetched restaurant data instead of trusting browser-sent restaurant context',
      },
      {
        type: 'improvement',
        text: 'Stripe billing is now more reliable with persisted webhook replay protection and a billing ledger for checkout, subscription, and invoice events',
      },
      {
        type: 'fix',
        text: 'Error screens, loading states, and microphone permissions are now handled more gracefully across the owner and guest flows',
      },
    ],
  },
  {
    version: '1.1.1',
    date: '2026-04-04',
    changes: [
      {
        type: 'feature',
        text: 'Owners can now paste a Google Maps URL to bootstrap a restaurant demo inside the admin area',
      },
      {
        type: 'improvement',
        text: 'The new concierge training workspace generates editable soul.md and rules.md drafts before saving them live',
      },
      {
        type: 'fix',
        text: 'Restaurant setup is faster because address, hours, contact details, review highlights, and menu clues can now be prefilled from Google Maps',
      },
    ],
  },
  {
    version: '1.1.0',
    date: '2026-04-04',
    changes: [
      {
        type: 'feature',
        text: 'Owners now choose Monthly or Annual pricing on the public landing page before continuing into account creation and payment',
      },
      {
        type: 'improvement',
        text: 'Stripe Checkout now opens after sign-in and uses the authenticated owner email so billing stays attached to the correct restaurant account',
      },
      {
        type: 'fix',
        text: 'Activation billing now matches the live offer at EUR 99 instead of the older setup amount',
      },
    ],
  },
  {
    version: '1.0.9',
    date: '2026-04-04',
    changes: [
      {
        type: 'improvement',
        text: 'Azulejos now lives in one shared background layer so the app keeps the Portuguese tile texture behind the interface instead of inside content panels',
      },
      {
        type: 'improvement',
        text: 'Buttons, cards, inputs, alerts, and navigation now use a stricter glass system with tinted translucent surfaces instead of solid fills',
      },
    ],
  },
  {
    version: '1.0.8',
    date: '2026-04-04',
    changes: [
      {
        type: 'improvement',
        text: 'Guest theme onboarding now uses a swipeable orbital selector with a central preview sphere and rotating theme planets',
      },
      {
        type: 'improvement',
        text: 'Switching concierge themes now feels smoother with directional wine slosh, blurred side states, and clearer next-theme navigation',
      },
    ],
  },
  {
    version: '1.0.7',
    date: '2026-04-04',
    changes: [
      {
        type: 'improvement',
        text: 'Public contact links now point to contact@gustia.wine across the homepage, legal pages, and restaurant contact touchpoints',
      },
    ],
  },
  {
    version: '1.0.6',
    date: '2026-04-04',
    changes: [
      {
        type: 'feature',
        text: 'The public homepage now walks restaurant owners through Gustia with a four-step setup tutorial from menu import to guest usage',
      },
      {
        type: 'improvement',
        text: 'The landing page now uses a fixed azulejos backdrop, richer section color overlays, and smooth parallax reveals for a more premium mobile story',
      },
      {
        type: 'improvement',
        text: 'Pricing on the homepage now clearly presents Activation at EUR 99, then EUR 49 per month or EUR 470 per year with the 14-day guarantee',
      },
    ],
  },
  {
    version: '1.0.5',
    date: '2026-04-04',
    changes: [
      {
        type: 'improvement',
        text: 'Landing and owner-facing brand polish now reads consistently as Gustia across tracked app copy and release notes',
      },
      {
        type: 'fix',
        text: 'The app now ships a branded browser tab icon so production no longer shows a missing favicon request on first load',
      },
    ],
  },
  {
    version: '1.0.4',
    date: '2026-04-04',
    changes: [
      {
        type: 'feature',
        text: 'Guests can now preview each concierge theme with its own AI voice before entering chat',
      },
      {
        type: 'improvement',
        text: 'Theme onboarding now separates preview from confirmation, with localized greetings and clearer selection states',
      },
      {
        type: 'fix',
        text: 'Theme previews now fall back to text-only mode when OpenAI voice playback is unavailable instead of dropping the onboarding flow',
      },
    ],
  },
  {
    version: '1.0.3',
    date: '2026-04-04',
    changes: [
      {
        type: 'feature',
        text: 'Owners can now open a dedicated analytics dashboard for concierge usage, top questions, and guest engagement',
      },
      {
        type: 'improvement',
        text: 'Analytics now refresh automatically and show live trend cards, language mix, and recommendation traction without heavy charts',
      },
      {
        type: 'fix',
        text: 'Guest analytics storage now keeps only anonymized question metadata so owners get insight without exposing personal data',
      },
    ],
  },
  {
    version: '1.0.2',
    date: '2026-04-04',
    changes: [
      {
        type: 'feature',
        text: 'Owners can now upload menu photos or PDFs and let AI draft menu items automatically',
      },
      {
        type: 'improvement',
        text: 'Imported menu pages are merged, deduped, and reviewed before they replace the live menu',
      },
      {
        type: 'fix',
        text: 'Menu setup is faster for multilingual restaurants that previously had to enter every dish by hand',
      },
    ],
  },
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
