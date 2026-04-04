'use client'

import { startTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  buildChatPath,
  OnboardingShell,
  THEME_OPTIONS,
  THEME_STORAGE_KEY,
  type ThemeKey,
  useOnboardingFlow,
  WineSphere,
} from '../_layout'

function ThemeSelectionScreen() {
  const router = useRouter()
  const { restaurantId, tableNumber, setTheme, theme } = useOnboardingFlow()
  const [pendingTheme, setPendingTheme] = useState<ThemeKey | null>(theme)

  function handleSelectTheme(nextTheme: ThemeKey) {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(THEME_STORAGE_KEY, nextTheme)
    }

    setPendingTheme(nextTheme)
    setTheme(nextTheme)

    window.setTimeout(() => {
      startTransition(() => {
        router.push(buildChatPath(restaurantId, tableNumber))
      })
    }, 180)
  }

  return (
    <section className="py-8">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-white">
          Choose your concierge theme
        </h2>
        <p className="mt-3 text-sm leading-6 text-white/60">
          Pick the wine sphere that best matches the restaurant&apos;s
          personality.
        </p>
      </div>

      <div className="-mx-5 overflow-x-auto px-5 pb-3">
        <div className="flex min-w-max gap-4">
          {THEME_OPTIONS.map((option, index) => (
            <button
              key={option.key}
              type="button"
              onClick={() => handleSelectTheme(option.key)}
              className="w-[164px] shrink-0 rounded-[32px] border border-white/10 bg-white/6 px-4 py-5 text-left backdrop-blur transition hover:border-white/20 hover:bg-white/10"
              style={{
                animation: `fadeSlideIn 420ms ease-out ${index * 110}ms both`,
              }}
            >
              <WineSphere
                themeKey={option.key}
                selected={pendingTheme === option.key}
                speaking={pendingTheme === option.key}
                size="md"
                className="mx-auto"
              />
              <p className="mt-5 text-base font-medium text-white">
                {option.label}
              </p>
              <p className="mt-1 text-sm leading-5 text-white/55">
                {option.subtitle}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function ThemeSelectionPage() {
  return (
    <OnboardingShell step="theme">
      <ThemeSelectionScreen />
    </OnboardingShell>
  )
}
