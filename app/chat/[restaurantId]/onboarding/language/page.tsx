'use client'

import { startTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  buildOnboardingPath,
  LANGUAGE_OPTIONS,
  LANGUAGE_STORAGE_KEY,
  OnboardingShell,
  useOnboardingFlow,
} from '../_layout'

function LanguageSelectionScreen() {
  const router = useRouter()
  const { restaurantId, tableNumber, restaurantName, setLang } =
    useOnboardingFlow()

  function handleSelectLanguage(
    code: (typeof LANGUAGE_OPTIONS)[number]['code']
  ) {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(LANGUAGE_STORAGE_KEY, code)
    }

    setLang(code)

    startTransition(() => {
      router.push(buildOnboardingPath(restaurantId, 'theme', tableNumber))
    })
  }

  return (
    <section className="py-8">
      <div className="mb-8 text-center">
        <p className="text-sm text-amber-100/60">{restaurantName}</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          Select your language
        </h2>
        <p className="mt-3 text-sm leading-6 text-white/60">
          Choose the language your concierge should use for this table.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {LANGUAGE_OPTIONS.map((language, index) => (
          <button
            key={language.code}
            type="button"
            onClick={() => handleSelectLanguage(language.code)}
            className="rounded-[28px] border border-white/10 bg-white/6 px-4 py-5 text-left backdrop-blur transition hover:border-amber-200/30 hover:bg-white/10"
            style={{
              animation: `fadeSlideIn 420ms ease-out ${index * 90}ms both`,
            }}
          >
            <div className="text-3xl leading-none">{language.flag}</div>
            <p className="mt-4 text-base font-medium text-white">
              {language.nativeLabel}
            </p>
            <p className="mt-1 text-sm text-white/50">{language.label}</p>
          </button>
        ))}
      </div>
    </section>
  )
}

export default function LanguageSelectionPage() {
  return (
    <OnboardingShell step="language">
      <LanguageSelectionScreen />
    </OnboardingShell>
  )
}
