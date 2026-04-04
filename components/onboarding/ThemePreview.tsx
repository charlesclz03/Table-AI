'use client'

import { Check, Play, Volume2, WifiOff } from 'lucide-react'
import { WineSphere } from '@/app/chat/[restaurantId]/onboarding/_layout'
import { cn } from '@/lib/utils'
import type { ThemeOption } from '@/lib/themes'

type ThemePreviewMode = 'idle' | 'audio' | 'text'

interface ThemePreviewProps {
  theme: ThemeOption
  greeting: string
  personality: string
  isLoading: boolean
  isPlaying: boolean
  previewMode: ThemePreviewMode
  onReplay: () => void
  onConfirm: () => void
  showSphere?: boolean
  className?: string
}

function getStatusCopy(previewMode: ThemePreviewMode, isPlaying: boolean) {
  if (isPlaying) {
    return {
      icon: Volume2,
      label: 'Voice preview live',
      className:
        'border-emerald-300/30 bg-emerald-300/15 text-emerald-50 shadow-[0_0_24px_rgba(110,231,183,0.14)]',
    }
  }

  if (previewMode === 'text') {
    return {
      icon: WifiOff,
      label: 'Text-only preview',
      className: 'border-amber-300/25 bg-amber-300/10 text-amber-50',
    }
  }

  return {
    icon: Play,
    label: 'Tap a theme to preview',
    className: 'border-white/12 bg-white/8 text-white/80',
  }
}

export function ThemePreview({
  theme,
  greeting,
  personality,
  isLoading,
  isPlaying,
  previewMode,
  onReplay,
  onConfirm,
  showSphere = true,
  className,
}: ThemePreviewProps) {
  const status = getStatusCopy(previewMode, isPlaying)
  const StatusIcon = status.icon

  return (
    <div
      className={cn(
        'glass-panel rounded-[34px] px-5 py-6 text-center',
        className
      )}
    >
      <div className="flex justify-center">
        <span
          className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium tracking-[0.16em] uppercase ${status.className}`}
        >
          <StatusIcon className="h-3.5 w-3.5" />
          {status.label}
        </span>
      </div>

      {showSphere ? (
        <WineSphere
          themeKey={theme.key}
          selected
          speaking={isLoading || isPlaying}
          size="lg"
          className="mx-auto mt-5"
        />
      ) : null}

      <p
        className={`${showSphere ? 'mt-5' : 'mt-6'} text-lg font-medium text-white`}
      >
        {theme.label}
      </p>
      <p className="mt-2 text-sm leading-6 text-white/55">{theme.subtitle}</p>

      <div className="glass-panel-soft mt-5 rounded-[24px] px-4 py-4 text-left">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
            Personality
          </p>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/25 bg-emerald-300/12 px-3 py-1 text-[11px] font-medium text-emerald-50">
            <Check className="h-3 w-3" />
            Validated
          </span>
        </div>
        <p className="mt-3 text-sm leading-6 text-white/82">{personality}</p>
        <p className="mt-4 text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
          Voice sample
        </p>
        <p className="mt-3 text-sm leading-6 text-white/72">{greeting}</p>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={onReplay}
          disabled={isLoading}
          className="glass-button flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium text-white transition hover:bg-white/12 disabled:cursor-wait disabled:opacity-60"
        >
          {isLoading ? (
            <span className="h-4 w-4 rounded-full border-2 border-white/25 border-t-white/80 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {previewMode === 'text' ? 'Show preview' : 'Replay voice'}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="glass-button-emerald flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-300/24"
        >
          <Check className="h-4 w-4" />
          Select theme
        </button>
      </div>
    </div>
  )
}
