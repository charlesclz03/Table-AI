'use client'

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import {
  DEFAULT_THEME_KEY,
  THEME_OPTIONS,
  getThemeOption,
  type ThemeKey,
  type ThemeOption,
} from '@/lib/themes'
import { cn } from '@/lib/utils'

export const LANGUAGE_STORAGE_KEY = 'gustia-lang'
export const THEME_STORAGE_KEY = 'gustia-theme'

export const LANGUAGE_OPTIONS = [
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    flag: '\u{1F1FA}\u{1F1F8}',
  },
  {
    code: 'fr',
    label: 'French',
    nativeLabel: 'Fran\u00e7ais',
    flag: '\u{1F1EB}\u{1F1F7}',
  },
  {
    code: 'es',
    label: 'Spanish',
    nativeLabel: 'Espa\u00f1ol',
    flag: '\u{1F1EA}\u{1F1F8}',
  },
  {
    code: 'pt',
    label: 'Portuguese',
    nativeLabel: 'Portugu\u00eas',
    flag: '\u{1F1F5}\u{1F1F9}',
  },
  {
    code: 'it',
    label: 'Italian',
    nativeLabel: 'Italiano',
    flag: '\u{1F1EE}\u{1F1F9}',
  },
  {
    code: 'ru',
    label: 'Russian',
    nativeLabel: '\u0420\u0443\u0441\u0441\u043a\u0438\u0439',
    flag: '\u{1F1F7}\u{1F1FA}',
  },
] as const

export type LanguageCode = (typeof LANGUAGE_OPTIONS)[number]['code']
export type OnboardingProgressStep = 0 | 1 | 2
export { THEME_OPTIONS, getThemeOption }
export type { ThemeKey, ThemeOption }

export const ONBOARDING_SLIDE_TRANSITION = {
  duration: 0.4,
  ease: 'easeOut',
} as const

export const ONBOARDING_SLIDE_STATES = {
  initial: { y: 100 },
  animate: { y: 0 },
  exit: { y: -100 },
} as const

export interface MenuItem {
  id?: string
  name: string
  price?: number | string
  category?: string
  description?: string
  allergens?: string[]
  is_vegetarian?: boolean
  is_vegan?: boolean
}

export interface RestaurantProfile {
  id: string
  name: string
  soul_md: string
  menu_json: MenuItem[] | { items?: MenuItem[] }
  rules_md?: string
  subscription_status?: string
}

export const DEMO_MENU: MenuItem[] = [
  {
    id: '1',
    name: 'Acorda de Marisco',
    price: 18,
    category: 'mains',
    description: 'Bread soup with seafood, garlic, cilantro, and poached egg',
    allergens: ['gluten', 'shellfish', 'egg'],
    is_vegetarian: false,
  },
  {
    id: '2',
    name: 'Migas Alentejanas',
    price: 12,
    category: 'mains',
    description: 'Bread and garlic mash with fried eggs and olives',
    allergens: ['gluten', 'egg'],
    is_vegetarian: true,
  },
  {
    id: '3',
    name: 'Cataplana de Porco Preto',
    price: 16,
    category: 'mains',
    description: 'Slow-cooked black pork with clams and chourico',
    allergens: ['shellfish'],
    is_vegetarian: false,
  },
  {
    id: '4',
    name: 'Percebes',
    price: 28,
    category: 'starters',
    description: 'Gooseneck barnacles, rare and precious',
    allergens: ['shellfish'],
    is_vegetarian: false,
  },
  {
    id: '5',
    name: 'Acorda de Legumes',
    price: 10,
    category: 'mains',
    description: 'Vegetarian vegetable bread soup',
    allergens: ['gluten'],
    is_vegetarian: true,
  },
  {
    id: '6',
    name: 'Herdade do Esporao Reserva 2019',
    price: 28,
    category: 'wine',
    description: 'Alentejo red wine, full-bodied',
    allergens: [],
    is_vegetarian: true,
  },
]

export const DEMO_RESTAURANT: RestaurantProfile = {
  id: 'demo-o-celeiro',
  name: 'O Celeiro',
  soul_md:
    "Warm, local, knowledgeable about Alentejo cuisine. Speak like a proud local who loves the region's food. Keep responses short and voice-friendly.",
  menu_json: DEMO_MENU,
  subscription_status: 'demo',
}

type OnboardingStep = 'language' | 'theme'

interface OnboardingContextValue {
  restaurantId: string
  tableNumber: string
  restaurantName: string
  lang: LanguageCode | null
  theme: ThemeKey | null
  setLang: (lang: LanguageCode) => void
  setTheme: (theme: ThemeKey) => void
}

interface OnboardingShellProps {
  step: OnboardingStep
  progress: OnboardingProgressStep
  children: ReactNode
}

interface WineSphereProps {
  themeKey: ThemeKey
  speaking?: boolean
  selected?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  sloshDirection?: 'left' | 'right' | null
  sloshTrigger?: number
  className?: string
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null)

export function getLanguageOption(code: LanguageCode | null | undefined) {
  return (
    LANGUAGE_OPTIONS.find((option) => option.code === code) ??
    LANGUAGE_OPTIONS[0]
  )
}

export function buildChatPath(restaurantId: string, tableNumber: string) {
  return `/chat/${encodeURIComponent(restaurantId)}?table=${encodeURIComponent(tableNumber)}`
}

export function buildOnboardingPath(
  restaurantId: string,
  step: OnboardingStep,
  tableNumber: string
) {
  return `/chat/${encodeURIComponent(restaurantId)}/onboarding/${step}?table=${encodeURIComponent(
    tableNumber
  )}`
}

function isThemeKey(value: string | null): value is ThemeKey {
  return THEME_OPTIONS.some((option) => option.key === value)
}

function isLanguageCode(value: string | null): value is LanguageCode {
  return LANGUAGE_OPTIONS.some((option) => option.code === value)
}

function readStoredLanguage() {
  if (typeof window === 'undefined') {
    return null
  }

  const value = window.sessionStorage.getItem(LANGUAGE_STORAGE_KEY)
  return isLanguageCode(value) ? value : null
}

function readStoredTheme() {
  if (typeof window === 'undefined') {
    return null
  }

  const value = window.sessionStorage.getItem(THEME_STORAGE_KEY)
  return isThemeKey(value) ? value : null
}

export async function fetchRestaurantProfile(
  restaurantId: string
): Promise<RestaurantProfile> {
  if (restaurantId === 'demo') {
    return DEMO_RESTAURANT
  }

  try {
    const response = await fetch(
      `/api/restaurants/${encodeURIComponent(restaurantId)}`,
      {
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      throw new Error('Restaurant lookup failed')
    }

    const data = (await response.json()) as {
      restaurant?: RestaurantProfile
    }

    return data.restaurant ?? { ...DEMO_RESTAURANT, id: restaurantId }
  } catch {
    return {
      ...DEMO_RESTAURANT,
      id: restaurantId,
    }
  }
}

export function SphereAnimationStyles() {
  return (
    <style jsx global>{`
      @keyframes wineWave {
        0%,
        100% {
          transform: translateX(0) translateY(0) rotate(0deg);
          clip-path: inset(50% 0 0 0 round 999px);
        }
        50% {
          transform: translateX(-3%) translateY(-2px) rotate(-1deg);
          clip-path: inset(45% 0 0 0 round 999px);
        }
      }

      @keyframes spherePulse {
        0%,
        100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
      }

      @keyframes glowPulse {
        0%,
        100% {
          opacity: 0.24;
        }
        50% {
          opacity: 0.5;
        }
      }

      @keyframes sphereSpeak {
        0%,
        100% {
          transform: translate3d(0, 0, 0) scale(1.01);
        }
        20% {
          transform: translate3d(-1.5%, 0, 0) rotate(-1deg) scale(1.025);
        }
        40% {
          transform: translate3d(1.5%, -1.5%, 0) rotate(1deg) scale(1.03);
        }
        60% {
          transform: translate3d(-1%, 1%, 0) rotate(-0.7deg) scale(1.025);
        }
        80% {
          transform: translate3d(1%, 0, 0) rotate(0.7deg) scale(1.02);
        }
      }

      @keyframes shimmerSweep {
        0% {
          transform: translateX(-140%) rotate(-18deg);
          opacity: 0;
        }
        40% {
          opacity: 0.2;
        }
        100% {
          transform: translateX(160%) rotate(-18deg);
          opacity: 0;
        }
      }

      @keyframes onboardingGlow {
        0%,
        100% {
          transform: scale(0.98);
          opacity: 0.32;
        }
        50% {
          transform: scale(1.02);
          opacity: 0.55;
        }
      }

      @keyframes wineSloshLeft {
        0% {
          transform: translate3d(0, 0, 0) rotate(0deg);
        }
        32% {
          transform: translate3d(-8%, -3px, 0) rotate(-5deg);
        }
        68% {
          transform: translate3d(3%, 1px, 0) rotate(2deg);
        }
        100% {
          transform: translate3d(0, 0, 0) rotate(0deg);
        }
      }

      @keyframes wineSloshRight {
        0% {
          transform: translate3d(0, 0, 0) rotate(0deg);
        }
        32% {
          transform: translate3d(8%, -3px, 0) rotate(5deg);
        }
        68% {
          transform: translate3d(-3%, 1px, 0) rotate(-2deg);
        }
        100% {
          transform: translate3d(0, 0, 0) rotate(0deg);
        }
      }
    `}</style>
  )
}

export function WineSphere({
  themeKey,
  speaking = false,
  selected = false,
  size = 'lg',
  sloshDirection = null,
  sloshTrigger = 0,
  className,
}: WineSphereProps) {
  const theme = getThemeOption(themeKey)
  const sizeClasses = {
    sm: 'h-24 w-24',
    md: 'h-28 w-28',
    lg: 'h-40 w-40',
    xl: 'h-52 w-52',
  } satisfies Record<NonNullable<WineSphereProps['size']>, string>
  const sloshAnimationName =
    sloshDirection === 'left'
      ? 'wineSloshLeft'
      : sloshDirection === 'right'
        ? 'wineSloshRight'
        : null
  const liquidAnimation = sloshAnimationName
    ? `${sloshAnimationName} 0.4s ease-out 1`
    : undefined

  return (
    <div
      className={cn(
        'relative isolate flex items-center justify-center transition-all duration-300',
        sizeClasses[size],
        className
      )}
      style={{
        animation: speaking
          ? `sphereSpeak ${theme.motion.speakDuration}s ease-in-out infinite`
          : `spherePulse ${theme.motion.pulseDuration}s ease-in-out infinite`,
      }}
    >
      <div
        className="absolute inset-[-12%] rounded-full blur-2xl"
        style={{
          background: `radial-gradient(circle, ${theme.glowColor}88 0%, transparent 72%)`,
          animation: speaking
            ? `glowPulse ${theme.motion.glowDuration}s ease-in-out infinite`
            : `glowPulse ${theme.motion.pulseDuration}s ease-in-out infinite`,
          transform: `scale(${theme.motion.accent === 'bubbles' ? 1.06 : 1})`,
        }}
      />

      {selected ? (
        <div
          className="absolute inset-[-7%] rounded-full border-2"
          style={{
            borderColor: `${theme.glowColor}`,
            boxShadow: `0 0 0 4px ${theme.glowColor}22, 0 0 32px ${theme.glowColor}66`,
          }}
        />
      ) : null}

      <div
        className="absolute inset-0 rounded-full border bg-white/10 backdrop-blur-[20px]"
        style={{
          borderColor: 'rgba(255,255,255,0.22)',
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.24), inset 0 -14px 24px rgba(255,255,255,0.04), 0 28px 60px rgba(0,0,0,0.3)',
        }}
      />

      <div className="absolute inset-[8%] overflow-hidden rounded-full">
        <div
          key={`liquid-${themeKey}-${sloshDirection ?? 'idle'}-${sloshTrigger}`}
          className="absolute inset-x-0 bottom-0 h-[52%]"
          style={{
            background: `linear-gradient(180deg, ${theme.highlightColor} 0%, ${theme.wineColor} 100%)`,
            boxShadow: `inset 0 10px 28px rgba(255,255,255,0.18), 0 0 24px ${theme.glowColor}66`,
            animation: liquidAnimation,
            transformOrigin: 'center 85%',
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              animation: liquidAnimation,
              transformOrigin: 'center 85%',
            }}
          >
            <div
              className="absolute -top-3 left-[-12%] h-8 w-[124%] rounded-[999px]"
              style={{
                background: `linear-gradient(180deg, rgba(255,255,255,0.4) 0%, ${theme.highlightColor} 38%, ${theme.wineColor} 100%)`,
                animation: speaking
                  ? `wineWave ${theme.motion.waveDuration}s ease-in-out infinite`
                  : `wineWave ${theme.motion.waveDuration * 2.8}s ease-in-out infinite`,
              }}
            />
          </div>
        </div>

        {theme.motion.accent === 'crisp' ? (
          <div className="pointer-events-none absolute inset-0">
            <span className="absolute left-[18%] top-[22%] h-[2px] w-[26%] rounded-full bg-white/65 blur-[1px]" />
            <span className="absolute right-[16%] top-[36%] h-[2px] w-[18%] rounded-full bg-white/45 blur-[1px]" />
          </div>
        ) : null}

        {theme.motion.accent === 'blush' ? (
          <div className="pointer-events-none absolute inset-0">
            <span className="absolute left-[18%] top-[30%] h-3 w-3 rounded-full bg-white/26 blur-sm" />
            <span className="absolute right-[20%] top-[20%] h-2.5 w-2.5 rounded-full bg-white/20 blur-sm" />
          </div>
        ) : null}

        {theme.motion.accent === 'breeze' ? (
          <div className="pointer-events-none absolute inset-0">
            <span className="absolute left-[14%] top-[28%] h-[2px] w-[20%] rounded-full bg-white/40 blur-[1px]" />
            <span className="absolute right-[18%] top-[34%] h-[2px] w-[16%] rounded-full bg-white/35 blur-[1px]" />
            <span className="absolute left-[34%] top-[18%] h-[2px] w-[12%] rounded-full bg-white/30 blur-[1px]" />
          </div>
        ) : null}

        {theme.sparkle ? (
          <div className="pointer-events-none absolute inset-0">
            <span className="absolute left-[22%] top-[34%] h-2 w-2 rounded-full bg-white/70" />
            <span className="absolute left-[58%] top-[24%] h-1.5 w-1.5 rounded-full bg-white/55" />
            <span className="absolute left-[70%] top-[42%] h-1 w-1 rounded-full bg-white/60" />
          </div>
        ) : null}

        {theme.motion.accent === 'bubbles' ? (
          <div className="pointer-events-none absolute inset-0">
            <span className="absolute bottom-[20%] left-[24%] h-2.5 w-2.5 rounded-full border border-white/45 bg-white/12" />
            <span className="absolute bottom-[28%] right-[24%] h-2 w-2 rounded-full border border-white/40 bg-white/10" />
            <span className="absolute bottom-[38%] right-[34%] h-1.5 w-1.5 rounded-full border border-white/35 bg-white/8" />
          </div>
        ) : null}
      </div>

      <div
        className="absolute inset-[10%] rounded-full"
        style={{
          border: '1px solid rgba(255,255,255,0.24)',
          background:
            'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.42), rgba(255,255,255,0.08) 42%, transparent 58%)',
        }}
      />

      <div className="absolute left-[18%] top-[16%] h-[18%] w-[18%] rounded-full bg-white/35 blur-sm" />

      <div
        className="pointer-events-none absolute inset-y-[14%] left-[-22%] w-[46%] rounded-full bg-white/15 blur-md"
        style={{
          animation: `shimmerSweep ${theme.motion.shimmerDuration}s linear infinite`,
        }}
      />

      {theme.motion.accent === 'velvet' ? (
        <div className="pointer-events-none absolute inset-[16%] rounded-full border border-white/8" />
      ) : null}
    </div>
  )
}

function OnboardingProgress({ current }: { current: OnboardingProgressStep }) {
  return (
    <div
      className="flex items-center justify-center gap-3"
      aria-label="Progress"
    >
      {[0, 1, 2].map((index) => {
        const isActive = current === index

        return (
          <span
            key={index}
            className={cn(
              'block h-2.5 rounded-full transition-all duration-300',
              isActive ? 'w-8 bg-amber-200' : 'w-2.5 bg-white/22'
            )}
            aria-hidden="true"
          />
        )
      })}
    </div>
  )
}

export function useOnboardingFlow() {
  const value = useContext(OnboardingContext)

  if (!value) {
    throw new Error('useOnboardingFlow must be used inside OnboardingShell')
  }

  return value
}

export function OnboardingShell({
  step,
  progress,
  children,
}: OnboardingShellProps) {
  const params = useParams<{ restaurantId: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()

  const restaurantId =
    params?.restaurantId ?? searchParams.get('restaurantId') ?? 'demo'
  const tableNumber = searchParams.get('table')?.trim() || 'T1'

  const [restaurantName, setRestaurantName] = useState('Loading restaurant...')
  const [lang, setLangState] = useState<LanguageCode | null>(null)
  const [theme, setThemeState] = useState<ThemeKey | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    void fetchRestaurantProfile(restaurantId).then((restaurant) => {
      if (!cancelled) {
        setRestaurantName(restaurant.name)
      }
    })

    return () => {
      cancelled = true
    }
  }, [restaurantId])

  useEffect(() => {
    const nextLang = readStoredLanguage()
    const nextTheme = readStoredTheme()

    setLangState(nextLang)
    setThemeState(nextTheme ?? DEFAULT_THEME_KEY)
    setIsReady(true)
  }, [])

  useEffect(() => {
    if (!isReady) {
      return
    }

    if (step === 'theme' && !lang) {
      router.replace(buildOnboardingPath(restaurantId, 'language', tableNumber))
    }
  }, [isReady, lang, restaurantId, router, step, tableNumber])

  const value = useMemo<OnboardingContextValue>(
    () => ({
      restaurantId,
      tableNumber,
      restaurantName,
      lang,
      theme,
      setLang: (nextLang) => {
        setLangState(nextLang)
      },
      setTheme: (nextTheme) => {
        setThemeState(nextTheme)
      },
    }),
    [lang, restaurantId, restaurantName, tableNumber, theme]
  )

  return (
    <OnboardingContext.Provider value={value}>
      <div className="min-h-screen overflow-hidden text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(247,197,122,0.18),_transparent_28%),radial-gradient(circle_at_20%_80%,_rgba(114,47,55,0.3),_transparent_34%),radial-gradient(circle_at_80%_20%,_rgba(240,180,130,0.12),_transparent_26%),linear-gradient(180deg,_#130d0b_0%,_#09080b_52%,_#040406_100%)]" />
        <div
          className="pointer-events-none absolute inset-x-[-15%] top-[18%] h-[28rem] rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(255, 231, 204, 0.08) 0%, transparent 72%)',
            animation: 'onboardingGlow 6s ease-in-out infinite',
          }}
        />

        <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]">
          <header className="glass-panel rounded-[32px] px-4 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.38em] text-amber-100/65">
                  Gustia Concierge
                </p>
                <h1 className="mt-3 break-words text-[1.7rem] font-semibold leading-tight text-white">
                  {restaurantName}
                </h1>
                <p className="mt-2 text-sm text-white/58">
                  Table {tableNumber}
                </p>
              </div>
              <div className="glass-chip flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-amber-100/85">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
          </header>

          <main className="relative flex min-h-0 flex-1 flex-col justify-center overflow-hidden py-6">
            {children}
          </main>

          <footer className="pb-2 pt-1">
            <OnboardingProgress current={progress} />
          </footer>
        </div>

        <SphereAnimationStyles />
      </div>
    </OnboardingContext.Provider>
  )
}
