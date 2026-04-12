'use client'

import { startTransition, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  buildOnboardingPath,
  LANGUAGE_OPTIONS,
  LANGUAGE_STORAGE_KEY,
  ONBOARDING_SLIDE_STATES,
  ONBOARDING_SLIDE_TRANSITION,
  OnboardingShell,
  useOnboardingFlow,
  WineSphere,
} from '../_layout'

type LanguageStage = 'welcome' | 'language'

function LanguageSelectionScreen() {
  const router = useRouter()
  const { restaurantId, tableNumber, restaurantName, setLang } =
    useOnboardingFlow()
  const [stage, setStage] = useState<LanguageStage>('welcome')
  const [isRouting, setIsRouting] = useState(false)
  const swipeStartYRef = useRef<number | null>(null)
  const routeTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (routeTimeoutRef.current) {
        window.clearTimeout(routeTimeoutRef.current)
      }
    }
  }, [])

  function handleAdvance() {
    if (isRouting) {
      return
    }

    setStage('language')
  }

  function handleSelectLanguage(
    code: (typeof LANGUAGE_OPTIONS)[number]['code']
  ) {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(LANGUAGE_STORAGE_KEY, code)
    }

    setLang(code)
    setIsRouting(true)

    routeTimeoutRef.current = window.setTimeout(() => {
      startTransition(() => {
        router.push(buildOnboardingPath(restaurantId, 'theme', tableNumber))
      })
    }, 400)
  }

  return (
    <AnimatePresence initial={false} mode="wait">
      {stage === 'welcome' ? (
        <motion.section
          key="welcome"
          initial={ONBOARDING_SLIDE_STATES.initial}
          animate={ONBOARDING_SLIDE_STATES.animate}
          exit={ONBOARDING_SLIDE_STATES.exit}
          transition={ONBOARDING_SLIDE_TRANSITION}
          className="flex min-h-0 flex-1 flex-col justify-center"
          onPointerDown={(event) => {
            swipeStartYRef.current = event.clientY
          }}
          onPointerUp={(event) => {
            if (swipeStartYRef.current === null) {
              return
            }

            const swipeDistance = swipeStartYRef.current - event.clientY
            swipeStartYRef.current = null

            if (swipeDistance > 56) {
              handleAdvance()
            }
          }}
        >
          <div className="glass-panel rounded-[34px] px-6 py-8 text-center">
            <p className="text-[11px] uppercase tracking-[0.34em] text-amber-100/62">
              Welcome
            </p>
            <WineSphere
              themeKey="red"
              speaking
              size="xl"
              className="mx-auto mt-7"
            />
            <h2 className="mt-8 text-[2rem] font-semibold leading-tight text-white">
              {restaurantName}
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/62">
              One quick setup and your wine-sphere concierge will be ready to
              guide this table.
            </p>

            <button
              type="button"
              onClick={handleAdvance}
              className="glass-button-amber mt-8 flex min-h-14 w-full items-center justify-center rounded-full px-5 py-4 text-base font-semibold text-amber-50 transition hover:bg-amber-300/24 active:scale-[0.99]"
            >
              Tap to start
            </button>

            <div className="mt-5 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.28em] text-white/38">
              <ArrowUp className="h-4 w-4" />
              <span>Swipe up to continue</span>
            </div>
          </div>
        </motion.section>
      ) : (
        <motion.section
          key="language"
          initial={ONBOARDING_SLIDE_STATES.initial}
          animate={
            isRouting
              ? ONBOARDING_SLIDE_STATES.exit
              : ONBOARDING_SLIDE_STATES.animate
          }
          transition={ONBOARDING_SLIDE_TRANSITION}
          className="flex min-h-0 flex-1 flex-col justify-center"
        >
          <div className="mb-6 text-center">
            <p className="text-[11px] uppercase tracking-[0.34em] text-amber-100/62">
              Step One
            </p>
            <h2 className="mt-4 text-[2rem] font-semibold leading-tight text-white">
              Choose your language
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/60">
              Pick the language your table concierge should use.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 px-1">
            {LANGUAGE_OPTIONS.map((language, index) => (
              <motion.button
                key={language.code}
                type="button"
                onClick={() => handleSelectLanguage(language.code)}
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
                disabled={isRouting}
                className="glass-panel relative flex min-h-[128px] flex-col justify-between rounded-[24px] px-5 py-5 text-left transition-all hover:border-amber-200/40 hover:bg-white/[0.09] disabled:pointer-events-none"
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 26,
                  delay: index * 0.07,
                }}
              >
                <span className="text-[2.4rem] leading-none" style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}>
                  {language.flag}
                </span>
                <div className="mt-3">
                  <p className="text-[1.05rem] font-semibold tracking-wide text-white">
                    {language.nativeLabel}
                  </p>
                  <p className="mt-0.5 text-xs text-white/44">{language.label}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  )
}

export default function LanguageSelectionPage() {
  return (
    <OnboardingShell step="language" progress={0}>
      <LanguageSelectionScreen />
    </OnboardingShell>
  )
}
