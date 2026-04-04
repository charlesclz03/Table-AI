import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getServerEnv } from '@/lib/server-env'

interface TtsRequestBody {
  text?: string
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

    const body = (await request.json()) as TtsRequestBody
    const text = body.text?.trim()

    if (!text) {
      return NextResponse.json({ error: 'Text is required.' }, { status: 400 })
    }

    const client = new OpenAI({
      apiKey: openAiApiKey,
    })

    const response = await client.audio.speech.create(
      {
        model: 'tts-1-hd',
        voice: 'onyx',
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
      { status: 500 }
    )
  }
}
