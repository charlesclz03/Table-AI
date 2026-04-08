import { NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { RequestGuardError } from '@/lib/security/request-guards'
import { guardApiRoute } from '@/lib/security/api-protection'

export const runtime = 'nodejs'

interface QrRouteProps {
  params: Promise<{
    restaurantId: string
  }>
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function normalizeTableNumber(value: string | null) {
  const digits = value?.replace(/\D/g, '') ?? ''

  return digits.length > 0 ? digits : '1'
}

function normalizeSize(value: string | null) {
  const parsed = Number.parseInt(value ?? '', 10)

  if (!Number.isFinite(parsed)) {
    return 512
  }

  return Math.min(Math.max(parsed, 256), 1024)
}

export async function GET(request: Request, { params }: QrRouteProps) {
  try {
    const { restaurantId } = await params

    if (!UUID_PATTERN.test(restaurantId)) {
      return NextResponse.json(
        { error: 'Restaurant not found.' },
        { status: 404 }
      )
    }

    const protection = guardApiRoute(request, {
      bucket: 'qr',
      limit: 120,
      rateLimitSource: 'api.qr',
      requireTrustedOrigin: false,
      restaurantId,
      windowMs: 5 * 60 * 1000,
    })

    const requestUrl = new URL(request.url)
    const tableNumber = normalizeTableNumber(
      requestUrl.searchParams.get('table') ||
        requestUrl.searchParams.get('tableNumber')
    )
    const size = normalizeSize(requestUrl.searchParams.get('size'))
    const chatUrl = `${requestUrl.origin}/chat/${encodeURIComponent(
      restaurantId
    )}?table=${encodeURIComponent(`T${tableNumber}`)}`

    const qrCode = await QRCode.toBuffer(chatUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      type: 'png',
      width: size,
    })

    return new NextResponse(new Uint8Array(qrCode), {
      headers: {
        ...protection.headers,
        'Cache-Control': 'public, max-age=3600',
        'Content-Disposition': `inline; filename="restaurant-${restaurantId}-table-T${tableNumber}.png"`,
        'Content-Type': 'image/png',
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to generate the QR code.',
      },
      {
        status: error instanceof RequestGuardError ? error.status : 500,
      }
    )
  }
}
