import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { zodTextFormat } from 'openai/helpers/zod'
import {
  dedupeParsedMenuItems,
  MENU_UPLOAD_ACCEPT,
  normalizeParsedMenuItems,
  parsedMenuPayloadSchema,
} from '@/lib/admin/menu-import'
import { getAdminRestaurantForRequest } from '@/lib/admin/server'
import { getServerEnv } from '@/lib/server-env'

const MAX_FILES = 8
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024

const MENU_PARSE_PROMPT = [
  'You are a menu parsing AI.',
  'Extract all dishes and drinks from the provided restaurant menu file.',
  'Menus may be in English, Portuguese, French, Spanish, or any other language.',
  'Preserve each item name and description in the original menu language.',
  'Return a JSON object with an `items` array and an optional `notes` array.',
  'Each item must include: name, price, category, description, allergens.',
  'Use null for price when the image is unclear or no price is shown.',
  'Infer a short category such as starter, main, dessert, drink, wine, cocktail, or similar.',
  'Only list actual menu items. Ignore headings, page numbers, opening hours, contact info, and decorative text.',
  'If the file quality is poor, still return the items you can read confidently and explain uncertainty in `notes`.',
].join(' ')

function isPdfFile(file: File) {
  return (
    file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  )
}

function isSupportedFile(file: File) {
  return (
    file.type.startsWith('image/') ||
    isPdfFile(file) ||
    MENU_UPLOAD_ACCEPT.includes(
      file.type as (typeof MENU_UPLOAD_ACCEPT)[number]
    )
  )
}

function getUploadedFiles(formData: FormData) {
  const entries = [
    ...formData.getAll('file'),
    ...formData.getAll('files'),
    ...formData.getAll('files[]'),
  ]

  return entries.filter(
    (entry): entry is File => entry instanceof File && entry.size > 0
  )
}

async function parseMenuFile(client: OpenAI, file: File) {
  const uploadedFile = await client.files.create({
    file,
    purpose: 'user_data',
  })

  await client.files.waitForProcessing(uploadedFile.id, {
    pollInterval: 500,
    maxWait: 15000,
  })

  const response = await client.responses.parse(
    {
      model: 'gpt-4o',
      instructions: MENU_PARSE_PROMPT,
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: `Extract all menu items from ${file.name}.`,
            },
            isPdfFile(file)
              ? {
                  type: 'input_file',
                  file_id: uploadedFile.id,
                }
              : {
                  type: 'input_image',
                  file_id: uploadedFile.id,
                  detail: 'high',
                },
          ],
        },
      ],
      text: {
        format: zodTextFormat(parsedMenuPayloadSchema, 'menu_photo_parse'),
      },
    },
    {
      signal: AbortSignal.timeout(45000),
    }
  )

  return response.output_parsed
}

function toFriendlyError(error: unknown) {
  const status =
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof error.status === 'number'
      ? error.status
      : null

  if (status === 429) {
    return {
      message:
        'Menu parsing is temporarily unavailable because the OpenAI quota was reached. Please try again later or use manual entry for now.',
      status: 503,
    }
  }

  if (status === 400) {
    return {
      message:
        'We could not read this menu clearly. Try a sharper photo, better lighting, or fall back to manual entry.',
      status: 400,
    }
  }

  return {
    message:
      error instanceof Error
        ? error.message
        : 'Unable to parse the menu photo right now.',
    status: 500,
  }
}

export async function POST(request: Request) {
  try {
    await getAdminRestaurantForRequest()

    const { openAiApiKey } = getServerEnv()

    if (!openAiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI is not configured.' },
        { status: 503 }
      )
    }

    const formData = await request.formData()
    const files = getUploadedFiles(formData)

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'Upload at least one PDF, JPG, PNG, or WebP menu file.' },
        { status: 400 }
      )
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Upload up to ${MAX_FILES} files at a time.` },
        { status: 400 }
      )
    }

    for (const file of files) {
      if (!isSupportedFile(file)) {
        return NextResponse.json(
          {
            error: `${file.name} is not supported. Upload PDF, JPG, PNG, or WebP files.`,
          },
          { status: 400 }
        )
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          {
            error: `${file.name} is too large. Keep each file under 15 MB.`,
          },
          { status: 400 }
        )
      }
    }

    const client = new OpenAI({
      apiKey: openAiApiKey,
    })

    const parsedResults = await Promise.all(
      files.map(async (file) => {
        const parsed = await parseMenuFile(client, file)

        return {
          fileName: file.name,
          parsed,
        }
      })
    )

    const allItems = dedupeParsedMenuItems(
      parsedResults.flatMap((result) =>
        normalizeParsedMenuItems(result.parsed?.items || [])
      )
    )
    const notes = parsedResults.flatMap((result) =>
      (result.parsed?.notes || []).map((note) => `${result.fileName}: ${note}`)
    )

    return NextResponse.json({
      items: allItems,
      notes,
      fileCount: files.length,
    })
  } catch (error) {
    const friendly = toFriendlyError(error)

    return NextResponse.json(
      { error: friendly.message },
      { status: friendly.status }
    )
  }
}
