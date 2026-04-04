'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  Download,
  ExternalLink,
  LoaderCircle,
  MapPinned,
  Save,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { type AdminMenuItem } from '@/lib/admin/types'
import {
  buildConciergeMarkdownFiles,
  type ConciergeFaqEntry,
  type ConciergeTrainingPreview,
} from '@/lib/concierge/templates'
import {
  DEFAULT_THEME_KEY,
  DEFAULT_TTS_VOICE,
  OPENAI_TTS_VOICES,
  THEME_OPTIONS,
} from '@/lib/themes'

interface ConciergeTrainingEditorProps {
  initialDraft: ConciergeTrainingPreview
  initialMenuItems: AdminMenuItem[]
}

function listToTextarea(values: string[]) {
  return values.join('\n')
}

function textareaToList(value: string) {
  return value
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function ConciergeTrainingEditor({
  initialDraft,
  initialMenuItems,
}: ConciergeTrainingEditorProps) {
  const [draft, setDraft] = useState(initialDraft)
  const [menuItems, setMenuItems] = useState(initialMenuItems)
  const [importUrl, setImportUrl] = useState(initialDraft.googleMapsUrl)
  const [warnings, setWarnings] = useState<string[]>([])
  const [status, setStatus] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const markdown = useMemo(() => buildConciergeMarkdownFiles(draft), [draft])
  const faqEntries = useMemo(() => {
    const existing = draft.faqEntries.length > 0 ? draft.faqEntries : []

    return [
      ...existing,
      ...Array.from({ length: Math.max(0, 5 - existing.length) }, () => ({
        question: '',
        answer: '',
      })),
    ].slice(0, 5)
  }, [draft.faqEntries])

  function updateDraft<K extends keyof ConciergeTrainingPreview>(
    key: K,
    value: ConciergeTrainingPreview[K]
  ) {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function updateFaq(index: number, patch: Partial<ConciergeFaqEntry>) {
    const nextFaqs = [...faqEntries]
    nextFaqs[index] = {
      ...nextFaqs[index],
      ...patch,
    }

    updateDraft(
      'faqEntries',
      nextFaqs.filter((entry) => entry.question.trim() || entry.answer.trim())
    )
  }

  async function handleGoogleImport() {
    setIsImporting(true)
    setStatus('')
    setWarnings([])

    try {
      const response = await fetch('/api/admin/onboarding/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleMapsUrl: importUrl.trim(),
        }),
      })

      const payload = (await response.json()) as {
        draft?: ConciergeTrainingPreview
        menuItems?: AdminMenuItem[]
        warnings?: string[]
        error?: string
      }

      if (!response.ok || !payload.draft) {
        throw new Error(payload.error || 'Unable to import Google Maps data.')
      }

      setDraft(payload.draft)
      setImportUrl(payload.draft.googleMapsUrl)
      setMenuItems(payload.menuItems || [])
      setWarnings(payload.warnings || [])
      setStatus('Google Maps data imported. Review the draft, then save it.')
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : 'Unable to import Google Maps data.'
      )
    } finally {
      setIsImporting(false)
    }
  }

  async function handleSave() {
    setIsSaving(true)
    setStatus('')

    try {
      const response = await fetch('/api/admin/onboarding', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...draft,
          menuItems,
        }),
      })

      const payload = (await response.json()) as {
        soulMd?: string
        rulesMd?: string
        saved?: boolean
        error?: string
      }

      if (!response.ok || !payload.saved) {
        throw new Error(payload.error || 'Unable to save concierge training.')
      }

      setStatus(
        'Concierge training saved. The restaurant profile, menu, soul.md, and rules.md are now updated.'
      )
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : 'Unable to save concierge training.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
            Fast Demo Creation
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">
            Paste a Google Maps place URL and train the concierge in minutes
          </h3>
          <p className="mt-3 text-sm leading-6 text-white/70">
            We pull place details, contact info, hours, reviews, and available
            photos, then generate editable concierge markdown for the demo.
          </p>
          <div className="mt-5 flex flex-col gap-3 lg:flex-row">
            <input
              value={importUrl}
              onChange={(event) => setImportUrl(event.target.value)}
              placeholder="https://www.google.com/maps/place/..."
              className="w-full rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-amber-300/40"
            />
            <Button
              variant="brand"
              onClick={() => void handleGoogleImport()}
              isLoading={isImporting}
            >
              <MapPinned className="mr-2 h-4 w-4" />
              Import from Maps
            </Button>
          </div>
          {status ? (
            <p className="mt-4 rounded-[20px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75">
              {status}
            </p>
          ) : null}
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
            Demo Checklist
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-white/70">
            <li>Import restaurant identity, hours, reviews, and photos.</li>
            <li>Review generated greeting, personality, and FAQs.</li>
            <li>
              Save the draft to update `soul.md`, `rules.md`, and menu data.
            </li>
            <li>
              Refine dishes in{' '}
              <Link href="/admin/menu" className="text-amber-100 underline">
                Menu Editor
              </Link>{' '}
              if the photo scan missed anything.
            </li>
          </ul>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <article className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
            <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
              Restaurant Identity
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="text-sm text-white/70">
                Restaurant name
                <input
                  value={draft.restaurantName}
                  onChange={(event) =>
                    updateDraft('restaurantName', event.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amber-300/40"
                />
              </label>

              <label className="text-sm text-white/70">
                Contact email
                <input
                  value={draft.email}
                  onChange={(event) => updateDraft('email', event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amber-300/40"
                />
              </label>

              <label className="text-sm text-white/70 md:col-span-2">
                Address
                <input
                  value={draft.address}
                  onChange={(event) =>
                    updateDraft('address', event.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amber-300/40"
                />
              </label>

              <label className="text-sm text-white/70">
                Phone
                <input
                  value={draft.phone}
                  onChange={(event) => updateDraft('phone', event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amber-300/40"
                />
              </label>

              <label className="text-sm text-white/70">
                Website
                <input
                  value={draft.websiteUrl}
                  onChange={(event) =>
                    updateDraft('websiteUrl', event.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amber-300/40"
                />
              </label>

              <label className="text-sm text-white/70 md:col-span-2">
                Opening hours
                <textarea
                  rows={5}
                  value={listToTextarea(draft.openingHours)}
                  onChange={(event) =>
                    updateDraft(
                      'openingHours',
                      textareaToList(event.target.value)
                    )
                  }
                  className="mt-2 w-full rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amber-300/40"
                  placeholder="Monday: 12:00-15:00, 19:00-23:00"
                />
              </label>
            </div>
          </article>

          <article className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
            <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
              Concierge Voice
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="text-sm text-white/70 md:col-span-2">
                Personality description
                <textarea
                  rows={4}
                  value={draft.personalityDescription}
                  onChange={(event) =>
                    updateDraft('personalityDescription', event.target.value)
                  }
                  className="mt-2 w-full rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amber-300/40"
                />
              </label>

              <label className="text-sm text-white/70 md:col-span-2">
                Greeting message
                <textarea
                  rows={3}
                  value={draft.greetingMessage}
                  onChange={(event) =>
                    updateDraft('greetingMessage', event.target.value)
                  }
                  className="mt-2 w-full rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amber-300/40"
                />
              </label>

              <label className="text-sm text-white/70">
                Languages supported
                <input
                  value={draft.languagesSupported.join(', ')}
                  onChange={(event) =>
                    updateDraft(
                      'languagesSupported',
                      event.target.value
                        .split(',')
                        .map((entry) => entry.trim())
                        .filter(Boolean)
                    )
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amber-300/40"
                  placeholder="Portuguese, English"
                />
              </label>

              <label className="text-sm text-white/70">
                Voice selection
                <select
                  value={draft.voiceSelection || DEFAULT_TTS_VOICE}
                  onChange={(event) =>
                    updateDraft('voiceSelection', event.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amber-300/40"
                >
                  {[DEFAULT_TTS_VOICE, ...OPENAI_TTS_VOICES].map((voice) => (
                    <option key={voice} value={voice}>
                      {voice}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-white/70">
                Theme selection
                <select
                  value={draft.themeSelection || DEFAULT_THEME_KEY}
                  onChange={(event) =>
                    updateDraft('themeSelection', event.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amber-300/40"
                >
                  {THEME_OPTIONS.map((theme) => (
                    <option key={theme.key} value={theme.key}>
                      {theme.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70">
                Theme preview: {draft.themeSelection || DEFAULT_THEME_KEY}
              </div>
            </div>
          </article>

          <article className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
            <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
              Recommendations and Knowledge
            </p>
            <div className="mt-4 grid gap-4">
              <label className="text-sm text-white/70">
                Signature dishes
                <textarea
                  rows={3}
                  value={listToTextarea(draft.signatureDishes)}
                  onChange={(event) =>
                    updateDraft(
                      'signatureDishes',
                      textareaToList(event.target.value)
                    )
                  }
                  className="mt-2 w-full rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amber-300/40"
                />
              </label>

              <label className="text-sm text-white/70">
                Recommendation notes
                <textarea
                  rows={4}
                  value={listToTextarea(draft.recommendationNotes)}
                  onChange={(event) =>
                    updateDraft(
                      'recommendationNotes',
                      textareaToList(event.target.value)
                    )
                  }
                  className="mt-2 w-full rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amber-300/40"
                />
              </label>

              <label className="text-sm text-white/70">
                Wine pairings
                <textarea
                  rows={3}
                  value={listToTextarea(draft.winePairings)}
                  onChange={(event) =>
                    updateDraft(
                      'winePairings',
                      textareaToList(event.target.value)
                    )
                  }
                  className="mt-2 w-full rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amber-300/40"
                />
              </label>

              <label className="text-sm text-white/70">
                Menu knowledge
                <textarea
                  rows={5}
                  value={listToTextarea(draft.menuKnowledge)}
                  onChange={(event) =>
                    updateDraft(
                      'menuKnowledge',
                      textareaToList(event.target.value)
                    )
                  }
                  className="mt-2 w-full rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amber-300/40"
                />
              </label>

              <label className="text-sm text-white/70">
                Review highlights
                <textarea
                  rows={4}
                  value={listToTextarea(draft.reviewHighlights)}
                  onChange={(event) =>
                    updateDraft(
                      'reviewHighlights',
                      textareaToList(event.target.value)
                    )
                  }
                  className="mt-2 w-full rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amber-300/40"
                />
              </label>
            </div>
          </article>

          <article className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
            <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
              FAQs
            </p>
            <div className="mt-4 space-y-4">
              {faqEntries.map((entry, index) => (
                <div
                  key={`faq-${index}`}
                  className="rounded-[24px] border border-white/10 bg-black/20 p-4"
                >
                  <label className="text-sm text-white/70">
                    Question {index + 1}
                    <input
                      value={entry.question}
                      onChange={(event) =>
                        updateFaq(index, { question: event.target.value })
                      }
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amber-300/40"
                    />
                  </label>
                  <label className="mt-3 block text-sm text-white/70">
                    Answer
                    <textarea
                      rows={3}
                      value={entry.answer}
                      onChange={(event) =>
                        updateFaq(index, { answer: event.target.value })
                      }
                      className="mt-2 w-full rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amber-300/40"
                    />
                  </label>
                </div>
              ))}
            </div>
          </article>
        </div>

        <aside className="space-y-6">
          <article className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-amber-300/20 bg-amber-300/10 p-3 text-amber-100">
                {isImporting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </span>
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
                  Import Results
                </p>
                <h3 className="mt-1 text-lg font-semibold text-white">
                  Demo payload
                </h3>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-sm text-white/75">
              <p className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                Menu items imported: {menuItems.length}
              </p>
              <p className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                Photos found: {draft.photoUrls.length}
              </p>
              {draft.googleMapsUrl ? (
                <a
                  href={draft.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-3 text-amber-100"
                >
                  Open source URL <ExternalLink className="h-4 w-4" />
                </a>
              ) : null}
            </div>

            {warnings.length > 0 ? (
              <div className="mt-4 space-y-2">
                {warnings.map((warning) => (
                  <p
                    key={warning}
                    className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-50"
                  >
                    {warning}
                  </p>
                ))}
              </div>
            ) : null}

            {draft.photoUrls.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {draft.photoUrls.slice(0, 4).map((photoUrl) => (
                  <a
                    key={photoUrl}
                    href={photoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="overflow-hidden rounded-[20px] border border-white/10 bg-black/20"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoUrl}
                      alt="Restaurant from Google Maps"
                      className="h-28 w-full object-cover"
                    />
                  </a>
                ))}
              </div>
            ) : null}
          </article>

          <article className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
                  Generated Files
                </p>
                <h3 className="mt-1 text-lg font-semibold text-white">
                  `soul.md` and `rules.md`
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() =>
                    downloadTextFile(
                      `${draft.restaurantName || 'restaurant'}-soul.md`,
                      markdown.soulMd
                    )
                  }
                >
                  <Download className="mr-2 h-4 w-4" />
                  Soul
                </Button>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() =>
                    downloadTextFile(
                      `${draft.restaurantName || 'restaurant'}-rules.md`,
                      markdown.rulesMd
                    )
                  }
                >
                  <Download className="mr-2 h-4 w-4" />
                  Rules
                </Button>
              </div>
            </div>

            <label className="mt-4 block text-sm text-white/70">
              soul.md preview
              <textarea
                readOnly
                rows={14}
                value={markdown.soulMd}
                className="mt-2 w-full rounded-[24px] border border-white/10 bg-black/30 px-4 py-3 text-xs text-white/85 outline-none"
              />
            </label>

            <label className="mt-4 block text-sm text-white/70">
              rules.md preview
              <textarea
                readOnly
                rows={14}
                value={markdown.rulesMd}
                className="mt-2 w-full rounded-[24px] border border-white/10 bg-black/30 px-4 py-3 text-xs text-white/85 outline-none"
              />
            </label>
          </article>

          <article className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
            <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
              Save to Demo
            </p>
            <p className="mt-3 text-sm leading-6 text-white/70">
              Saving updates the live restaurant record used by guest chat and
              carries the menu draft into Supabase.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Button
                variant="brand"
                onClick={() => void handleSave()}
                isLoading={isSaving}
              >
                <Save className="mr-2 h-4 w-4" />
                Save concierge training
              </Button>
              <Link
                href="/admin/menu"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                Review imported menu items in Menu Editor
              </Link>
            </div>
          </article>
        </aside>
      </section>
    </div>
  )
}
