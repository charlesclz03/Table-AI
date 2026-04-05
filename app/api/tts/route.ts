import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { DEFAULT_TTS_VOICE, type OpenAITtsVoice } from '@/lib/themes'
import { guardApiRoute } from '@/lib/security/api-protection'
import { RequestGuardError } from '@/lib/security/request-guards'
import { getServerEnv } from '@/lib/server-env'

interface TtsRequestBody {
  text?: string
  voice?: OpenAITtsVoice
}

export async function POST(request: Request) {
  try {
    const protection = guardApiRoute(request, {
      bucket: 'tts',
      limit: 20,
      maxBodyBytes: 8 * 1024,
      rateLimitSource: 'api.tts',
      windowMs: 5 * 60 * 1000,
    })
    const { openAiApiKey } = getServerEnv()

    if (!openAiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI is not configured.' },
        { status: 503 }
      )
    }

    const body = (await request.json()) as TtsRequestBody
    const text = body.text?.trim()
    const voice = body.voice?.trim() || DEFAULT_TTS_VOICE

    if (!text) {
      return NextResponse.json({ error: 'Text is required.' }, { status: 400 })
    }

    if (text.length > 1_200) {
      return NextResponse.json(
        { error: 'Keep TTS requests under 1200 characters.' },
        { status: 413 }
      )
    }

    const client = new OpenAI({
      apiKey: openAiApiKey,
    })

    const response = await client.audio.speech.create(
      {
        model: 'tts-1-hd',
        voice,
        input: text,
      },
      {
        signal: AbortSignal.timeout(15000),
      }
    )

    const buffer = Buffer.from(await response.arrayBuffer())

    return new NextResponse(buffer, {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'audio/mpeg',
        ...protection.headers,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to synthesize audio.',
      },
      {
        status: error instanceof RequestGuardError ? error.status : 500,
      }
    )
  }
}
