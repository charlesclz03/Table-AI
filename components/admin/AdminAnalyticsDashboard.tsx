'use client'

import { startTransition, useEffect, useState } from 'react'
import {
  Activity,
  BarChart3,
  Clock3,
  Languages,
  MessageSquareMore,
  RefreshCw,
} from 'lucide-react'
import type {
  AdminAnalyticsPayload,
  AdminAnalyticsRange,
} from '@/lib/admin/types'
import { cn } from '@/lib/utils'

const RANGE_OPTIONS: Array<{
  label: string
  value: AdminAnalyticsRange
}> = [
  { label: '7d', value: '7' },
  { label: '30d', value: '30' },
  { label: 'All', value: 'all' },
]

function formatDelta(current: number, previous: number) {
  if (previous === 0) {
    if (current === 0) {
      return 'No change yet'
    }

    return `+${current} vs previous period`
  }

  const delta = current - previous
  const sign = delta > 0 ? '+' : ''
  const percentage = ((delta / previous) * 100).toFixed(0)

  return `${sign}${percentage}% vs previous period`
}

function getRangeSummaryLabel(range: AdminAnalyticsRange) {
  if (range === '30') {
    return 'Last 30 days'
  }

  if (range === 'all') {
    return 'All time'
  }

  return 'Last 7 days'
}

function AnalyticsBarChart({
  points,
}: {
  points: AdminAnalyticsPayload['usageByDay']
}) {
  const maxValue = Math.max(...points.map((point) => point.count), 1)
  const chartHeight = 168
  const chartWidth = 100
  const barWidth = chartWidth / Math.max(points.length, 1)

  return (
    <div className="rounded-[28px] border border-white/10 bg-black/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
            Usage Over Time
          </p>
          <p className="mt-2 text-sm text-white/65">
            Conversations per day over the last 14 days.
          </p>
        </div>
        <BarChart3 className="h-5 w-5 text-amber-100/70" />
      </div>

      <div className="mt-5">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="h-44 w-full"
          role="img"
          aria-label="Conversations per day"
        >
          {points.map((point, index) => {
            const barHeight = Math.max((point.count / maxValue) * 120, 4)
            const x = index * barWidth + barWidth * 0.14
            const y = 132 - barHeight

            return (
              <g key={point.date}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth * 0.72}
                  height={barHeight}
                  rx="1.8"
                  className="fill-amber-300/70"
                />
                <text
                  x={x + barWidth * 0.36}
                  y="147"
                  textAnchor="middle"
                  className="fill-white/45 text-[3px]"
                >
                  {index % 2 === 0 ? point.label : ''}
                </text>
                <text
                  x={x + barWidth * 0.36}
                  y={Math.max(y - 3, 9)}
                  textAnchor="middle"
                  className="fill-white text-[3.2px]"
                >
                  {point.count}
                </text>
              </g>
            )
          })}
          <line
            x1="0"
            y1="132"
            x2={chartWidth}
            y2="132"
            className="stroke-white/10"
            strokeWidth="0.6"
          />
        </svg>
      </div>
    </div>
  )
}

function LanguageBreakdown({
  distribution,
}: {
  distribution: AdminAnalyticsPayload['languageDistribution']
}) {
  return (
    <div className="space-y-3">
      {distribution.length > 0 ? (
        distribution.slice(0, 4).map((entry) => (
          <div key={entry.language}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-white/80">{entry.label}</span>
              <span className="text-white/55">{entry.share}%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-white/8">
              <div
                className="h-2 rounded-full bg-amber-300"
                style={{
                  width: `${Math.max(entry.share, 6)}%`,
                }}
              />
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-white/55">
          Language data will appear as new live concierge chats are logged.
        </p>
      )}
    </div>
  )
}

export function AdminAnalyticsDashboard({
  initialData,
}: {
  initialData: AdminAnalyticsPayload
}) {
  const [range, setRange] = useState<AdminAnalyticsRange>(initialData.range)
  const [analytics, setAnalytics] = useState(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const generatedAtLabel = `${analytics.generatedAt.slice(11, 16)} UTC`

  useEffect(() => {
    let cancelled = false

    async function loadAnalytics(activeRange: AdminAnalyticsRange) {
      setIsLoading(true)

      try {
        const response = await fetch(
          `/api/admin/analytics?range=${activeRange}`,
          {
            cache: 'no-store',
          }
        )
        const payload = (await response.json()) as AdminAnalyticsPayload & {
          error?: string
        }

        if (!response.ok) {
          throw new Error(payload.error || 'Unable to load analytics.')
        }

        if (!cancelled) {
          setAnalytics(payload)
          setError('')
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load analytics.'
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadAnalytics(range)

    const intervalId = window.setInterval(() => {
      void loadAnalytics(range)
    }, 30000)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [range])

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-white/6 p-4 backdrop-blur sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
              Live Owner Insights
            </p>
            <p className="mt-2 text-sm text-white/65">
              Auto-refreshes every 30 seconds and stores only anonymized
              question metadata.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  startTransition(() => {
                    setRange(option.value)
                  })
                }}
                className={cn(
                  'rounded-full border px-4 py-2 text-sm transition',
                  range === option.value
                    ? 'border-amber-300/40 bg-amber-300/15 text-amber-100'
                    : 'border-white/10 bg-black/20 text-white/70 hover:bg-white/10 hover:text-white'
                )}
              >
                {option.label}
              </button>
            ))}
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs text-white/55">
              <RefreshCw
                className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')}
              />
              Updated {generatedAtLabel}
            </span>
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </p>
        ) : null}
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        <article className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
              Total Conversations
            </p>
            <MessageSquareMore className="h-4 w-4 text-amber-100/70" />
          </div>
          <p className="mt-4 text-4xl font-semibold text-white">
            {analytics.totals.selected}
          </p>
          <p className="mt-2 text-sm text-white/65">
            {getRangeSummaryLabel(analytics.range)}
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-emerald-200/75">
            {formatDelta(
              analytics.totals.selected,
              analytics.totals.previousPeriod
            )}
          </p>
        </article>

        <article className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
              Avg Messages
            </p>
            <Activity className="h-4 w-4 text-amber-100/70" />
          </div>
          <p className="mt-4 text-4xl font-semibold text-white">
            {analytics.avgMessagesPerConversation}
          </p>
          <p className="mt-2 text-sm text-white/65">
            Messages per conversation
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-white/45">
            Guests average {analytics.engagement.avgGuestMessages} direct asks
          </p>
        </article>

        <article className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
              Peak Usage
            </p>
            <Clock3 className="h-4 w-4 text-amber-100/70" />
          </div>
          <p className="mt-4 text-3xl font-semibold text-white">
            {analytics.peakUsage.hourLabel}
          </p>
          <p className="mt-2 text-sm text-white/65">
            Busiest hour on {analytics.peakUsage.dayLabel}
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-white/45">
            Follow-up rate {analytics.engagement.followUpRate}%
          </p>
        </article>

        <article className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
              Language Mix
            </p>
            <Languages className="h-4 w-4 text-amber-100/70" />
          </div>
          <div className="mt-4">
            <LanguageBreakdown distribution={analytics.languageDistribution} />
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <AnalyticsBarChart points={analytics.usageByDay} />

        <article className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
            Guest Engagement
          </p>
          <div className="mt-4 space-y-3">
            <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-white/60">Guests who ask follow-ups</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {analytics.engagement.followUpRate}%
              </p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-white/60">
                Conversations asking for recommendations
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {analytics.engagement.recommendationRate}%
              </p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-white/60">Last 7 / 30 days</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {analytics.totals.last7Days} / {analytics.totals.last30Days}
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
                Top Questions
              </p>
              <p className="mt-2 text-sm text-white/65">
                Most common asks across the selected date range.
              </p>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-[24px] border border-white/10">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm text-white/80">
              <thead className="bg-black/20 text-xs uppercase tracking-[0.24em] text-white/45">
                <tr>
                  <th className="px-4 py-3 font-medium">Question</th>
                  <th className="px-4 py-3 font-medium">Times</th>
                  <th className="px-4 py-3 font-medium">% Conversations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {analytics.topQuestions.length > 0 ? (
                  analytics.topQuestions.map((question) => (
                    <tr key={question.text} className="bg-black/10">
                      <td className="px-4 py-3 leading-6 text-white/85">
                        {question.text}
                      </td>
                      <td className="px-4 py-3">{question.count}</td>
                      <td className="px-4 py-3">
                        {question.conversationShare}%
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-5 text-sm leading-6 text-white/55"
                    >
                      No question patterns yet. Once guests start chatting, this
                      table will surface the most common asks.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
          <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
            Popular Dishes
          </p>
          <p className="mt-2 text-sm text-white/65">
            Recommended most often when guests ask what to order.
          </p>

          <div className="mt-5 space-y-3">
            {analytics.topDishes.length > 0 ? (
              analytics.topDishes.map((dish, index) => (
                <div
                  key={dish.name}
                  className="flex items-center justify-between gap-3 rounded-[22px] border border-white/10 bg-black/20 px-4 py-4"
                >
                  <div>
                    <p className="text-sm text-white/50">#{index + 1}</p>
                    <p className="mt-1 text-base font-semibold text-white">
                      {dish.name}
                    </p>
                  </div>
                  <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-sm text-amber-100">
                    {dish.count} recs
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-[22px] border border-dashed border-white/10 bg-black/20 px-4 py-5 text-sm leading-6 text-white/55">
                No recommendation trends yet. Dish ranking appears after live
                recommendation prompts are logged.
              </div>
            )}
          </div>
        </article>
      </section>
    </div>
  )
}
