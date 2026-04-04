import { DEFAULT_THEME_KEY, DEFAULT_TTS_VOICE } from '@/lib/themes'

export interface ConciergeFaqEntry {
  question: string
  answer: string
}

export interface ConciergeTrainingDraft {
  googleMapsUrl: string
  googlePlaceId: string
  restaurantName: string
  address: string
  phone: string
  email: string
  websiteUrl: string
  openingHours: string[]
  personalityDescription: string
  greetingMessage: string
  languagesSupported: string[]
  signatureDishes: string[]
  winePairings: string[]
  faqEntries: ConciergeFaqEntry[]
  recommendationNotes: string[]
  menuKnowledge: string[]
  reviewHighlights: string[]
  photoUrls: string[]
  voiceSelection: string
  themeSelection: string
  menuImportNotes: string[]
}

export interface ConciergeTrainingPreview extends ConciergeTrainingDraft {
  soulMd: string
  rulesMd: string
}

function sanitizeLine(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function sanitizeList(values: string[]) {
  return values.map(sanitizeLine).filter(Boolean)
}

function dedupeList(values: string[]) {
  const seen = new Set<string>()
  const next: string[] = []

  for (const value of sanitizeList(values)) {
    const key = value.toLowerCase()

    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    next.push(value)
  }

  return next
}

function formatBullets(values: string[], fallback: string) {
  const items = dedupeList(values)

  if (items.length === 0) {
    return `- ${fallback}`
  }

  return items.map((value) => `- ${value}`).join('\n')
}

function formatFaqs(entries: ConciergeFaqEntry[]) {
  const items = entries
    .map((entry) => ({
      question: sanitizeLine(entry.question),
      answer: sanitizeLine(entry.answer),
    }))
    .filter((entry) => entry.question || entry.answer)

  if (items.length === 0) {
    return [
      '- Can I book a table?',
      '  Answer: Please call the restaurant directly for reservations.',
      '- Do you handle allergies?',
      '  Answer: Let me get a staff member to confirm allergy details safely.',
    ].join('\n')
  }

  return items
    .map((entry) => {
      const question = entry.question || 'Guest question'
      const answer = entry.answer || 'Let me check with the staff.'

      return `- ${question}\n  Answer: ${answer}`
    })
    .join('\n')
}

function getContactLine(label: string, value: string, fallback: string) {
  return `- ${label}: ${sanitizeLine(value) || fallback}`
}

export function normalizeConciergeTrainingDraft(
  draft: Partial<ConciergeTrainingDraft>
): ConciergeTrainingDraft {
  return {
    googleMapsUrl: sanitizeLine(draft.googleMapsUrl || ''),
    googlePlaceId: sanitizeLine(draft.googlePlaceId || ''),
    restaurantName: sanitizeLine(draft.restaurantName || 'Your Restaurant'),
    address: sanitizeLine(draft.address || ''),
    phone: sanitizeLine(draft.phone || ''),
    email: sanitizeLine(draft.email || ''),
    websiteUrl: sanitizeLine(draft.websiteUrl || ''),
    openingHours: dedupeList(draft.openingHours || []),
    personalityDescription:
      sanitizeLine(draft.personalityDescription || '') ||
      'Warm, knowledgeable, and grounded in Portuguese hospitality.',
    greetingMessage:
      sanitizeLine(draft.greetingMessage || '') ||
      `Welcome to ${sanitizeLine(draft.restaurantName || 'our restaurant')}. I'm your AI concierge. What can I help you with tonight?`,
    languagesSupported:
      dedupeList(draft.languagesSupported || []).length > 0
        ? dedupeList(draft.languagesSupported || [])
        : ['Portuguese', 'English'],
    signatureDishes: dedupeList(draft.signatureDishes || []),
    winePairings: dedupeList(draft.winePairings || []),
    faqEntries: (draft.faqEntries || []).map((entry) => ({
      question: sanitizeLine(entry.question),
      answer: sanitizeLine(entry.answer),
    })),
    recommendationNotes: dedupeList(draft.recommendationNotes || []),
    menuKnowledge: dedupeList(draft.menuKnowledge || []),
    reviewHighlights: dedupeList(draft.reviewHighlights || []),
    photoUrls: dedupeList(draft.photoUrls || []),
    voiceSelection: sanitizeLine(draft.voiceSelection || DEFAULT_TTS_VOICE),
    themeSelection: sanitizeLine(draft.themeSelection || DEFAULT_THEME_KEY),
    menuImportNotes: dedupeList(draft.menuImportNotes || []),
  }
}

export function buildSoulMarkdown(draftInput: Partial<ConciergeTrainingDraft>) {
  const draft = normalizeConciergeTrainingDraft(draftInput)
  const hoursLine =
    draft.openingHours.length > 0
      ? draft.openingHours.join(' | ')
      : 'Hours not confirmed yet'

  return [
    `# ${draft.restaurantName} - AI Concierge`,
    '',
    '## Identity',
    `You are ${draft.restaurantName}'s AI concierge.`,
    getContactLine('Address', draft.address, 'Ask the staff to confirm'),
    getContactLine('Open', hoursLine, 'Hours not confirmed yet'),
    getContactLine('Phone', draft.phone, 'Ask the staff to confirm'),
    getContactLine('Email', draft.email, 'No public email available'),
    getContactLine('Website', draft.websiteUrl, 'No website on file'),
    getContactLine(
      'Google Maps',
      draft.googleMapsUrl,
      'No Google Maps link on file'
    ),
    '',
    '## Personality',
    draft.personalityDescription,
    `- Speaks: ${draft.languagesSupported.join(', ') || 'Portuguese, English'}`,
    `- Voice: ${draft.voiceSelection}`,
    `- Theme: ${draft.themeSelection}`,
    '',
    '## Menu Knowledge',
    formatBullets(
      draft.menuKnowledge,
      'Menu knowledge still needs a staff review before going live.'
    ),
    '',
    '## Signature Dishes',
    formatBullets(
      draft.signatureDishes,
      'Signature dishes still need to be confirmed by the restaurant.'
    ),
    '',
    '## Recommendations',
    formatBullets(
      draft.recommendationNotes,
      'If a guest asks for a recommendation, offer the signature dishes first.'
    ),
    '',
    '## Review Highlights',
    formatBullets(
      draft.reviewHighlights,
      'Guest review highlights are still being collected.'
    ),
    '',
    '## Wine Pairings',
    formatBullets(
      draft.winePairings,
      'If no pairing is confirmed, offer to check with the staff.'
    ),
    '',
    '## Rules',
    '- Answer only from menu knowledge, restaurant details, and these notes.',
    '- If unsure, say "Let me check with the staff."',
    '- Never make up prices, dishes, allergies, hours, or reservation availability.',
    '- Treat allergy and dietary questions as high-risk and escalate when uncertain.',
  ].join('\n')
}

export function buildRulesMarkdown(
  draftInput: Partial<ConciergeTrainingDraft>
) {
  const draft = normalizeConciergeTrainingDraft(draftInput)
  const hoursLine =
    draft.openingHours.length > 0
      ? draft.openingHours.join(' | ')
      : 'Hours not confirmed yet'

  return [
    `# ${draft.restaurantName} - Conversation Rules`,
    '',
    '## Greeting',
    `"${draft.greetingMessage}"`,
    '',
    '## Core Rules',
    '- Keep replies warm, concise, and helpful.',
    '- Prioritize menu accuracy over sounding clever.',
    '- Never invent unavailable dishes, pricing, pairings, or policies.',
    '- If a guest asks for something uncertain, say "Let me check with the staff."',
    '',
    '## Quick Facts',
    getContactLine('Address', draft.address, 'Ask the staff to confirm'),
    getContactLine('Hours', hoursLine, 'Hours not confirmed yet'),
    getContactLine('Phone', draft.phone, 'Ask the staff to confirm'),
    getContactLine('Email', draft.email, 'No public email available'),
    '',
    '## Escalation',
    '- Allergies: "Let me get someone to help you with that safely."',
    '- Complaints: "Let me connect you with our team right away."',
    `- Reservations: "Our phone is ${draft.phone || 'available from the staff'}."`,
    '- Wine questions with uncertainty: "Let me check the wine list with the staff."',
    '',
    '## FAQ Playbook',
    formatFaqs(draft.faqEntries),
    '',
    '## Wine Pairings',
    formatBullets(
      draft.winePairings,
      'When no pairing is confirmed, offer to check the current wine list.'
    ),
  ].join('\n')
}

export function buildConciergeMarkdownFiles(
  draftInput: Partial<ConciergeTrainingDraft>
) {
  const draft = normalizeConciergeTrainingDraft(draftInput)

  return {
    soulMd: buildSoulMarkdown(draft),
    rulesMd: buildRulesMarkdown(draft),
  }
}
