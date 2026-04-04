export const OPENAI_TTS_VOICES = [
  'alloy',
  'ash',
  'ballad',
  'cedar',
  'coral',
  'echo',
  'marin',
  'sage',
  'shimmer',
  'verse',
] as const

export type OpenAITtsVoice = (typeof OPENAI_TTS_VOICES)[number] | 'onyx'
export type ThemeKey = 'red' | 'white' | 'rose' | 'champagne' | 'green'

interface ThemeMotionProfile {
  pulseDuration: number
  speakDuration: number
  waveDuration: number
  glowDuration: number
  shimmerDuration: number
  accent: 'velvet' | 'crisp' | 'blush' | 'bubbles' | 'breeze'
}

export interface ThemeOption {
  key: ThemeKey
  label: string
  subtitle: string
  personality: string
  voiceCharacter: string
  voice: OpenAITtsVoice
  wineColor: string
  highlightColor: string
  glowColor: string
  sparkle?: boolean
  greetingByLanguage: Record<string, string>
  personalityByLanguage: Record<string, string>
  motion: ThemeMotionProfile
}

export const DEFAULT_THEME_KEY: ThemeKey = 'red'
export const DEFAULT_TTS_VOICE: OpenAITtsVoice = 'onyx'

export const THEME_OPTIONS: ThemeOption[] = [
  {
    key: 'red',
    label: 'Red Wine',
    subtitle: 'Warm, deep, sophisticated',
    personality: 'Traditional, confident, quietly formal',
    voiceCharacter: 'Warm, deep, sophisticated waiter',
    voice: 'cedar',
    wineColor: '#722F37',
    highlightColor: '#9C4B58',
    glowColor: '#722F37',
    greetingByLanguage: {
      en: 'Good evening. I will guide your table with calm and precision.',
      fr: 'Bonsoir. Je guiderai votre table avec calme et precision.',
      es: 'Buenas noches. Guiaré su mesa con calma y precision.',
      it: 'Buonasera. Guidero il vostro tavolo con calma e precisione.',
      pt: 'Boa noite. Vou guiar a sua mesa com calma e precisao.',
      ru: 'Dobryy vecher. Ya budu vesti vash stol spokoyno i tochno.',
    },
    personalityByLanguage: {
      en: 'Traditional, knowledgeable, formal',
      fr: 'Traditionnel, expert, formel',
      es: 'Tradicional, conocedor, formal',
      it: 'Tradizionale, competente, formale',
      pt: 'Tradicional, conhecedor, formal',
      ru: 'Traditsionnyy, znayushchiy, formalnyy',
    },
    motion: {
      pulseDuration: 3.4,
      speakDuration: 1,
      waveDuration: 1.9,
      glowDuration: 1.5,
      shimmerDuration: 6.6,
      accent: 'velvet',
    },
  },
  {
    key: 'white',
    label: 'White Wine',
    subtitle: 'Light, crisp, friendly',
    personality: 'Fresh, bright, approachable',
    voiceCharacter: 'Light, crisp, friendly sommelier',
    voice: 'shimmer',
    wineColor: '#F7E7CE',
    highlightColor: '#FFF5E8',
    glowColor: '#F7E7CE',
    greetingByLanguage: {
      en: 'Hello. I can keep things light, fresh, and easy to choose.',
      fr: 'Bonjour. Je peux garder les choses legeres, fraiches et simples a choisir.',
      es: 'Hola. Puedo mantener todo ligero, fresco y facil de elegir.',
      it: 'Ciao. Posso rendere tutto leggero, fresco e facile da scegliere.',
      pt: 'Ola. Posso manter tudo leve, fresco e facil de escolher.',
      ru: 'Zdravstvuyte. Ya sdelayu vybor legkim, svezhim i prostym.',
    },
    personalityByLanguage: {
      en: 'Fresh, approachable, cheerful',
      fr: 'Frais, accessible, joyeux',
      es: 'Fresco, cercano, alegre',
      it: 'Fresco, accessibile, allegro',
      pt: 'Fresco, acessivel, alegre',
      ru: 'Svezhiy, privetlivyy, radostnyy',
    },
    motion: {
      pulseDuration: 2.8,
      speakDuration: 0.86,
      waveDuration: 1.45,
      glowDuration: 1.18,
      shimmerDuration: 4.7,
      accent: 'crisp',
    },
  },
  {
    key: 'rose',
    label: 'Rose',
    subtitle: 'Fresh, fruity, approachable',
    personality: 'Playful, bright, sociable',
    voiceCharacter: 'Fresh, fruity, approachable host',
    voice: 'coral',
    wineColor: '#FFB6C1',
    highlightColor: '#FFD7DF',
    glowColor: '#FFB6C1',
    greetingByLanguage: {
      en: 'Hi there. I am here to keep your table relaxed, easy, and fun.',
      fr: 'Salut. Je suis la pour garder votre table detendue, simple et joyeuse.',
      es: 'Hola. Estoy aqui para que la mesa se sienta relajada, facil y divertida.',
      it: 'Ciao. Sono qui per rendere il tavolo rilassato, semplice e piacevole.',
      pt: 'Ola. Estou aqui para deixar a mesa descontraida, simples e divertida.',
      ru: 'Privet. Ya zdes, chtoby sdelat vash stol legkim, ujutnym i veselym.',
    },
    personalityByLanguage: {
      en: 'Fresh, fruity, approachable',
      fr: 'Frais, fruité, accessible',
      es: 'Fresco, afrutado, cercano',
      it: 'Fresco, fruttato, accessibile',
      pt: 'Fresco, frutado, acessivel',
      ru: 'Svezhiy, fruktovyy, privetlivyy',
    },
    motion: {
      pulseDuration: 3,
      speakDuration: 0.82,
      waveDuration: 1.4,
      glowDuration: 1.08,
      shimmerDuration: 5.2,
      accent: 'blush',
    },
  },
  {
    key: 'champagne',
    label: 'Champagne',
    subtitle: 'Bright, premium, celebratory',
    personality: 'Elegant, festive, polished',
    voiceCharacter: "Bright, celebratory, premium maitre d'",
    voice: 'verse',
    wineColor: '#F5E6C8',
    highlightColor: '#FFF8E9',
    glowColor: '#F5E6C8',
    sparkle: true,
    greetingByLanguage: {
      en: 'Welcome. Let us make this table feel like a celebration.',
      fr: 'Bienvenue. Faisons de cette table un vrai moment de celebration.',
      es: 'Bienvenidos. Hagamos que esta mesa se sienta como una celebracion.',
      it: 'Benvenuti. Facciamo sentire questo tavolo come una celebrazione.',
      pt: 'Bem-vindos. Vamos fazer esta mesa parecer uma celebracao.',
      ru: 'Dobro pozhalovat. Davaite sdelaem etot stol nastoyashchim prazdnikom.',
    },
    personalityByLanguage: {
      en: 'Elegant, premium, celebratory',
      fr: 'Elegant, premium, festif',
      es: 'Elegante, premium, festivo',
      it: 'Elegante, premium, festoso',
      pt: 'Elegante, premium, festivo',
      ru: 'Elegantnyy, premium, prazdnichnyy',
    },
    motion: {
      pulseDuration: 2.6,
      speakDuration: 0.78,
      waveDuration: 1.25,
      glowDuration: 0.96,
      shimmerDuration: 4.1,
      accent: 'bubbles',
    },
  },
  {
    key: 'green',
    label: 'Green Wine',
    subtitle: 'Fresh, youthful, Portuguese',
    personality: 'Local, lively, slightly sparkling',
    voiceCharacter: 'Fresh, youthful, slightly sparkling Portuguese concierge',
    voice: 'sage',
    wineColor: '#C9E4CA',
    highlightColor: '#E6F8E6',
    glowColor: '#90EE90',
    greetingByLanguage: {
      en: 'Ola. I can guide you with a fresh, local, easygoing voice tonight.',
      fr: 'Ola. Je peux vous guider ce soir avec une voix locale, fraiche et detendue.',
      es: 'Ola. Puedo guiarles esta noche con una voz local, fresca y relajada.',
      it: 'Ola. Posso guidarvi stasera con una voce locale, fresca e rilassata.',
      pt: 'Ola. Posso guiar a sua mesa com uma voz local, fresca e descontraida.',
      ru: 'Ola. Segodnya ya budu vesti vas legko, mestno i svezho.',
    },
    personalityByLanguage: {
      en: 'Fresh, youthful, local Portuguese',
      fr: 'Frais, jeune, portugais local',
      es: 'Fresco, juvenil, portugues local',
      it: 'Fresco, giovane, portoghese locale',
      pt: 'Fresco, jovem, portugues local',
      ru: 'Svezhiy, molodoy, mestnyy portugalskiy',
    },
    motion: {
      pulseDuration: 2.9,
      speakDuration: 0.88,
      waveDuration: 1.3,
      glowDuration: 1.05,
      shimmerDuration: 4.9,
      accent: 'breeze',
    },
  },
]

export function getThemeOption(themeKey: ThemeKey | null | undefined) {
  return (
    THEME_OPTIONS.find((option) => option.key === themeKey) ?? THEME_OPTIONS[0]
  )
}

function getLocalizedThemeText(
  dictionary: Record<string, string>,
  languageCode: string | null | undefined
) {
  if (languageCode && dictionary[languageCode]) {
    return dictionary[languageCode]
  }

  return dictionary.en
}

export function getThemeGreeting(
  themeKey: ThemeKey | null | undefined,
  languageCode: string | null | undefined
) {
  return getLocalizedThemeText(
    getThemeOption(themeKey).greetingByLanguage,
    languageCode
  )
}

export function getThemePersonality(
  themeKey: ThemeKey | null | undefined,
  languageCode: string | null | undefined
) {
  return getLocalizedThemeText(
    getThemeOption(themeKey).personalityByLanguage,
    languageCode
  )
}
