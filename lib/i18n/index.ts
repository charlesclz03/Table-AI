export const LANGUAGE_STORAGE_KEY = 'gustia-lang'

export const LANGUAGE_OPTIONS = [
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    flag: '\u{1F1FA}\u{1F1F8}',
    modelLabel: 'English',
  },
  {
    code: 'fr',
    label: 'French',
    nativeLabel: 'Francais',
    flag: '\u{1F1EB}\u{1F1F7}',
    modelLabel: 'French',
  },
  {
    code: 'es',
    label: 'Spanish',
    nativeLabel: 'Espanol',
    flag: '\u{1F1EA}\u{1F1F8}',
    modelLabel: 'Spanish',
  },
  {
    code: 'pt',
    label: 'Portuguese',
    nativeLabel: 'Portugues',
    flag: '\u{1F1F5}\u{1F1F9}',
    modelLabel: 'Portuguese',
  },
  {
    code: 'it',
    label: 'Italian',
    nativeLabel: 'Italiano',
    flag: '\u{1F1EE}\u{1F1F9}',
    modelLabel: 'Italian',
  },
  {
    code: 'ru',
    label: 'Russian',
    nativeLabel: '\u0420\u0443\u0441\u0441\u043a\u0438\u0439',
    flag: '\u{1F1F7}\u{1F1FA}',
    modelLabel: 'Russian',
  },
] as const

export const QUICK_LANGUAGE_TOGGLE_CODES = ['pt', 'fr', 'es'] as const

export type LanguageCode = (typeof LANGUAGE_OPTIONS)[number]['code']

export function isLanguageCode(value: string | null | undefined) {
  return LANGUAGE_OPTIONS.some((option) => option.code === value)
}

export function getLanguageOption(code: LanguageCode | null | undefined) {
  return (
    LANGUAGE_OPTIONS.find((option) => option.code === code) ??
    LANGUAGE_OPTIONS[0]
  )
}

export function getQuickLanguageOptions() {
  return QUICK_LANGUAGE_TOGGLE_CODES.map((code) => getLanguageOption(code))
}

export function getLanguageModelInstruction(
  language: string | null | undefined
) {
  if (!isLanguageCode(language)) {
    return null
  }

  return `Always reply in ${getLanguageOption(language as LanguageCode).modelLabel} unless the guest explicitly asks to switch languages.`
}

export function readStoredLanguagePreference() {
  if (typeof window === 'undefined') {
    return null
  }

  const localValue = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)

  if (isLanguageCode(localValue)) {
    return localValue
  }

  const sessionValue = window.sessionStorage.getItem(LANGUAGE_STORAGE_KEY)

  return isLanguageCode(sessionValue) ? sessionValue : null
}

export function writeStoredLanguagePreference(language: LanguageCode) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  window.sessionStorage.setItem(LANGUAGE_STORAGE_KEY, language)
}
