'use client'

import { startTransition, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
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

function ThemeSelectionScreen({
  onProgressChange,
}: {
  onProgressChange: (progress: OnboardingProgressStep) => void
}) {
  const router = useRouter()
  const { restaurantId, tableNumber, restaurantName, setTheme, theme } =
    useOnboardingFlow()
  const [stage, setStage] = useState<ThemeStage>('theme')
  const [previewTheme, setPreviewTheme] = useState<ThemeKey>(
    theme ?? THEME_OPTIONS[0].key
  )
  const routeTimeoutRef = useRef<number | null>(null)

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
    }
  }, [])

  function handleSelectTheme(nextTheme: ThemeKey) {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(THEME_STORAGE_KEY, nextTheme)
    }

    setPreviewTheme(nextTheme)
    setTheme(nextTheme)
    setStage('enter')

    routeTimeoutRef.current = window.setTimeout(() => {
      startTransition(() => {
        router.push(buildChatPath(restaurantId, tableNumber))
      })
    }, 700)
  }

  const activeTheme = getThemeOption(previewTheme)

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
              Preview each personality, then tap once to enter the chat.
            </p>
          </div>

          <div className="mb-6 rounded-[34px] border border-white/10 bg-white/[0.05] px-5 py-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.26)] backdrop-blur-xl">
            <WineSphere
              themeKey={activeTheme.key}
              selected
              speaking
              size="lg"
              className="mx-auto"
            />
            <p className="mt-5 text-lg font-medium text-white">
              {activeTheme.label}
            </p>
            <p className="mt-2 text-sm leading-6 text-white/55">
              {activeTheme.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {THEME_OPTIONS.map((option, index) => {
              const isSelected = previewTheme === option.key

              return (
                <motion.button
                  key={option.key}
                  type="button"
                  onClick={() => handleSelectTheme(option.key)}
                  onMouseEnter={() => setPreviewTheme(option.key)}
                  onFocus={() => setPreviewTheme(option.key)}
                  onPointerDown={() => setPreviewTheme(option.key)}
                  whileTap={{ scale: 0.98 }}
                  initial={{ y: 28 }}
                  animate={{ y: 0 }}
                  transition={{
                    ...ONBOARDING_SLIDE_TRANSITION,
                    delay: index * 0.05,
                  }}
                  className="flex min-h-[118px] min-w-[60px] flex-col rounded-[28px] border px-4 py-4 text-left shadow-[0_18px_48px_rgba(0,0,0,0.18)] backdrop-blur-xl transition"
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
                  <WineSphere
                    themeKey={option.key}
                    selected={isSelected}
                    speaking={isSelected}
                    size="sm"
                    className="mx-auto"
                  />
                  <div className="mt-4">
                    <p className="text-base font-medium text-white">
                      {option.label}
                    </p>
                    <p className="mt-1 text-sm text-white/48">
                      {option.subtitle}
                    </p>
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
