'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { Download, Printer, Share2 } from 'lucide-react'
import { Button } from '@/components/atoms/Button'

interface QrStudioProps {
  restaurantId: string
  restaurantName: string
  logoUrl?: string | null
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function QrStudio({
  restaurantId,
  restaurantName,
  logoUrl,
}: QrStudioProps) {
  const [tableNumber, setTableNumber] = useState('1')
  const [status, setStatus] = useState('')

  const origin =
    typeof window === 'undefined'
      ? 'http://localhost:3000'
      : window.location.origin
  const chatUrl = useMemo(
    () =>
      `${origin}/chat/${encodeURIComponent(restaurantId)}?table=${encodeURIComponent(
        `T${tableNumber || '1'}`
      )}`,
    [origin, restaurantId, tableNumber]
  )

  const qrSvgUrl = useMemo(
    () =>
      `https://api.qrserver.com/v1/create-qr-code/?size=420x420&format=svg&data=${encodeURIComponent(
        chatUrl
      )}`,
    [chatUrl]
  )

  const qrPngUrl = useMemo(
    () =>
      `https://api.qrserver.com/v1/create-qr-code/?size=900x900&format=png&data=${encodeURIComponent(
        chatUrl
      )}`,
    [chatUrl]
  )

  async function downloadRemoteFile(url: string, filename: string) {
    setStatus('')

    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = objectUrl
      anchor.download = filename
      anchor.click()
      URL.revokeObjectURL(objectUrl)
      setStatus(`Downloaded ${filename}.`)
    } catch {
      setStatus('Unable to download the QR file right now.')
    }
  }

  function openPrintDialog(mode: 'pdf' | 'print') {
    const popup = window.open('', '_blank', 'width=900,height=1200')

    if (!popup) {
      setStatus('Your browser blocked the print window.')
      return
    }

    const heading = mode === 'pdf' ? 'Save as PDF' : 'Print QR poster'

    popup.document.write(`
      <html>
        <head>
          <title>${escapeHtml(restaurantName)} QR</title>
          <style>
            body {
              margin: 0;
              font-family: "Space Grotesk", system-ui, sans-serif;
              background: #0a0910;
              color: white;
            }
            .sheet {
              width: 210mm;
              min-height: 297mm;
              margin: 0 auto;
              padding: 20mm;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              background:
                radial-gradient(circle at top, rgba(245, 158, 11, 0.22), transparent 34%),
                linear-gradient(180deg, #100c08 0%, #05060a 100%);
            }
            .logo {
              width: 80px;
              height: 80px;
              border-radius: 24px;
              object-fit: cover;
              margin-bottom: 20px;
              border: 1px solid rgba(255,255,255,0.12);
            }
            .card {
              width: 100%;
              border-radius: 32px;
              padding: 28px;
              border: 1px solid rgba(255,255,255,0.12);
              background: rgba(255,255,255,0.06);
              backdrop-filter: blur(18px);
              text-align: center;
            }
            h1 {
              margin: 0;
              font-size: 32px;
            }
            p {
              color: rgba(255,255,255,0.75);
              line-height: 1.6;
            }
            .qr {
              width: 280px;
              height: 280px;
              margin: 20px auto;
              border-radius: 24px;
              background: white;
              padding: 16px;
              box-sizing: border-box;
            }
            .table {
              display: inline-block;
              margin-top: 16px;
              padding: 12px 18px;
              border-radius: 999px;
              background: rgba(245,158,11,0.16);
              border: 1px solid rgba(245,158,11,0.26);
              color: #fef3c7;
              letter-spacing: 0.2em;
              text-transform: uppercase;
            }
            .link {
              margin-top: 18px;
              font-size: 12px;
              word-break: break-all;
            }
            @media print {
              body {
                background: white;
              }
              .sheet {
                background: white;
                color: #111827;
              }
              p,
              .link {
                color: #374151;
              }
            }
          </style>
        </head>
        <body>
          <div class="sheet">
            ${logoUrl ? `<img class="logo" src="${escapeHtml(logoUrl)}" alt="" />` : ''}
            <div class="card">
              <p>${heading}</p>
              <h1>${escapeHtml(restaurantName)}</h1>
              <img class="qr" src="${escapeHtml(qrSvgUrl)}" alt="QR code" />
              <div class="table">Table T${escapeHtml(tableNumber || '1')}</div>
              <p>Scan to chat with our AI concierge</p>
              <p class="link">${escapeHtml(chatUrl)}</p>
            </div>
          </div>
          <script>
            window.onload = function () {
              window.print();
            };
          </script>
        </body>
      </html>
    `)
    popup.document.close()
    setStatus(
      mode === 'pdf'
        ? 'Print dialog opened. Choose "Save as PDF".'
        : 'Print dialog opened.'
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
      <section className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur">
        <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
          QR Controls
        </p>
        <h3 className="mt-2 text-xl font-semibold text-white">
          Configure the table poster
        </h3>
        <label className="mt-5 block text-sm text-white/70">
          Table number
          <input
            value={tableNumber}
            onChange={(event) =>
              setTableNumber(event.target.value.replace(/[^0-9]/g, ''))
            }
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-amber-300/40"
            placeholder="1"
          />
        </label>
        <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm text-white/75">
          <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
            Deep link
          </p>
          <p className="mt-3 break-all leading-6">{chatUrl}</p>
        </div>

        <div className="mt-5 grid gap-3">
          <Button
            variant="brand"
            onClick={() =>
              void downloadRemoteFile(
                qrPngUrl,
                `${restaurantName}-table-T${tableNumber || '1'}.png`
              )
            }
          >
            <Download className="mr-2 h-4 w-4" />
            Download PNG
          </Button>
          <Button variant="glass" onClick={() => openPrintDialog('pdf')}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button
            variant="glass"
            onClick={() =>
              window.open(
                `https://wa.me/?text=${encodeURIComponent(
                  `Scan our AI concierge for table T${tableNumber || '1'}: ${chatUrl}`
                )}`,
                '_blank',
                'noopener,noreferrer'
              )
            }
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share on WhatsApp
          </Button>
          <Button variant="glass" onClick={() => openPrintDialog('print')}>
            <Printer className="mr-2 h-4 w-4" />
            Print poster
          </Button>
        </div>

        {status ? (
          <p className="mt-4 rounded-full border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75">
            {status}
          </p>
        ) : null}
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/6 p-6 backdrop-blur">
        <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">
          A4 Preview
        </p>
        <div className="mt-4 rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_32%),linear-gradient(180deg,_#100c08_0%,_#05060a_100%)] p-6">
          <div className="mx-auto max-w-xl rounded-[32px] border border-white/10 bg-white/6 p-8 text-center backdrop-blur">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={`${restaurantName} logo`}
                width={84}
                height={84}
                className="mx-auto h-20 w-20 rounded-[24px] border border-white/10 object-cover"
                unoptimized
              />
            ) : null}

            <h3 className="mt-5 text-3xl font-semibold text-white">
              {restaurantName}
            </h3>
            <p className="mt-3 text-sm text-white/70">
              Scan to chat with our AI concierge
            </p>

            <div className="mx-auto mt-6 flex w-full max-w-sm items-center justify-center rounded-[28px] bg-white p-4">
              <Image
                src={qrSvgUrl}
                alt="QR code preview"
                width={320}
                height={320}
                className="h-auto w-full max-w-[280px]"
                unoptimized
              />
            </div>

            <div className="mt-6 inline-flex rounded-full border border-amber-300/20 bg-amber-300/10 px-5 py-3 text-sm uppercase tracking-[0.3em] text-amber-100">
              Table T{tableNumber || '1'}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
