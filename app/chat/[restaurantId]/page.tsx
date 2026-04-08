'use client'

import Link from 'next/link'
import {
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import {
  Globe2,
  Headphones,
  Mic,
  MicOff,
  Paintbrush,
  Send,
  Volume2,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  buildOnboardingPath,
  DEMO_RESTAURANT,
  fetchRestaurantProfile,
  getLanguageOption,
  getThemeOption,
  LANGUAGE_STORAGE_KEY,
  SphereAnimationStyles,
  THEME_STORAGE_KEY,
  type LanguageCode,
  type RestaurantProfile,
  type ThemeKey,
  WineSphere,
} from './onboarding/_layout'
import {
  ChatBubble,
  getChatBubbleGap,
  getChatBubbleWidth,
  measureChatBubble,
} from './ChatBubble'

type MessageRole = 'assistant' | 'user'

interface ChatMessage {
  id: string
  role: MessageRole
  content: string
}

interface ChatApiUsageWarning {
  message?: string
}

interface ChatApiResponse {
  blocked?: boolean
  conversationId?: string
  reply?: string
  upgradeUrl?: string
  usageWarning?: ChatApiUsageWarning | null
}

interface AssistantResponseResult {
  text: string
  warningMessage?: string
}

class ChatUsageBlockedError extends Error {
  upgradeUrl: string

  constructor(message: string, upgradeUrl: string) {
    super(message)
    this.name = 'ChatUsageBlockedError'
    this.upgradeUrl = upgradeUrl
  }
}

interface SpeechRecognitionAlternativeLike {
  transcript: string
}

interface SpeechRecognitionResultLike {
  isFinal: boolean
  0: SpeechRecognitionAlternativeLike
}

interface SpeechRecognitionEventLike {
  resultIndex: number
  results: ArrayLike<SpeechRecognitionResultLike>
}

interface SpeechRecognitionLike {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort?: () => void
}

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
}

const HEADPHONE_DISCLAIMER_KEY = 'gustia-headphone-disclaimer-dismissed'
const MIC_MUTED_STORAGE_KEY = 'gustia-mic-muted'
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const CHAT_COPY: Record<
  LanguageCode,
  {
    greeting: (restaurantName: string, tableNumber: string) => string
    placeholder: string
    subtitlesLabel: string
    helper: string
    questionPrompt: string
  }
> = {
  en: {
    greeting: (restaurantName, tableNumber) =>
      `Hi! I'm ${restaurantName}'s concierge. Ask me anything about the menu. You're on table ${tableNumber}.`,
    placeholder: 'Ask about dishes, wine, or allergens...',
    subtitlesLabel: 'Live subtitles',
    helper:
      'Voice replies use OpenAI TTS with a browser fallback. If live AI or restaurant data is unavailable, this page switches to demo mode automatically.',
    questionPrompt: 'Your concierge replies will appear here.',
  },
  fr: {
    greeting: (restaurantName, tableNumber) =>
      `Bonsoir. Je suis le concierge de ${restaurantName}. Posez-moi vos questions sur le menu. Vous etes a la table ${tableNumber}.`,
    placeholder: 'Demandez un plat, un vin ou un allergene...',
    subtitlesLabel: 'Sous-titres en direct',
    helper:
      'La voix utilise OpenAI TTS avec un secours navigateur. Si les donnees live ne sont pas disponibles, la demo prend le relais.',
    questionPrompt: 'Les reponses du concierge apparaissent ici.',
  },
  es: {
    greeting: (restaurantName, tableNumber) =>
      `Hola. Soy el concierge de ${restaurantName}. Puedes preguntarme cualquier cosa del menu. Estas en la mesa ${tableNumber}.`,
    placeholder: 'Pregunta por platos, vinos o alergenos...',
    subtitlesLabel: 'Subtitulos en directo',
    helper:
      'La voz usa OpenAI TTS con respaldo del navegador. Si faltan los datos en vivo, la pagina cambia al modo demo.',
    questionPrompt: 'Las respuestas del concierge apareceran aqui.',
  },
  it: {
    greeting: (restaurantName, tableNumber) =>
      `Ciao. Sono il concierge di ${restaurantName}. Chiedimi qualsiasi cosa sul menu. Sei al tavolo ${tableNumber}.`,
    placeholder: 'Chiedi di piatti, vini o allergeni...',
    subtitlesLabel: 'Sottotitoli live',
    helper:
      'La voce usa OpenAI TTS con fallback del browser. Se i dati live non sono disponibili, la pagina passa alla demo.',
    questionPrompt: 'Le risposte del concierge appariranno qui.',
  },
  pt: {
    greeting: (restaurantName, tableNumber) =>
      `Ola. Sou o concierge do ${restaurantName}. Pergunte-me qualquer coisa sobre o menu. Esta na mesa ${tableNumber}.`,
    placeholder: 'Pergunte sobre pratos, vinhos ou alergios...',
    subtitlesLabel: 'Legendas ao vivo',
    helper:
      'A voz usa OpenAI TTS com fallback do navegador. Se os dados reais falharem, a pagina muda para modo demo automaticamente.',
    questionPrompt: 'As respostas do concierge aparecem aqui.',
  },
  ru: {
    greeting: (restaurantName, tableNumber) =>
      `Zdravstvuyte. Ya konsyerzh restorana ${restaurantName}. Zadavaite voprosy o menyu. Vy za stolom ${tableNumber}.`,
    placeholder: 'Sprashivaite o blyudakh, vine ili allergenakh...',
    subtitlesLabel: 'Subtitry',
    helper:
      'Golos ispolzuet OpenAI TTS s rezervnym brauzernym variantom. Esli dannye nedostupny, stranitsa perekhodit v demo rezhim.',
    questionPrompt: 'Otvety konsyerzha poyavyatsya zdes.',
  },
}

function createMessageId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function getMenuItems(menu: RestaurantProfile['menu_json']) {
  if (Array.isArray(menu)) {
    return menu
  }

  if (menu && Array.isArray(menu.items)) {
    return menu.items
  }

  return []
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function trimInitialGreeting(
  messages: ChatMessage[],
  restaurantName: string,
  tableNumber: string,
  language: LanguageCode
) {
  if (messages.length === 0) {
    return messages
  }

  const greeting = CHAT_COPY[language].greeting(restaurantName, tableNumber)

  if (
    messages[0]?.role === 'assistant' &&
    messages[0].content.trim() === greeting.trim()
  ) {
    return messages.slice(1)
  }

  return messages
}

function buildDemoResponse(
  input: string,
  restaurant: RestaurantProfile,
  _language: LanguageCode
) {
  const menuItems = getMenuItems(restaurant.menu_json)
  const normalizedInput = normalizeText(input)
  const wine = menuItems.find((item) =>
    normalizeText(item.category ?? '').includes('wine')
  )
  const vegetarianItems = menuItems.filter((item) => item.is_vegetarian)
  const signatureDish = menuItems[0]

  const mentionedItem =
    menuItems.find((item) =>
      normalizedInput.includes(normalizeText(item.name))
    ) ?? null

  if (mentionedItem && normalizedInput.includes('allergen')) {
    if (mentionedItem.allergens && mentionedItem.allergens.length > 0) {
      return `${mentionedItem.name} contains ${mentionedItem.allergens.join(', ')}.`
    }

    return `I do not have allergen notes for ${mentionedItem.name}. Let me check with the staff.`
  }

  if (
    normalizedInput.includes('vegetarian') ||
    normalizedInput.includes('vegan')
  ) {
    if (vegetarianItems.length === 0) {
      return 'Let me check with the staff.'
    }

    const names = vegetarianItems.map((item) => item.name).join(' and ')
    return `Yes. I can suggest ${names}.`
  }

  if (
    normalizedInput.includes('wine') ||
    normalizedInput.includes('pair') ||
    normalizedInput.includes('goes with')
  ) {
    if (wine) {
      return `${wine.name} is a strong pairing from our menu.`
    }

    return 'Let me check with the staff.'
  }

  if (
    normalizedInput.includes('recommend') ||
    normalizedInput.includes('what should i order') ||
    normalizedInput.includes('signature')
  ) {
    if (signatureDish) {
      return `You should try ${signatureDish.name}. ${signatureDish.description ?? 'It is one of our standout dishes.'}`
    }

    return 'Let me check with the staff.'
  }

  if (mentionedItem) {
    const price = mentionedItem.price ? ` EUR ${mentionedItem.price}` : ''
    const description = mentionedItem.description
      ? ` ${mentionedItem.description}`
      : ''
    return `${mentionedItem.name}${price}.${description}`.trim()
  }

  if (
    normalizedInput.includes('hello') ||
    normalizedInput.includes('hi') ||
    normalizedInput.includes('hey')
  ) {
    return 'How can I help with the menu today?'
  }

  return 'Let me check with the staff.'
}

export default function RestaurantChatPage() {
  const router = useRouter()
  const params = useParams<{ restaurantId: string }>()
  const searchParams = useSearchParams()
  const restaurantId = params?.restaurantId ?? 'demo'
  const tableNumber = searchParams.get('table')?.trim() || 'T1'

  const [restaurant, setRestaurant] = useState<RestaurantProfile | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [latestSubtitle, setLatestSubtitle] = useState('')
  const [showHeadphoneDisclaimer, setShowHeadphoneDisclaimer] = useState(true)
  const [hasResolvedDisclaimer, setHasResolvedDisclaimer] = useState(false)
  const [isSpeechSupported, setIsSpeechSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isLoadingRestaurant, setIsLoadingRestaurant] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isHoldingToTalk, setIsHoldingToTalk] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [userMessageCount, setUserMessageCount] = useState(0)
  const [ctaDismissed, setCtaDismissed] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [language, setLanguage] = useState<LanguageCode | null>(null)
  const [theme, setTheme] = useState<ThemeKey | null>(null)
  const [isPreferenceGateReady, setIsPreferenceGateReady] = useState(false)

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioUrlRef = useRef<string | null>(null)
  const messagesViewportRef = useRef<HTMLDivElement | null>(null)
  const latestMessageRef = useRef<ChatMessage[]>([])
  const conversationIdRef = useRef<string | null>(null)
  const greetingSentRef = useRef(false)
  const voiceReadyRef = useRef(false)
  const isHoldingToTalkRef = useRef(false)
  const voiceTranscriptRef = useRef('')
  const interimTranscriptRef = useRef('')
  const shouldSubmitVoiceRef = useRef(false)
  const voiceOutputEnabled = hasResolvedDisclaimer && !showHeadphoneDisclaimer
  const deferredInterimTranscript = useDeferredValue(interimTranscript)
  const [messageViewportWidth, setMessageViewportWidth] = useState(0)
  const [messageViewportHeight, setMessageViewportHeight] = useState(0)
  const [messageScrollTop, setMessageScrollTop] = useState(0)

  useEffect(() => {
    latestMessageRef.current = messages
  }, [messages])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    if (!isPreferenceGateReady) {
      return
    }

    const viewport = messagesViewportRef.current

    if (!viewport) {
      return
    }

    const syncViewportMetrics = () => {
      setMessageViewportWidth(viewport.clientWidth)
      setMessageViewportHeight(viewport.clientHeight)
      setMessageScrollTop(viewport.scrollTop)
    }

    syncViewportMetrics()

    const resizeObserver = new ResizeObserver(() => {
      syncViewportMetrics()
    })

    resizeObserver.observe(viewport)

    return () => {
      resizeObserver.disconnect()
    }
  }, [isPreferenceGateReady])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const storedLanguage = window.sessionStorage.getItem(LANGUAGE_STORAGE_KEY)
    const storedTheme = window.sessionStorage.getItem(THEME_STORAGE_KEY)

    setIsSpeechSupported(Boolean(window.webkitSpeechRecognition))
    setIsMuted(window.sessionStorage.getItem(MIC_MUTED_STORAGE_KEY) === 'true')
    setShowHeadphoneDisclaimer(
      window.sessionStorage.getItem(HEADPHONE_DISCLAIMER_KEY) !== 'true'
    )

    if (!storedLanguage) {
      router.replace(buildOnboardingPath(restaurantId, 'language', tableNumber))
      return
    }

    if (!storedTheme) {
      setLanguage(storedLanguage as LanguageCode)
      router.replace(buildOnboardingPath(restaurantId, 'theme', tableNumber))
      return
    }

    setLanguage(storedLanguage as LanguageCode)
    setTheme(storedTheme as ThemeKey)
    setHasResolvedDisclaimer(true)
    setIsPreferenceGateReady(true)
  }, [restaurantId, router, tableNumber])

  useEffect(() => {
    if (typeof window === 'undefined' || !isPreferenceGateReady) {
      return
    }

    window.sessionStorage.setItem(
      MIC_MUTED_STORAGE_KEY,
      isMuted ? 'true' : 'false'
    )
  }, [isMuted, isPreferenceGateReady])

  useEffect(() => {
    if (!voiceOutputEnabled) {
      return
    }

    voiceReadyRef.current = true
  }, [voiceOutputEnabled])

  const handleDismissDisclaimer = useCallback(
    function handleDismissDisclaimer() {
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(HEADPHONE_DISCLAIMER_KEY, 'true')
      }

      setHasResolvedDisclaimer(true)
      setShowHeadphoneDisclaimer(false)
    },
    []
  )

  const stopVoicePlayback = useCallback(function stopVoicePlayback() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }

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

    setIsSpeaking(false)
  }, [])

  const speakWithBrowserTts = useCallback(
    function speakWithBrowserTts(text: string) {
      if (
        !voiceOutputEnabled ||
        typeof window === 'undefined' ||
        !('speechSynthesis' in window)
      ) {
        return false
      }

      stopVoicePlayback()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language ?? 'en'
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)

      return true
    },
    [language, stopVoicePlayback, voiceOutputEnabled]
  )

  const speakAssistantReply = useCallback(
    async function speakAssistantReply(text: string) {
      if (
        !voiceOutputEnabled ||
        typeof window === 'undefined' ||
        !text.trim()
      ) {
        return
      }

      stopVoicePlayback()

      let fallbackTriggered = false

      const fallbackToBrowserTts = (error?: unknown) => {
        if (fallbackTriggered) {
          return
        }

        fallbackTriggered = true
        console.error('OpenAI TTS error:', error)
        stopVoicePlayback()
        speakWithBrowserTts(text)
      }

      try {
        setIsSpeaking(true)

        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        })

        if (!response.ok) {
          throw new Error(`TTS failed with ${response.status}`)
        }

        const blob = await response.blob()

        if (blob.size === 0) {
          throw new Error('TTS returned empty audio')
        }

        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audio.preload = 'auto'
        audio.setAttribute('playsinline', '')

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

        audio.onplay = () => setIsSpeaking(true)
        audio.onended = () => {
          cleanupAudio()
          setIsSpeaking(false)
        }
        audio.onerror = () => {
          cleanupAudio()
          fallbackToBrowserTts(new Error('Audio playback failed'))
        }

        await audio.play()
      } catch (error) {
        fallbackToBrowserTts(error)
      }
    },
    [speakWithBrowserTts, stopVoicePlayback, voiceOutputEnabled]
  )

  useEffect(() => {
    if (!showHeadphoneDisclaimer || typeof window === 'undefined') {
      return
    }

    const timeoutId = window.setTimeout(() => {
      handleDismissDisclaimer()
    }, 3000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [handleDismissDisclaimer, showHeadphoneDisclaimer])

  useEffect(() => {
    let cancelled = false

    async function loadRestaurant() {
      if (!isPreferenceGateReady) {
        return
      }

      setIsLoadingRestaurant(true)
      setErrorMessage('')
      greetingSentRef.current = false
      conversationIdRef.current = null
      latestMessageRef.current = []
      setMessages([])
      setLatestSubtitle('')
      setUserMessageCount(0)
      setCtaDismissed(false)

      try {
        const foundRestaurant = await fetchRestaurantProfile(restaurantId)

        if (!cancelled) {
          setRestaurant(foundRestaurant)
          setIsDemoMode(foundRestaurant.subscription_status === 'demo')
        }
      } catch {
        if (!cancelled) {
          setRestaurant({
            ...DEMO_RESTAURANT,
            id: restaurantId,
          })
          setIsDemoMode(true)
          setErrorMessage(
            'Live restaurant data unavailable. Showing demo mode.'
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoadingRestaurant(false)
        }
      }
    }

    void loadRestaurant()

    return () => {
      cancelled = true
    }
  }, [isPreferenceGateReady, restaurantId])

  useEffect(() => {
    if (!restaurant || !language || greetingSentRef.current) {
      return
    }

    const localizedCopy = CHAT_COPY[language]
    const greetingMessage: ChatMessage = {
      id: createMessageId(),
      role: 'assistant',
      content: localizedCopy.greeting(restaurant.name, tableNumber),
    }

    greetingSentRef.current = true
    setMessages([greetingMessage])
    setLatestSubtitle(greetingMessage.content)

    if (voiceReadyRef.current) {
      void speakAssistantReply(greetingMessage.content)
    }
  }, [language, restaurant, speakAssistantReply, tableNumber])

  const getAssistantResponse = useCallback(
    async function getAssistantResponse(
      userInput: string,
      activeRestaurant: RestaurantProfile
    ): Promise<AssistantResponseResult> {
      if (isDemoMode || !UUID_PATTERN.test(activeRestaurant.id)) {
        return {
          text: buildDemoResponse(
            userInput,
            activeRestaurant,
            language ?? 'en'
          ),
        }
      }

      if (!language || !theme) {
        return {
          text: buildDemoResponse(
            userInput,
            activeRestaurant,
            language ?? 'en'
          ),
        }
      }

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversationId: conversationIdRef.current,
            language,
            messages: trimInitialGreeting(
              latestMessageRef.current,
              activeRestaurant.name,
              tableNumber,
              language
            ),
            restaurantId: activeRestaurant.id,
            tableNumber,
          }),
          signal: AbortSignal.timeout(12000),
        })

        const data = (await response.json()) as ChatApiResponse

        if (!response.ok) {
          if (response.status === 429 && data.blocked) {
            throw new ChatUsageBlockedError(
              'This restaurant has reached its free monthly chat limit.',
              data.upgradeUrl?.trim() || '/admin/billing'
            )
          }

          throw new Error(`Chat request failed with ${response.status}`)
        }

        const content = data.reply?.trim()

        if (!content) {
          throw new Error('Empty assistant response')
        }

        if (data.conversationId) {
          conversationIdRef.current = data.conversationId
        }

        return {
          text: content,
          warningMessage:
            data.usageWarning?.message?.trim() ||
            response.headers.get('X-Gustia-Usage-Warning')?.trim() ||
            undefined,
        }
      } catch (error) {
        if (error instanceof ChatUsageBlockedError) {
          throw error
        }

        return {
          text: buildDemoResponse(
            userInput,
            activeRestaurant,
            language ?? 'en'
          ),
        }
      }
    },
    [isDemoMode, language, tableNumber, theme]
  )

  const submitMessage = useCallback(
    async function submitMessage(rawMessage: string) {
      const trimmedMessage = rawMessage.trim()

      if (!trimmedMessage || !restaurant || isSending) {
        return
      }

      setErrorMessage('')
      setIsSending(true)

      const previousMessages = [...latestMessageRef.current]
      const userMessage: ChatMessage = {
        id: createMessageId(),
        role: 'user',
        content: trimmedMessage,
      }

      const nextMessages = [...previousMessages, userMessage]
      latestMessageRef.current = nextMessages
      setMessages(nextMessages)
      setInputValue('')
      setInterimTranscript('')

      try {
        const assistantResponse = await getAssistantResponse(
          trimmedMessage,
          restaurant
        )
        const assistantText = assistantResponse.text

        const assistantMessage: ChatMessage = {
          id: createMessageId(),
          role: 'assistant',
          content: assistantText,
        }

        latestMessageRef.current = [...nextMessages, assistantMessage]
        setMessages(latestMessageRef.current)
        setLatestSubtitle(assistantText)
        setUserMessageCount((current) => current + 1)
        setErrorMessage(assistantResponse.warningMessage || '')
        void speakAssistantReply(assistantText)
      } catch (error) {
        if (error instanceof ChatUsageBlockedError) {
          latestMessageRef.current = previousMessages
          setMessages(previousMessages)
          setInputValue(trimmedMessage)
          setErrorMessage(
            `${error.message} Upgrade in ${error.upgradeUrl} to continue.`
          )
          return
        }

        const fallbackText = 'Let me check with the staff.'
        const assistantMessage: ChatMessage = {
          id: createMessageId(),
          role: 'assistant',
          content: fallbackText,
        }

        latestMessageRef.current = [...nextMessages, assistantMessage]
        setMessages(latestMessageRef.current)
        setLatestSubtitle(fallbackText)
        setUserMessageCount((current) => current + 1)
        void speakAssistantReply(fallbackText)
      } finally {
        setIsSending(false)
      }
    },
    [getAssistantResponse, isSending, restaurant, speakAssistantReply]
  )

  const finalizeVoiceInput = useCallback(
    function finalizeVoiceInput() {
      const transcript = [
        voiceTranscriptRef.current,
        interimTranscriptRef.current,
      ]
        .filter(Boolean)
        .join(' ')
        .trim()

      shouldSubmitVoiceRef.current = false
      voiceTranscriptRef.current = ''
      interimTranscriptRef.current = ''
      setInterimTranscript('')
      setIsListening(false)
      setIsHoldingToTalk(false)

      if (!transcript) {
        setInputValue('')
        return
      }

      setInputValue(transcript)
      void submitMessage(transcript)
    },
    [submitMessage]
  )

  useEffect(() => {
    if (typeof window === 'undefined' || !window.webkitSpeechRecognition) {
      return
    }

    const recognition = new window.webkitSpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang =
      language ??
      (typeof navigator !== 'undefined'
        ? navigator.language || 'en-US'
        : 'en-US')

    recognition.onresult = (event) => {
      let finalTranscript = ''
      let partialTranscript = ''

      for (
        let index = event.resultIndex;
        index < event.results.length;
        index += 1
      ) {
        const result = event.results[index]
        const transcript = result[0]?.transcript ?? ''

        if (result.isFinal) {
          finalTranscript += ` ${transcript}`
        } else {
          partialTranscript += ` ${transcript}`
        }
      }

      const finalizedText = finalTranscript.trim()
      const partialText = partialTranscript.trim()

      if (finalizedText) {
        voiceTranscriptRef.current = [voiceTranscriptRef.current, finalizedText]
          .filter(Boolean)
          .join(' ')
          .trim()
      }

      interimTranscriptRef.current = partialText
      setInterimTranscript(partialText)
      setInputValue(
        [voiceTranscriptRef.current, partialText]
          .filter(Boolean)
          .join(' ')
          .trim()
      )
    }

    recognition.onerror = () => {
      if (shouldSubmitVoiceRef.current) {
        finalizeVoiceInput()
        return
      }

      setIsListening(false)
      setIsHoldingToTalk(false)
      isHoldingToTalkRef.current = false
      setErrorMessage(
        'Voice input was interrupted. Hold the mic to try again or type below.'
      )
    }

    recognition.onend = () => {
      if (isHoldingToTalkRef.current && !shouldSubmitVoiceRef.current) {
        try {
          recognition.start()
          setIsListening(true)
          return
        } catch {
          setIsListening(false)
        }
      }

      if (shouldSubmitVoiceRef.current) {
        finalizeVoiceInput()
        return
      }

      voiceTranscriptRef.current = ''
      interimTranscriptRef.current = ''
      setIsListening(false)
      setIsHoldingToTalk(false)
      setInterimTranscript('')
    }

    recognitionRef.current = recognition

    return () => {
      recognitionRef.current?.abort?.()
      recognitionRef.current = null
    }
  }, [finalizeVoiceInput, language])

  useEffect(() => {
    return () => {
      stopVoicePlayback()
    }
  }, [stopVoicePlayback])

  const startVoiceInput = useCallback(
    function startVoiceInput(event: ReactPointerEvent<HTMLButtonElement>) {
      if (
        isMuted ||
        !isSpeechSupported ||
        !recognitionRef.current ||
        isSending
      ) {
        return
      }

      event.preventDefault()
      event.currentTarget.setPointerCapture(event.pointerId)
      stopVoicePlayback()
      setErrorMessage('')
      shouldSubmitVoiceRef.current = false
      isHoldingToTalkRef.current = true
      voiceTranscriptRef.current = ''
      interimTranscriptRef.current = ''
      setInputValue('')
      setInterimTranscript('')
      setIsHoldingToTalk(true)

      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch {
        setIsHoldingToTalk(false)
        isHoldingToTalkRef.current = false
      }
    },
    [isMuted, isSending, isSpeechSupported, stopVoicePlayback]
  )

  const stopVoiceInput = useCallback(
    function stopVoiceInput(event?: ReactPointerEvent<HTMLButtonElement>) {
      if (event && event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }

      if (!isHoldingToTalkRef.current && !isListening) {
        return
      }

      shouldSubmitVoiceRef.current = true
      isHoldingToTalkRef.current = false

      if (!recognitionRef.current || !isListening) {
        finalizeVoiceInput()
        return
      }

      recognitionRef.current.stop()
    },
    [finalizeVoiceInput, isListening]
  )

  const cancelVoiceInput = useCallback(function cancelVoiceInput(
    event?: ReactPointerEvent<HTMLButtonElement>
  ) {
    if (event && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    shouldSubmitVoiceRef.current = false
    isHoldingToTalkRef.current = false
    voiceTranscriptRef.current = ''
    interimTranscriptRef.current = ''
    setIsListening(false)
    setIsHoldingToTalk(false)
    setInterimTranscript('')
    setInputValue('')

    recognitionRef.current?.stop()
  }, [])

  useEffect(() => {
    if (isMuted) {
      cancelVoiceInput()
    }
  }, [cancelVoiceInput, isMuted])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handlePointerUp = () => {
      if (!isHoldingToTalkRef.current) {
        return
      }

      shouldSubmitVoiceRef.current = true
      isHoldingToTalkRef.current = false
      recognitionRef.current?.stop()
    }

    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [])

  useEffect(() => {
    if (showHeadphoneDisclaimer && typeof window !== 'undefined') {
      stopVoicePlayback()
    }
  }, [showHeadphoneDisclaimer, stopVoicePlayback])

  useEffect(() => {
    if (messages.length !== 1) {
      return
    }

    const onlyMessage = messages[0]

    if (onlyMessage?.role === 'assistant') {
      setLatestSubtitle(onlyMessage.content)
    }
  }, [messages])

  function handleTextSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void submitMessage(inputValue)
  }

  const chatBubbleGap = getChatBubbleGap()
  const chatBubbleWidth = getChatBubbleWidth(messageViewportWidth)
  const chatItems: Array<{
    id: string
    role: MessageRole
    content: string
    top: number
    height: number
    pending: boolean
  }> = []
  let nextChatItemTop = 0

  for (const message of messages) {
    const { height } = measureChatBubble(message.content, chatBubbleWidth)
    chatItems.push({
      id: message.id,
      role: message.role,
      content: message.content,
      top: nextChatItemTop,
      height,
      pending: false,
    })
    nextChatItemTop += height + chatBubbleGap
  }

  if (deferredInterimTranscript) {
    const { height } = measureChatBubble(
      deferredInterimTranscript,
      chatBubbleWidth
    )
    chatItems.push({
      id: 'interim-transcript',
      role: 'assistant',
      content: deferredInterimTranscript,
      top: nextChatItemTop,
      height,
      pending: true,
    })
    nextChatItemTop += height + chatBubbleGap
  }

  const totalMeasuredScrollHeight =
    chatItems.length > 0 ? nextChatItemTop - chatBubbleGap : 0
  const overscanPixels = 240
  const visibleTop = Math.max(0, messageScrollTop - overscanPixels)
  const visibleBottom =
    messageViewportHeight > 0
      ? messageScrollTop + messageViewportHeight + overscanPixels
      : Number.POSITIVE_INFINITY
  const visibleChatItems =
    messageViewportHeight > 0
      ? chatItems.filter((item) => {
          const itemBottom = item.top + item.height
          return itemBottom >= visibleTop && item.top <= visibleBottom
        })
      : chatItems

  useEffect(() => {
    const viewport = messagesViewportRef.current

    if (!viewport) {
      return
    }

    const targetTop = Math.max(
      totalMeasuredScrollHeight - viewport.clientHeight,
      0
    )
    const behavior =
      messages.length <= 1 && !deferredInterimTranscript ? 'auto' : 'smooth'

    viewport.scrollTo({
      top: targetTop,
      behavior,
    })
    setMessageScrollTop(targetTop)
  }, [deferredInterimTranscript, messages.length, totalMeasuredScrollHeight])

  if (!isPreferenceGateReady || !language || !theme) {
    return (
      <div className="fixed inset-0 overflow-hidden text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_transparent_30%),linear-gradient(180deg,_#0b0908_0%,_#05060a_100%)]" />
        <div className="relative flex min-h-screen items-center justify-center">
          <div className="text-center">
            <WineSphere themeKey="red" speaking size="xl" className="mx-auto" />
            <p className="mt-6 text-sm text-white/60">
              Preparing your concierge experience...
            </p>
          </div>
        </div>
        <SphereAnimationStyles />
      </div>
    )
  }

  const activeLanguage = getLanguageOption(language)
  const activeTheme = getThemeOption(theme)
  const localizedCopy = CHAT_COPY[language]
  const visibleSubtitle = latestSubtitle || localizedCopy.questionPrompt
  const shouldShowDemoCta = userMessageCount >= 3 && !ctaDismissed

  return (
    <div className="fixed inset-0 z-50 overflow-hidden text-white">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at top, ${activeTheme.glowColor}2E, transparent 30%), radial-gradient(circle at bottom, rgba(249,115,22,0.12), transparent 38%), linear-gradient(180deg, #100c08 0%, #05060a 100%)`,
        }}
      />

      <div className="relative flex h-full flex-col overflow-hidden">
        <header className="px-4 pb-3 pt-4">
          <div className="glass-panel mx-auto flex w-full max-w-md flex-col gap-3 rounded-[28px] px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.32em] text-amber-200/70">
                Gustia Concierge
              </p>
              <h1 className="mt-1 break-words text-xl font-semibold text-white">
                {restaurant?.name ?? 'Loading restaurant...'}
              </h1>
              <p className="mt-1 text-sm text-white/65">Table {tableNumber}</p>
            </div>

            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
              <Link
                href={buildOnboardingPath(
                  restaurantId,
                  'language',
                  tableNumber
                )}
                className="glass-chip flex h-11 w-11 items-center justify-center rounded-full text-white/75 transition hover:bg-white/12 hover:text-white"
                aria-label="Change language"
              >
                <Globe2 className="h-4 w-4" />
              </Link>
              <Link
                href={buildOnboardingPath(restaurantId, 'theme', tableNumber)}
                className="glass-chip flex h-11 w-11 items-center justify-center rounded-full text-white/75 transition hover:bg-white/12 hover:text-white"
                aria-label="Change theme"
              >
                <Paintbrush className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={() => setIsMuted((current) => !current)}
                className={cn(
                  'glass-chip flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-white/12',
                  isMuted ? 'text-rose-200' : 'text-white/75 hover:text-white'
                )}
                aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                aria-pressed={isMuted}
              >
                {isMuted ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>
              <div className="glass-chip flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-3 py-2 text-center text-xs text-white/70 sm:w-auto">
                <Volume2 className="h-3.5 w-3.5" />
                <span>
                  {activeLanguage.flag}{' '}
                  {isMuted
                    ? 'Mic muted'
                    : isSpeechSupported
                      ? 'Voice ready'
                      : 'Text fallback'}
                </span>
              </div>
            </div>
          </div>

          {showHeadphoneDisclaimer ? (
            <div className="glass-alert-amber mx-auto mt-3 flex w-full max-w-md items-start gap-3 rounded-[24px] px-4 py-3 text-sm text-amber-50">
              <Headphones className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  Please use headphones for voice replies.
                </p>
                <p className="mt-1 text-amber-50/75">
                  This auto-closes after a few seconds and only appears once per
                  session so guests can keep the restaurant atmosphere calm.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDismissDisclaimer}
                className="flex h-11 w-11 items-center justify-center rounded-full text-amber-100/80 transition hover:bg-white/10 hover:text-white"
                aria-label="Dismiss headphone reminder"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : null}

          {errorMessage ? (
            <div className="glass-panel-soft mx-auto mt-3 w-full max-w-md rounded-[20px] px-4 py-3 text-sm text-white/75">
              {errorMessage}
            </div>
          ) : null}
        </header>

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-4">
          <div className="mx-auto flex h-full w-full max-w-md min-h-0 flex-col">
            <section className="glass-panel overflow-hidden rounded-[32px] px-4 pb-5 pt-5 sm:px-5 sm:pt-6">
              <div className="flex flex-col items-center text-center">
                <WineSphere
                  themeKey={theme}
                  speaking={isSpeaking}
                  size="xl"
                  className={cn(
                    'transition-all duration-300',
                    (isListening || isHoldingToTalk) && 'scale-[1.02]'
                  )}
                />

                <div className="glass-panel-soft mt-4 w-full overflow-hidden rounded-[24px] px-4 py-4">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
                    {localizedCopy.subtitlesLabel}
                  </p>
                  <p className="mt-3 break-words text-sm leading-7 text-white sm:text-base">
                    {visibleSubtitle}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-center text-xs text-white/55">
                  <span
                    className={cn(
                      'inline-block h-2.5 w-2.5 rounded-full',
                      isSending
                        ? 'bg-amber-300'
                        : isSpeaking
                          ? 'bg-amber-100'
                          : isListening
                            ? 'bg-rose-400'
                            : 'bg-emerald-400'
                    )}
                  />
                  <span>
                    {isLoadingRestaurant
                      ? 'Loading concierge profile'
                      : isSending
                        ? 'Concierge is thinking'
                        : isSpeaking
                          ? `${activeTheme.label} sphere is speaking`
                          : isMuted
                            ? 'Microphone muted'
                            : isHoldingToTalk || isListening
                              ? 'Listening while held'
                              : isDemoMode
                                ? 'Demo mode'
                                : 'Live mode'}
                  </span>
                </div>
              </div>
            </section>

            <section className="glass-panel mt-4 min-h-0 flex-1 overflow-hidden rounded-[28px] p-3">
              <div
                ref={messagesViewportRef}
                onScroll={(event) =>
                  setMessageScrollTop(event.currentTarget.scrollTop)
                }
                className="h-full overflow-y-auto overscroll-contain pr-1"
              >
                <div
                  className="relative"
                  style={{
                    minHeight: totalMeasuredScrollHeight
                      ? `${totalMeasuredScrollHeight}px`
                      : undefined,
                  }}
                >
                  {visibleChatItems.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        'absolute left-0 right-0 flex',
                        item.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                      style={{
                        top: `${item.top}px`,
                      }}
                    >
                      <ChatBubble
                        role={item.role}
                        content={item.content}
                        estimatedHeight={item.height}
                        pending={item.pending}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {shouldShowDemoCta ? (
              <section className="glass-alert-emerald mt-4 rounded-[28px] px-4 py-4 text-white">
                <p className="text-[11px] uppercase tracking-[0.3em] text-emerald-200/70">
                  Demo CTA
                </p>
                <h2 className="mt-2 text-lg font-semibold">
                  Want this live for your restaurant?
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  Founding setup includes the first month live, QR deployment,
                  and concierge tuning.
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={`mailto:contact@gustia.wine?subject=${encodeURIComponent(
                      `I want Gustia for ${restaurant?.name ?? 'my restaurant'}`
                    )}`}
                    className="glass-button-emerald flex min-h-11 flex-1 items-center justify-center rounded-full px-4 py-3 text-center text-sm font-semibold text-emerald-50 transition hover:bg-emerald-300/24"
                  >
                    Yes, I want this
                  </a>
                  <button
                    type="button"
                    onClick={() => setCtaDismissed(true)}
                    className="glass-button flex min-h-11 flex-1 items-center justify-center rounded-full px-4 py-3 text-sm text-white/75 transition hover:bg-white/12 hover:text-white"
                  >
                    No, thanks
                  </button>
                </div>
              </section>
            ) : null}
          </div>
        </main>

        <footer className="px-4 pb-4 pt-2 sm:pb-6">
          <div className="glass-panel mx-auto w-full max-w-md overflow-hidden rounded-[32px] p-3">
            <form
              onSubmit={handleTextSubmit}
              className="flex items-end gap-2 sm:gap-3"
            >
              <button
                type="button"
                onPointerDown={startVoiceInput}
                onPointerUp={stopVoiceInput}
                onPointerCancel={cancelVoiceInput}
                onPointerLeave={(event) => {
                  if (isHoldingToTalk) {
                    stopVoiceInput(event)
                  }
                }}
                disabled={
                  isMuted ||
                  !isSpeechSupported ||
                  isLoadingRestaurant ||
                  isSending
                }
                className={cn(
                  'flex h-14 w-14 shrink-0 items-center justify-center rounded-full border transition-all duration-300',
                  isMuted
                    ? 'border-rose-300/30 bg-rose-400/10 text-rose-100/80 backdrop-blur-xl'
                    : isHoldingToTalk || isListening
                      ? 'border-rose-300/50 bg-rose-400/20 text-rose-50 shadow-[0_0_24px_rgba(251,113,133,0.25)] backdrop-blur-xl'
                      : 'glass-chip text-white',
                  (isMuted ||
                    !isSpeechSupported ||
                    isLoadingRestaurant ||
                    isSending) &&
                    'cursor-not-allowed opacity-45'
                )}
                aria-pressed={isHoldingToTalk || isListening}
                aria-label={
                  isMuted
                    ? 'Microphone is muted'
                    : isHoldingToTalk || isListening
                      ? 'Release to send voice input'
                      : 'Press and hold to talk'
                }
              >
                {isMuted || isHoldingToTalk || isListening ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </button>

              <label className="min-w-0 flex-1">
                <span className="sr-only">Type your message</span>
                <textarea
                  name="message"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  rows={1}
                  placeholder={localizedCopy.placeholder}
                  className="glass-input min-h-14 w-full resize-none rounded-[24px] px-4 py-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-amber-300/40"
                />
              </label>

              <button
                type="submit"
                disabled={
                  !inputValue.trim() || isSending || isLoadingRestaurant
                }
                className={cn(
                  'glass-button-amber flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-amber-50 transition hover:bg-amber-300/24',
                  (!inputValue.trim() || isSending || isLoadingRestaurant) &&
                    'cursor-not-allowed opacity-45'
                )}
                aria-label="Send message"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>

            <p className="mt-3 px-1 text-xs leading-5 text-white/45">
              {isMuted
                ? 'Microphone muted. Unmute in the header to use hold-to-talk.'
                : 'Hold the mic to talk, then release to send.'}{' '}
              {localizedCopy.helper}
            </p>
          </div>
        </footer>
      </div>

      <SphereAnimationStyles />
    </div>
  )
}
