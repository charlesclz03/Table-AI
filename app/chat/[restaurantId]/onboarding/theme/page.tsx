'use client'

import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type TouchEvent,
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Sparkles, Volume2 } from 'lucide-react'
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
  THEME_STORAGE_KEY,
  type ThemeKey,
  useOnboardingFlow,
  WineSphere,
} from '../_layout'

type ThemeStage = 'theme' | 'enter'
type PreviewMode = 'idle' | 'audio' | 'text'
type NavigationDirection = 'left' | 'right'

const SELECTABLE_THEME_KEYS: ThemeKey[] = ['red', 'white', 'rose', 'green']
const SWIPE_THRESHOLD = 42

const ORBITAL_SELECTOR_TRANSITION = {
  duration: 0.4,
  ease: 'easeOut',
} as const

const ORBITAL_SLOTS = [
  {
    x: 0,
    y: 118,
    scale: 1,
    opacity: 1,
    filter: 'blur(0px)',
    zIndex: 40,
    size: 'md' as const,
  },
  {
    x: 118,
    y: 16,
    scale: 0.84,
    opacity: 0.82,
    filter: 'blur(2.6px)',
    zIndex: 30,
    size: 'sm' as const,
  },
  {
    x: 0,
    y: -92,
    scale: 0.68,
    opacity: 0.48,
    filter: 'blur(7px)',
    zIndex: 20,
    size: 'sm' as const,
  },
  {
    x: -118,
    y: 16,
    scale: 0.84,
    opacity: 0.82,
    filter: 'blur(2.6px)',
    zIndex: 30,
    size: 'sm' as const,
  },
] as const

function normalizeSelectableTheme(
  themeKey: ThemeKey | null | undefined
): ThemeKey {
  if (themeKey && SELECTABLE_THEME_KEYS.includes(themeKey)) {
    return themeKey
  }

  return SELECTABLE_THEME_KEYS[0]
}

function getRelativeOffset(currentIndex: number, targetIndex: number) {
  return (
    (targetIndex - currentIndex + SELECTABLE_THEME_KEYS.length) %
    SELECTABLE_THEME_KEYS.length
  )
}

function getNavigationDirection(currentTheme: ThemeKey, nextTheme: ThemeKey) {
  const currentIndex = SELECTABLE_THEME_KEYS.indexOf(currentTheme)
  const nextIndex = SELECTABLE_THEME_KEYS.indexOf(nextTheme)

  if (currentIndex === nextIndex) {
    return null
  }

  const forwardDistance = getRelativeOffset(currentIndex, nextIndex)
  const backwardDistance = getRelativeOffset(nextIndex, currentIndex)

  return forwardDistance <= backwardDistance ? 'left' : 'right'
}

function OrbitalThemeSelector({
  activeThemeKey,
  isPreviewLoading,
  isPreviewPlaying,
  sloshDirection,
  sloshTrigger,
  onNext,
  onPrevious,
  onSelectTheme,
}: {
  activeThemeKey: ThemeKey
  isPreviewLoading: boolean
  isPreviewPlaying: boolean
  sloshDirection: NavigationDirection | null
  sloshTrigger: number
  onNext: () => void
  onPrevious: () => void
  onSelectTheme: (themeKey: ThemeKey) => void
}) {
  const swipeStartXRef = useRef<number | null>(null)
  const activeTheme = getThemeOption(activeThemeKey)
  const activeIndex = SELECTABLE_THEME_KEYS.indexOf(activeThemeKey)

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    swipeStartXRef.current = event.changedTouches[0]?.clientX ?? null
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const startX = swipeStartXRef.current
    const endX = event.changedTouches[0]?.clientX ?? null

    swipeStartXRef.current = null

    if (startX === null || endX === null) {
      return
    }

    const deltaX = endX - startX

    if (Math.abs(deltaX) < SWIPE_THRESHOLD) {
      return
    }

    if (deltaX < 0) {
      onNext()
      return
    }

    onPrevious()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      onPrevious()
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      onNext()
    }
  }

  return (
    <div className="glass-panel rounded-[38px] px-4 py-5">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-white/78">
          <Sparkles className="h-3.5 w-3.5" />
          Orbital selector
        </span>
        <span className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/12 bg-black/20 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-amber-100/75">
          <Volume2 className="h-3.5 w-3.5" />
          Swipe to preview
        </span>
      </div>

      <div
        className="relative mt-6 h-[24.5rem] touch-pan-y select-none outline-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => {
          swipeStartXRef.current = null
        }}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        aria-label="Theme selector orbit"
      >
        <motion.div
          className="absolute inset-0 rounded-[34px]"
          animate={{
            background: `radial-gradient(circle at 50% 42%, ${activeTheme.glowColor}2f 0%, rgba(255,255,255,0.04) 36%, rgba(5,5,8,0.18) 58%, transparent 100%)`,
          }}
          transition={ORBITAL_SELECTOR_TRANSITION}
        />

        <div className="pointer-events-none absolute inset-x-6 top-1/2 h-[16rem] -translate-y-1/2 rounded-full border border-white/8" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[11.75rem] w-[11.75rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[17.5rem] w-[17.5rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/[0.07]" />

        <button
          type="button"
          onClick={onPrevious}
          className="glass-button absolute left-0 top-1/2 z-50 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-white/86 transition hover:bg-white/12"
          aria-label="Show previous theme"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onNext}
          className="glass-button absolute right-0 top-1/2 z-50 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-white/86 transition hover:bg-white/12"
          aria-label="Show next theme"
        >
          <ArrowRight className="h-4 w-4" />
        </button>

        {SELECTABLE_THEME_KEYS.map((themeKey, index) => {
          const theme = getThemeOption(themeKey)
          const slot =
            ORBITAL_SLOTS[
              getRelativeOffset(activeIndex, index) % ORBITAL_SLOTS.length
            ]
          const isSelected = themeKey === activeThemeKey

          return (
            <motion.button
              key={theme.key}
              type="button"
              onClick={() => onSelectTheme(theme.key)}
              initial={false}
              animate={{
                x: slot.x,
                y: slot.y,
                scale: slot.scale,
                opacity: slot.opacity,
                filter: slot.filter,
                zIndex: slot.zIndex,
              }}
              transition={ORBITAL_SELECTOR_TRANSITION}
              className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
              aria-label={`Preview ${theme.label}`}
              aria-pressed={isSelected}
            >
              <motion.div
                whileTap={{ scale: 0.96 }}
                className="relative"
                animate={{
                  rotate: isSelected ? 0 : slot.x > 0 ? 5 : slot.x < 0 ? -5 : 0,
                }}
                transition={ORBITAL_SELECTOR_TRANSITION}
              >
                <div
                  className="absolute inset-[-10%] rounded-full blur-2xl"
                  style={{
                    background: `radial-gradient(circle, ${theme.glowColor}88 0%, transparent 70%)`,
                    opacity: isSelected ? 0.58 : 0.28,
                  }}
                />
                <WineSphere
                  themeKey={theme.key}
                  selected={isSelected}
                  size={slot.size}
                  className="pointer-events-none"
                />
              </motion.div>
              <span className="sr-only">{theme.label}</span>
            </motion.button>
          )
        })}

        <div className="pointer-events-none absolute left-1/2 top-1/2 z-[45] flex w-full max-w-[16rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 5.2,
              ease: 'easeInOut',
              repeat: Infinity,
            }}
          >
            <WineSphere
              themeKey={activeThemeKey}
              selected
              speaking={isPreviewLoading || isPreviewPlaying}
              sloshDirection={sloshDirection}
              sloshTrigger={sloshTrigger}
              size="xl"
              className="mx-auto"
            />
          </motion.div>

          <motion.div
            key={activeTheme.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={ORBITAL_SELECTOR_TRANSITION}
            className="mt-5 text-center"
          >
            <p className="text-[11px] uppercase tracking-[0.26em] text-amber-100/62">
              Current atmosphere
            </p>
            <p className="mt-2 text-xl font-medium text-white">
              {activeTheme.key === 'red'
                ? 'Classic Red'
                : activeTheme.key === 'rose'
                  ? 'Rose'
                  : activeTheme.key === 'green'
                    ? 'Green Wine'
                    : activeTheme.label}
            </p>
            <p className="mt-1 text-sm text-white/55">{activeTheme.subtitle}</p>
          </motion.div>
        </div>
      </div>

      <div
        className="mt-1 flex items-center justify-center gap-2"
        aria-label="Theme position"
      >
        {SELECTABLE_THEME_KEYS.map((themeKey) => {
          const isActive = themeKey === activeThemeKey

          return (
            <button
              key={themeKey}
              type="button"
              onClick={() => onSelectTheme(themeKey)}
              className="group p-1.5"
              aria-label={`Select ${getThemeOption(themeKey).label}`}
              aria-pressed={isActive}
            >
              <span
                className="block h-2.5 rounded-full transition-all duration-300"
                style={{
                  width: isActive ? '1.75rem' : '0.625rem',
                  backgroundColor: isActive
                    ? activeTheme.glowColor
                    : 'rgba(255,255,255,0.22)',
                  boxShadow: isActive
                    ? `0 0 18px ${activeTheme.glowColor}66`
                    : 'none',
                }}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

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
    normalizeSelectableTheme(theme)
  )
  const [previewMode, setPreviewMode] = useState<PreviewMode>('idle')
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false)
  const [sloshDirection, setSloshDirection] =
    useState<NavigationDirection | null>(null)
  const [sloshTrigger, setSloshTrigger] = useState(0)
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
    setPreviewTheme(normalizeSelectableTheme(theme))
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

  const triggerSelectionChange = useCallback(
    function triggerSelectionChange(
      nextTheme: ThemeKey,
      direction: NavigationDirection | null
    ) {
      if (direction) {
        setSloshDirection(direction)
        setSloshTrigger((current) => current + 1)
      }

      void playThemePreview(nextTheme)
    },
    [playThemePreview]
  )

  const handleOrbitalSelect = useCallback(
    function handleOrbitalSelect(nextTheme: ThemeKey) {
      const direction = getNavigationDirection(previewTheme, nextTheme)
      triggerSelectionChange(nextTheme, direction)
    },
    [previewTheme, triggerSelectionChange]
  )

  const handlePreviousTheme = useCallback(
    function handlePreviousTheme() {
      const currentIndex = SELECTABLE_THEME_KEYS.indexOf(previewTheme)
      const nextTheme =
        SELECTABLE_THEME_KEYS[
          (currentIndex - 1 + SELECTABLE_THEME_KEYS.length) %
            SELECTABLE_THEME_KEYS.length
        ]

      triggerSelectionChange(nextTheme, 'right')
    },
    [previewTheme, triggerSelectionChange]
  )

  const handleNextTheme = useCallback(
    function handleNextTheme() {
      const currentIndex = SELECTABLE_THEME_KEYS.indexOf(previewTheme)
      const nextTheme =
        SELECTABLE_THEME_KEYS[(currentIndex + 1) % SELECTABLE_THEME_KEYS.length]

      triggerSelectionChange(nextTheme, 'left')
    },
    [previewTheme, triggerSelectionChange]
  )

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
              Orbit through your concierge themes
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/60">
              Swipe left or right to rotate the orbit, hear each voice, then
              confirm the atmosphere that fits your table.
            </p>
          </div>

          <OrbitalThemeSelector
            activeThemeKey={previewTheme}
            isPreviewLoading={isPreviewLoading}
            isPreviewPlaying={isPreviewPlaying}
            sloshDirection={sloshDirection}
            sloshTrigger={sloshTrigger}
            onNext={handleNextTheme}
            onPrevious={handlePreviousTheme}
            onSelectTheme={handleOrbitalSelect}
          />

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
            showSphere={false}
            className="mt-6"
          />
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
          <div className="glass-panel rounded-[36px] px-6 py-10 text-center">
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
