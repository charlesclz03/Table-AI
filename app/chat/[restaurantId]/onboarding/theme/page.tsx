'use client'

import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Volume2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ThemePreview } from '@/components/onboarding/ThemePreview'
import { getThemeGreeting, getThemePersonality } from '@/lib/themes'
import {
  buildChatPath,
  getThemeOption,
  ONBOARDING_SLIDE_STATES,
  ONBOARDING_SLIDE_TRANSITION,
  OnboardingShell,
  type OnboardingProgressStep,
  THEME_OPTIONS,
  THEME_STORAGE_KEY,
  type ThemeKey,
  useOnboardingFlow,
  WineSphere,
} from '../_layout'

type ThemeStage = 'theme' | 'enter'
type PreviewMode = 'idle' | 'audio' | 'text'

function ThemeSelectionScreen({
  onProgressChange,
}: {
  onProgressChange: (progress: OnboardingProgressStep) => void
}) {
  const router = useRouter()
  const { restaurantId, tableNumber, restaurantName, setTheme, theme, lang } =
    useOnboardingFlow()
  const [stage, setStage] = useState<ThemeStage>('theme')
  const [previewTheme, setPreviewTheme] = useState<ThemeKey>(
    theme ?? THEME_OPTIONS[0].key
  )
  const [previewMode, setPreviewMode] = useState<PreviewMode>('idle')
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false)
  const routeTimeoutRef = useRef<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioUrlRef = useRef<string | null>(null)
  const previewRequestIdRef = useRef(0)

  const activeTheme = useMemo(
    () => getThemeOption(previewTheme),
    [previewTheme]
  )
  const greeting = useMemo(
    () => getThemeGreeting(previewTheme, lang),
    [lang, previewTheme]
  )
  const personality = useMemo(
    () => getThemePersonality(previewTheme, lang),
    [lang, previewTheme]
  )

  const releasePreviewAudio = useCallback(function releasePreviewAudio() {
    const activeAudio = audioRef.current

    if (activeAudio) {
      activeAudio.onended = null
      activeAudio.onerror = null
      activeAudio.pause()
      activeAudio.src = ''
      audioRef.current = null
    }

    const activeUrl = audioUrlRef.current

    if (activeUrl) {
      URL.revokeObjectURL(activeUrl)
      audioUrlRef.current = null
    }
  }, [])

  const stopPreviewAudio = useCallback(
    function stopPreviewAudio(nextMode: PreviewMode = 'idle') {
      previewRequestIdRef.current += 1
      releasePreviewAudio()
      setIsPreviewLoading(false)
      setIsPreviewPlaying(false)
      setPreviewMode(nextMode)
    },
    [releasePreviewAudio]
  )

  useEffect(() => {
    if (theme) {
      setPreviewTheme(theme)
    }
  }, [theme])

  useEffect(() => {
    onProgressChange(stage === 'enter' ? 2 : 1)
  }, [onProgressChange, stage])

  useEffect(() => {
    return () => {
      if (routeTimeoutRef.current) {
        window.clearTimeout(routeTimeoutRef.current)
      }

      stopPreviewAudio()
    }
  }, [stopPreviewAudio])

  const playThemePreview = useCallback(
    async function playThemePreview(nextTheme: ThemeKey) {
      const nextThemeOption = getThemeOption(nextTheme)
      const nextGreeting = getThemeGreeting(nextTheme, lang)

      setPreviewTheme(nextTheme)

      if (typeof window === 'undefined' || !nextGreeting.trim()) {
        stopPreviewAudio('text')
        return
      }

      if (!window.navigator.onLine) {
        stopPreviewAudio('text')
        return
      }

      const requestId = previewRequestIdRef.current + 1
      previewRequestIdRef.current = requestId

      releasePreviewAudio()
      setPreviewMode('audio')
      setIsPreviewLoading(true)
      setIsPreviewPlaying(false)

      try {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: nextGreeting,
            voice: nextThemeOption.voice,
          }),
        })

        if (!response.ok) {
          throw new Error(`Theme preview failed with ${response.status}`)
        }

        const blob = await response.blob()

        if (blob.size === 0) {
          throw new Error('Theme preview returned empty audio')
        }

        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audio.preload = 'auto'
        audio.setAttribute('playsinline', '')

        if (requestId !== previewRequestIdRef.current) {
          URL.revokeObjectURL(url)
          return
        }

        audioRef.current = audio
        audioUrlRef.current = url

        const cleanupAudio = () => {
          if (audioRef.current === audio) {
            audioRef.current = null
          }

          if (audioUrlRef.current === url) {
            URL.revokeObjectURL(url)
            audioUrlRef.current = null
          }
        }

        audio.onplay = () => {
          if (requestId !== previewRequestIdRef.current) {
            return
          }

          setIsPreviewLoading(false)
          setIsPreviewPlaying(true)
          setPreviewMode('audio')
        }
        audio.onended = () => {
          cleanupAudio()

          if (requestId !== previewRequestIdRef.current) {
            return
          }

          setIsPreviewLoading(false)
          setIsPreviewPlaying(false)
          setPreviewMode('audio')
        }
        audio.onerror = () => {
          cleanupAudio()

          if (requestId !== previewRequestIdRef.current) {
            return
          }

          stopPreviewAudio('text')
        }

        await audio.play()
      } catch (error) {
        console.error('Theme preview error:', error)

        if (requestId === previewRequestIdRef.current) {
          stopPreviewAudio('text')
        }
      }
    },
    [lang, releasePreviewAudio, stopPreviewAudio]
  )

  function handleHighlightTheme(nextTheme: ThemeKey) {
    if (previewTheme === nextTheme) {
      return
    }

    stopPreviewAudio()
    setPreviewTheme(nextTheme)
  }

  function handleConfirmTheme() {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(THEME_STORAGE_KEY, previewTheme)
    }

    stopPreviewAudio()
    setTheme(previewTheme)
    setStage('enter')

    routeTimeoutRef.current = window.setTimeout(() => {
      startTransition(() => {
        router.push(buildChatPath(restaurantId, tableNumber))
      })
    }, 700)
  }

  return (
    <AnimatePresence initial={false} mode="wait">
      {stage === 'theme' ? (
        <motion.section
          key="theme"
          initial={ONBOARDING_SLIDE_STATES.initial}
          animate={ONBOARDING_SLIDE_STATES.animate}
          exit={ONBOARDING_SLIDE_STATES.exit}
          transition={ONBOARDING_SLIDE_TRANSITION}
          className="flex min-h-0 flex-1 flex-col justify-center"
        >
          <div className="mb-6 text-center">
            <p className="text-[11px] uppercase tracking-[0.34em] text-amber-100/62">
              Step Two
            </p>
            <h2 className="mt-4 text-[2rem] font-semibold leading-tight text-white">
              Pick your sphere theme
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/60">
              Tap a theme to hear its AI personality, then confirm when it feels
              right.
            </p>
          </div>

          <ThemePreview
            theme={activeTheme}
            greeting={greeting}
            personality={personality}
            isLoading={isPreviewLoading}
            isPlaying={isPreviewPlaying}
            previewMode={previewMode}
            onReplay={() => {
              void playThemePreview(previewTheme)
            }}
            onConfirm={handleConfirmTheme}
          />

          <div className="mt-6 grid grid-cols-2 gap-3">
            {THEME_OPTIONS.map((option, index) => {
              const isSelected = previewTheme === option.key

              return (
                <motion.button
                  key={option.key}
                  type="button"
                  onClick={() => {
                    void playThemePreview(option.key)
                  }}
                  onMouseEnter={() => handleHighlightTheme(option.key)}
                  onFocus={() => handleHighlightTheme(option.key)}
                  onPointerDown={() => handleHighlightTheme(option.key)}
                  whileTap={{ scale: 0.98 }}
                  initial={{ y: 28 }}
                  animate={{ y: 0 }}
                  transition={{
                    ...ONBOARDING_SLIDE_TRANSITION,
                    delay: index * 0.05,
                  }}
                  className="flex min-h-[136px] min-w-[60px] flex-col rounded-[28px] border px-4 py-4 text-left shadow-[0_18px_48px_rgba(0,0,0,0.18)] backdrop-blur-xl transition"
                  style={{
                    borderColor: isSelected
                      ? `${option.glowColor}80`
                      : 'rgba(255,255,255,0.1)',
                    background: isSelected
                      ? `linear-gradient(180deg, ${option.glowColor}20 0%, rgba(255,255,255,0.08) 100%)`
                      : 'rgba(255,255,255,0.06)',
                    boxShadow: isSelected
                      ? `0 0 0 1px ${option.glowColor}30, 0 20px 48px rgba(0,0,0,0.2)`
                      : '0 18px 48px rgba(0,0,0,0.18)',
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <WineSphere
                      themeKey={option.key}
                      selected={isSelected}
                      speaking={
                        isSelected && (isPreviewLoading || isPreviewPlaying)
                      }
                      size="sm"
                      className="mx-auto"
                    />
                    <span
                      className={`inline-flex min-h-8 items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                        isSelected
                          ? 'border-emerald-300/30 bg-emerald-300/15 text-emerald-50'
                          : 'border-rose-300/30 bg-rose-400/12 text-rose-50'
                      }`}
                    >
                      {isSelected ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      {isSelected ? 'Validated' : 'Not selected'}
                    </span>
                  </div>

                  <div className="mt-4">
                    <p className="text-base font-medium text-white">
                      {option.label}
                    </p>
                    <p className="mt-1 text-sm text-white/48">
                      {option.subtitle}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-xs text-white/62">
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>{option.voiceCharacter}</span>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.section>
      ) : (
        <motion.section
          key="enter"
          initial={ONBOARDING_SLIDE_STATES.initial}
          animate={ONBOARDING_SLIDE_STATES.animate}
          exit={ONBOARDING_SLIDE_STATES.exit}
          transition={ONBOARDING_SLIDE_TRANSITION}
          className="flex min-h-0 flex-1 flex-col justify-center"
        >
          <div className="rounded-[36px] border border-white/10 bg-white/[0.05] px-6 py-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl">
            <motion.div
              initial={{ y: 100, scale: 0.88 }}
              animate={{ y: 0, scale: 1 }}
              transition={ONBOARDING_SLIDE_TRANSITION}
            >
              <WineSphere
                themeKey={previewTheme}
                speaking
                selected
                size="xl"
                className="mx-auto"
              />
            </motion.div>

            <p className="mt-8 text-[11px] uppercase tracking-[0.34em] text-amber-100/62">
              Step Three
            </p>
            <h2 className="mt-4 text-[2rem] font-semibold leading-tight text-white">
              Entering {restaurantName}
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/60">
              Your {activeTheme.label.toLowerCase()} concierge is waking up for
              table {tableNumber}.
            </p>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  )
}

export default function ThemeSelectionPage() {
  const [progress, setProgress] = useState<OnboardingProgressStep>(1)

  return (
    <OnboardingShell step="theme" progress={progress}>
      <ThemeSelectionScreen onProgressChange={setProgress} />
    </OnboardingShell>
  )
}
