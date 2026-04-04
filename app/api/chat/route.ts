import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getServerEnv } from '@/lib/server-env'

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

interface RestaurantInput {
  id?: string
  menu_json?: MenuItem[] | { items?: MenuItem[] }
  name?: string
  rules_md?: string
  soul_md?: string
}

interface ChatRequestBody {
  messages?: ChatMessageInput[]
  restaurant?: RestaurantInput
}

function getMenuItems(menu: RestaurantInput['menu_json']) {
  if (Array.isArray(menu)) {
    return menu
  }

  if (menu && Array.isArray(menu.items)) {
    return menu.items
  }

  return []
}

function buildSystemPrompt(restaurant: RestaurantInput) {
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
    const { openAiApiKey } = getServerEnv()

    if (!openAiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI is not configured.' },
        { status: 503 }
      )
    }

    const body = (await request.json()) as ChatRequestBody
    const restaurant = body.restaurant
    const messages = sanitizeMessages(body.messages)

    if (!restaurant?.name || !restaurant.soul_md || !restaurant.menu_json) {
      return NextResponse.json(
        { error: 'Restaurant context is required.' },
        { status: 400 }
      )
    }

    if (messages.length === 0) {
      return NextResponse.json(
        { error: 'At least one message is required.' },
        { status: 400 }
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

    return NextResponse.json({ reply })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to generate a reply.',
      },
      { status: 500 }
    )
  }
}
