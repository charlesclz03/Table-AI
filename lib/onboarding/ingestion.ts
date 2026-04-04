import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkFrontmatter from 'remark-frontmatter'
import toml from 'toml'
import type { OnboardingDocument } from '@/lib/onboarding/types'
import { ensureServerOnly } from '@/lib/server-only'

ensureServerOnly('lib/onboarding/ingestion')

const MAX_EXCERPT_LENGTH = 2400
const MAX_CHUNK_LENGTH = 1200

export interface IngestedOnboardingChunk {
  id: string
  content: string
}

export interface IngestedOnboardingDocument extends OnboardingDocument {
  normalizedContent: string
  frontmatter: Record<string, unknown>
  frontmatterFormat: string | null
  headings: string[]
  chunks: IngestedOnboardingChunk[]
  signalTerms: string[]
  summary: string
}

function normalizeText(content: string) {
  return content
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function extractNodeText(node: unknown): string {
  if (!node || typeof node !== 'object') {
    return ''
  }

  const candidate = node as {
    value?: unknown
    children?: unknown[]
  }

  const ownValue = typeof candidate.value === 'string' ? candidate.value : ''
  const childValue = Array.isArray(candidate.children)
    ? candidate.children.map(extractNodeText).join('')
    : ''

  return `${ownValue}${childValue}`.trim()
}

function extractHeadings(content: string) {
  const tree = unified()
    .use(remarkParse)
    .use(remarkFrontmatter, ['yaml', 'toml'])
    .parse(content) as {
    children?: Array<{
      type?: string
      children?: unknown[]
    }>
  }

  return (tree.children || [])
    .filter((node) => node.type === 'heading')
    .map((node) => extractNodeText(node))
    .filter(Boolean)
}

function createChunks(content: string) {
  const paragraphs = content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  const chunks: IngestedOnboardingChunk[] = []
  let buffer = ''

  for (const paragraph of paragraphs) {
    const candidate = buffer ? `${buffer}\n\n${paragraph}` : paragraph

    if (candidate.length > MAX_CHUNK_LENGTH && buffer) {
      chunks.push({
        id: `chunk-${chunks.length + 1}`,
        content: buffer,
      })
      buffer = paragraph
      continue
    }

    buffer = candidate
  }

  if (buffer) {
    chunks.push({
      id: `chunk-${chunks.length + 1}`,
      content: buffer,
    })
  }

  return chunks
}

function extractSignalTerms(content: string) {
  const matches = content.match(
    /\b(stripe|subscription|billing|pricing|supabase|postgres|postgresql|mysql|sqlite|brand color|primary color|monetization)\b/gi
  )

  return [...new Set((matches || []).map((match) => match.toLowerCase()))]
}

function buildSummary({
  frontmatter,
  headings,
  normalizedContent,
}: {
  frontmatter: Record<string, unknown>
  headings: string[]
  normalizedContent: string
}) {
  const frontmatterSummary =
    typeof frontmatter.summary === 'string'
      ? frontmatter.summary
      : typeof frontmatter.description === 'string'
        ? frontmatter.description
        : undefined

  if (frontmatterSummary) {
    return frontmatterSummary
  }

  const heading = headings[0]
  const firstParagraph = normalizedContent.split('\n\n')[0]
  return [heading, firstParagraph]
    .filter(Boolean)
    .join(' - ')
    .slice(0, MAX_EXCERPT_LENGTH)
}

export function ingestOnboardingDocuments(
  documents: OnboardingDocument[]
): IngestedOnboardingDocument[] {
  return documents
    .map((document) => {
      const parsed = matter(document.content, {
        engines: {
          toml: (value) => toml.parse(value),
        },
      })
      const normalizedContent = normalizeText(
        parsed.content || document.content
      )
      const excerpt =
        document.excerpt ||
        normalizedContent.slice(0, MAX_EXCERPT_LENGTH) ||
        document.content.slice(0, MAX_EXCERPT_LENGTH)

      const headings = extractHeadings(document.content)
      const frontmatter =
        parsed.data && typeof parsed.data === 'object' ? parsed.data : {}

      return {
        ...document,
        excerpt,
        normalizedContent,
        frontmatter,
        frontmatterFormat: parsed.language || null,
        headings,
        chunks: createChunks(normalizedContent || excerpt),
        signalTerms: extractSignalTerms(
          `${normalizedContent}\n${JSON.stringify(frontmatter)}`
        ),
        summary: buildSummary({
          frontmatter,
          headings,
          normalizedContent,
        }),
      }
    })
    .filter((document) => {
      return (
        Boolean(document.normalizedContent) ||
        Object.keys(document.frontmatter).length > 0
      )
    })
}
