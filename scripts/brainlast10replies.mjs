#!/usr/bin/env node

import fs from 'node:fs/promises'
import process from 'node:process'
import path from 'node:path'

const DATA_MARKER = 'BRAINLAST10REPLIES_DATA'
const DEFAULT_OUTPUT = 'brainlast10replies.MD'
const MAX_ENTRIES = 10

function parseArgs(argv) {
  const args = {
    output: DEFAULT_OUTPUT,
    messageFile: null,
    entriesFile: null,
    speaker: 'Codex',
  }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]

    if (arg === '--output') {
      args.output = argv[i + 1]
      i += 1
      continue
    }

    if (arg === '--message-file') {
      args.messageFile = argv[i + 1]
      i += 1
      continue
    }

    if (arg === '--entries-file') {
      args.entriesFile = argv[i + 1]
      i += 1
      continue
    }

    if (arg === '--speaker') {
      args.speaker = argv[i + 1]
      i += 1
      continue
    }
  }

  return args
}

async function readMessage(messageFile) {
  if (messageFile) {
    return (await fs.readFile(messageFile, 'utf8')).trim()
  }

  if (process.stdin.isTTY) {
    return ''
  }

  const chunks = []
  for await (const chunk of process.stdin) {
    chunks.push(chunk)
  }

  return Buffer.concat(chunks).toString('utf8').trim()
}

async function readEntries(entriesFile) {
  if (!entriesFile) {
    return null
  }

  const raw = await fs.readFile(entriesFile, 'utf8')
  const parsed = JSON.parse(raw)

  if (!Array.isArray(parsed)) {
    throw new Error('Entries file must contain a JSON array.')
  }

  return parsed
    .map((entry) => ({
      timestamp: entry.timestamp || new Date().toISOString(),
      speaker: entry.speaker || 'Codex',
      content: typeof entry.content === 'string' ? entry.content.trim() : '',
    }))
    .filter((entry) => entry.content)
}

function extractEntries(content) {
  const pattern = new RegExp(`<!--\\s*${DATA_MARKER}\\n([\\s\\S]*?)\\n-->`)
  const match = content.match(pattern)

  if (!match) {
    return []
  }

  try {
    const parsed = JSON.parse(match[1])
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.map((entry) => ({
      timestamp: entry.timestamp,
      speaker: entry.speaker || 'Codex',
      content: entry.content,
    }))
  } catch {
    return []
  }
}

function renderMarkdown(entries) {
  const updatedAt = new Date().toISOString()
  const metadata = JSON.stringify(entries, null, 2)
  const sections = entries.map((entry, index) => {
    const ordinal = index + 1
    return [
      `## Turn ${ordinal}`,
      `**Speaker:** ${entry.speaker}`,
      `**Timestamp:** ${entry.timestamp}`,
      '',
      `${entry.speaker}:`,
      '',
      `${entry.content}`,
    ].join('\n')
  })

  return [
    '# Brain Last 10 Replies',
    '',
    `Updated: ${updatedAt}`,
    '',
    `<!-- ${DATA_MARKER}`,
    metadata,
    '-->',
    '',
    ...sections.flatMap((section, index) =>
      index === sections.length - 1 ? [section] : [section, '', '---', '']
    ),
    '',
  ].join('\n')
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const providedEntries = await readEntries(args.entriesFile)
  const message = providedEntries ? '' : await readMessage(args.messageFile)

  const outputPath = path.resolve(process.cwd(), args.output)

  let existingContent = ''
  try {
    existingContent = await fs.readFile(outputPath, 'utf8')
  } catch (error) {
    if (error && error.code !== 'ENOENT') {
      throw error
    }
  }

  const existingEntries = extractEntries(existingContent)
  const newEntries = providedEntries && providedEntries.length > 0
    ? providedEntries
    : message
      ? [{
          timestamp: new Date().toISOString(),
          speaker: args.speaker || 'Codex',
          content: message,
        }]
      : []

  if (newEntries.length === 0) {
    console.error('No transcript content provided. Use --message-file <path>, pipe text via stdin, or pass --entries-file <path>.')
    process.exit(1)
  }

  const nextEntries = [...newEntries, ...existingEntries].slice(0, MAX_ENTRIES)

  await fs.writeFile(outputPath, renderMarkdown(nextEntries), 'utf8')
  console.log(`Updated ${outputPath} with ${nextEntries.length} entr${nextEntries.length === 1 ? 'y' : 'ies'}.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
