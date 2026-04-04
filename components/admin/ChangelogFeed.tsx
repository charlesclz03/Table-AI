import { format, parseISO } from 'date-fns'
import {
  getGroupedChangelogEntries,
  type ChangelogChangeType,
  type ChangelogEntry,
} from '@/lib/changelog'

const changeTypeMeta: Record<
  ChangelogChangeType,
  {
    emoji: string
    label: string
    accent: string
  }
> = {
  feature: {
    emoji: '✨',
    label: 'Feature additions',
    accent:
      'border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-100 shadow-[0_18px_60px_rgba(217,70,239,0.14)]',
  },
  fix: {
    emoji: '🐛',
    label: 'Bug fixes',
    accent:
      'border-rose-400/20 bg-rose-500/10 text-rose-100 shadow-[0_18px_60px_rgba(244,63,94,0.12)]',
  },
  improvement: {
    emoji: '⚡',
    label: 'Improvements',
    accent:
      'border-violet-400/20 bg-violet-500/10 text-violet-100 shadow-[0_18px_60px_rgba(139,92,246,0.16)]',
  },
}

function formatVersionDate(value: string) {
  const parsed = parseISO(value)

  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return format(parsed, 'PPP')
}

export function ChangelogFeed({ entries }: { entries: ChangelogEntry[] }) {
  const groups = getGroupedChangelogEntries(entries)

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section
          key={group.date}
          className="rounded-[30px] border border-white/10 bg-white/[0.045] p-4 shadow-[0_24px_120px_rgba(3,5,12,0.4)] backdrop-blur xl:p-5"
        >
          <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.34em] text-violet-200/75">
                Release Date
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">
                {group.formattedDate}
              </h3>
            </div>
            <span className="inline-flex w-fit rounded-full border border-violet-300/20 bg-violet-300/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-violet-100">
              {group.entries.length} release
              {group.entries.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="mt-4 space-y-4">
            {group.entries.map((entry) => (
              <article
                key={`${entry.version}-${entry.date}`}
                className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-4 shadow-[0_20px_80px_rgba(12,15,28,0.45)] backdrop-blur"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">
                      Version
                    </p>
                    <h4 className="mt-2 text-2xl font-semibold text-white">
                      v{entry.version}
                    </h4>
                  </div>
                  <span className="inline-flex w-fit rounded-full border border-white/10 bg-black/25 px-4 py-2 text-sm text-white/70">
                    {formatVersionDate(entry.date)}
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  {(['feature', 'fix', 'improvement'] as const).map((type) => {
                    const matchingChanges = entry.changes.filter(
                      (change) => change.type === type
                    )

                    if (matchingChanges.length === 0) {
                      return null
                    }

                    const meta = changeTypeMeta[type]

                    return (
                      <section key={type} className="space-y-3">
                        <div
                          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${meta.accent}`}
                        >
                          <span aria-hidden>{meta.emoji}</span>
                          <span>{meta.label}</span>
                        </div>
                        <ul className="space-y-2">
                          {matchingChanges.map((change) => (
                            <li
                              key={change.text}
                              className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm leading-6 text-white/78"
                            >
                              {change.text}
                            </li>
                          ))}
                        </ul>
                      </section>
                    )
                  })}
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
