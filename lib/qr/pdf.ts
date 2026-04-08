import QRCode from 'qrcode'

const A4_PAGE_WIDTH = 595
const A4_PAGE_HEIGHT = 842

function escapePdfText(value: string) {
  return value.replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)')
}

function wrapPdfText(value: string, maxLineLength: number) {
  const words = value.trim().split(/\s+/).filter(Boolean)

  if (words.length === 0) {
    return []
  }

  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word

    if (candidate.length > maxLineLength && currentLine) {
      lines.push(currentLine)
      currentLine = word
      continue
    }

    currentLine = candidate
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

function buildContentStream(options: {
  chatUrl: string
  restaurantName: string
  tableNumber: string
}) {
  const qr = QRCode.create(options.chatUrl, {
    errorCorrectionLevel: 'H',
  })
  const moduleCount = qr.modules.size
  const qrSize = 210
  const moduleSize = qrSize / moduleCount
  const qrLeft = 56
  const qrBottom = 468
  const qrPadding = 18
  const qrFrameSize = qrSize + qrPadding * 2
  const title = escapePdfText(options.restaurantName)
  const tableLabel = escapePdfText(`Table T${options.tableNumber}`)
  const instructions = wrapPdfText(
    'Scan to chat with our AI concierge',
    40
  )
  const urlLines = wrapPdfText(options.chatUrl, 48)

  const operations = [
    '1 1 1 rg',
    `40 40 ${A4_PAGE_WIDTH - 80} ${A4_PAGE_HEIGHT - 80} re f`,
    '0.08 0.06 0.04 rg',
    `40 40 ${A4_PAGE_WIDTH - 80} ${A4_PAGE_HEIGHT - 80} re S`,
    '0 0 0 rg',
    'BT',
    '/F2 28 Tf',
    `310 748 Td (${title}) Tj`,
    'ET',
    'BT',
    '/F1 13 Tf',
    '0.25 0.25 0.25 rg',
    `310 716 Td (${escapePdfText(
      'Scan to chat with our AI concierge'
    )}) Tj`,
    'ET',
    'BT',
    '/F1 11 Tf',
    '0.45 0.45 0.45 rg',
    `310 682 Td (${tableLabel}) Tj`,
    'ET',
    '1 1 1 rg',
    `${qrLeft} ${qrBottom} ${qrFrameSize} ${qrFrameSize} re f`,
    '0 0 0 RG',
    `${qrLeft} ${qrBottom} ${qrFrameSize} ${qrFrameSize} re S`,
    '0 0 0 rg',
  ]

  qr.modules.data.forEach((isDark, index) => {
    if (!isDark) {
      return
    }

    const row = Math.floor(index / moduleCount)
    const column = index % moduleCount
    const x = qrLeft + qrPadding + column * moduleSize
    const y =
      qrBottom + qrPadding + (moduleCount - row - 1) * moduleSize

    operations.push(
      `${x.toFixed(2)} ${y.toFixed(2)} ${moduleSize.toFixed(2)} ${moduleSize.toFixed(2)} re f`
    )
  })

  let instructionY = 620

  for (const line of instructions) {
    operations.push(
      'BT',
      '/F1 12 Tf',
      '0.18 0.18 0.18 rg',
      `310 ${instructionY} Td (${escapePdfText(line)}) Tj`,
      'ET'
    )
    instructionY -= 18
  }

  operations.push(
    'BT',
    '/F1 10 Tf',
    '0.4 0.4 0.4 rg',
    `310 ${instructionY - 8} Td (${escapePdfText(
      'Open this table link if the QR scanner is unavailable:'
    )}) Tj`,
    'ET'
  )

  let urlY = instructionY - 30

  for (const line of urlLines) {
    operations.push(
      'BT',
      '/F1 9 Tf',
      '0.1 0.1 0.1 rg',
      `310 ${urlY} Td (${escapePdfText(line)}) Tj`,
      'ET'
    )
    urlY -= 14
  }

  return operations.join('\n')
}

export function createQrPosterPdf(options: {
  chatUrl: string
  restaurantName: string
  tableNumber: string
}) {
  const contentStream = buildContentStream(options)
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    `3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4_PAGE_WIDTH} ${A4_PAGE_HEIGHT}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>
endobj
`,
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n',
    `6 0 obj
<< /Length ${Buffer.byteLength(contentStream, 'utf8')} >>
stream
${contentStream}
endstream
endobj
`,
  ]

  let pdf = '%PDF-1.4\n'
  const offsets = [0]

  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'))
    pdf += object
  }

  const xrefOffset = Buffer.byteLength(pdf, 'utf8')
  pdf += `xref
0 ${objects.length + 1}
0000000000 65535 f 
`

  for (const offset of offsets.slice(1)) {
    pdf += `${offset.toString().padStart(10, '0')} 00000 n \n`
  }

  pdf += `trailer
<< /Size ${objects.length + 1} /Root 1 0 R >>
startxref
${xrefOffset}
%%EOF`

  return Buffer.from(pdf, 'utf8')
}
