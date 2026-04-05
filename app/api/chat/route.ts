import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { persistConversationAnalytics } from '@/lib/analytics'
import type { ConversationMessage } from '@/lib/admin/types'
import { guardApiRoute } from '@/lib/security/api-protection'
import { RequestGuardError } from '@/lib/security/request-guards'
import { getServerEnv } from '@/lib/server-env'
import { getSupabaseServerClient } from '@/lib/supabase/server'

type ChatRole = 'assistant' | 'user'

interface MenuItem {
  id?: string
  name?: string
  price?: number
  category?: string
  description?: string
  allergens?: string[]
  is_vegetarian?: boolean
  is_vegan?: boolean
}

interface ChatMessageInput {
  content?: string
  role?: ChatRole
}

interface RestaurantPromptContext {
  id: string
  menu_json?: MenuItem[] | { items?: MenuItem[] }
  name: string
  rules_md?: string | null
  soul_md?: string | null
}

interface ChatRequestBody {
  conversationId?: string
  language?: string
  messages?: ChatMessageInput[]
  restaurantId?: string
  tableNumber?: string
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function getMenuItems(menu: RestaurantPromptContext['menu_json']) {
  if (Array.isArray(menu)) {
    return menu
  }

  if (menu && Array.isArray(menu.items)) {
    return menu.items
  }

  return []
}

function buildSystemPrompt(restaurant: RestaurantPromptContext) {
  const restaurantName = restaurant.name?.trim() || 'the restaurant'
  const soul = restaurant.soul_md?.trim() || 'Warm, helpful, and concise.'
  const menu = JSON.stringify(getMenuItems(restaurant.menu_json))
  const extraRules = restaurant.rules_md?.trim()

  return [
    `You are ${restaurantName}'s AI concierge.`,
    `Personality: ${soul}.`,
    `Menu: ${menu}.`,
    "Rules: Only answer from menu. If unsure say 'Let me check with the staff.' Never make up info. Do not repeat your opening greeting or re-introduce yourself after the first message. Answer the guest's latest request directly.",
    extraRules ? `Restaurant rules: ${extraRules}` : null,
  ]
    .filter(Boolean)
    .join(' ')
}

async function getRestaurantPromptContext(restaurantId: string) {
  if (!UUID_PATTERN.test(restaurantId)) {
    return null
  }

  const client = getSupabaseServerClient({ serviceRole: true })

  if (!client) {
    throw new Error('Supabase is not configured.')
  }

  const { data, error } = await client
    .from('restaurants')
    .select('id, name, soul_md, rules_md, menu_json')
    .eq('id', restaurantId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data?.name || !data?.soul_md || !data?.menu_json) {
    return null
  }

  return data as RestaurantPromptContext
}

function sanitizeMessages(messages: ChatMessageInput[] = []) {
  const sanitizedMessages = messages
    .filter(
      (
        message
      ): message is Required<Pick<ChatMessageInput, 'content' | 'role'>> =>
        (message.role === 'assistant' || message.role === 'user') &&
        typeof message.content === 'string' &&
        message.content.trim().length > 0
    )
    .slice(-12)
    .map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }))

  if (
    sanitizedMessages.length > 1 &&
    sanitizedMessages[0]?.role === 'assistant'
  ) {
    return sanitizedMessages.slice(1)
  }

  return sanitizedMessages
}

export async function POST(request: Request) {
  try {
    const protection = guardApiRoute(request, {
      bucket: 'chat',
      limit: 30,
      maxBodyBytes: 20 * 1024,
      rateLimitSource: 'api.chat',
      windowMs: 5 * 60 * 1000,
    })
    const { openAiApiKey } = getServerEnv()

    if (!openAiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI is not configured.' },
        { status: 503 }
      )
    }

    const body = (await request.json()) as ChatRequestBody
    const messages = sanitizeMessages(body.messages)
    const conversationId = body.conversationId?.trim() || crypto.randomUUID()
    const restaurantId = body.restaurantId?.trim()

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID is required.' },
        { status: 400 }
      )
    }

    if (messages.length === 0) {
      return NextResponse.json(
        { error: 'At least one message is required.' },
        { status: 400 }
      )
    }

    const restaurant = await getRestaurantPromptContext(restaurantId)

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant context is unavailable.' },
        { status: 404 }
      )
    }

    const client = new OpenAI({
      apiKey: openAiApiKey,
    })

    const completion = await client.chat.completions.create(
      {
        model: 'gpt-4o-mini',
        max_tokens: 300,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: buildSystemPrompt(restaurant),
          },
          ...messages,
        ],
      },
      {
        signal: AbortSignal.timeout(10000),
      }
    )

    const reply = completion.choices[0]?.message?.content?.trim()

    if (!reply) {
      throw new Error('Empty assistant response')
    }

    const lastUserMessage = [...messages]
      .reverse()
      .find((message) => message.role === 'user')

    if (UUID_PATTERN.test(restaurant.id) && lastUserMessage?.content) {
      const conversationMessages: ConversationMessage[] = [
        ...messages,
        {
          role: 'assistant',
          content: reply,
        },
      ]

      void persistConversationAnalytics({
        conversationId,
        tableNumber: body.tableNumber,
        language: body.language,
        questionText: lastUserMessage.content,
        responsePreview: reply,
        restaurant: {
          id: restaurant.id,
        },
        messages: conversationMessages,
      }).catch((analyticsError) => {
        console.error(
          'Unable to persist conversation analytics:',
          analyticsError
        )
      })
    }

    return NextResponse.json(
      { conversationId, reply },
      {
        headers: protection.headers,
      }
    )
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to generate a reply.',
      },
      {
        status: error instanceof RequestGuardError ? error.status : 500,
      }
    )
  }
}
