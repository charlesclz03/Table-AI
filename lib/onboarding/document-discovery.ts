import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { OnboardingDocument } from '@/lib/onboarding/types'
import { ensureServerOnly } from '@/lib/server-only'

ensureServerOnly('lib/onboarding/document-discovery')

const EXCLUDED_DIRECTORIES = new Set([
  '.agent',
  '.git',
  '.github',
  '.next',
  'audit_reports',
  'coverage',
  'node_modules',
  'ops',
  'playwright-report',
  'test-results',
])

const EXCLUDED_FILES = new Set([
  'AGENTS.md',
  'BOILERPLATE_SETUP.md',
  'prompt-plan.md',
])

const TEXT_EXTENSIONS = new Set(['.md', '.mdx', '.txt'])
const MAX_DOCUMENTS = 12
const MAX_EXCERPT_LENGTH = 2400

function normalizeText(content: string) {
  return content
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function normalizePath(filePath: string) {
  return filePath.replace(/\\/g, '/')
}

function shouldIncludeDocumentPath(relativePath: string) {
  const normalizedPath = normalizePath(relativePath)
  const segments = normalizedPath.split('/')
  const [firstSegment] = segments

  if (!firstSegment) {
    return false
  }

  if (segments.some((segment) => segment.startsWith('.'))) {
    return false
  }

  if (segments.length === 1) {
    return true
  }

  if (normalizedPath.startsWith('docs/')) {
    if (
      /^(docs\/(archive|integrations|reference|runbooks|templates)\/)/i.test(
        normalizedPath
      )
    ) {
      return false
    }

    if (
      /^docs\/(README|next-session-handoff|next-steps|progress-log)\.md$/i.test(
        normalizedPath
      )
    ) {
      return false
    }

    return /(^docs\/((product|vision|roadmap|design|research|requirements?|briefs?|notes?|plans?|proposals?|specs?)(\/|[-.])))|(^docs\/.+(brief|spec|plan|proposal|requirement|research|vision|roadmap|design).*\.(md|mdx|txt)$)/i.test(
      normalizedPath
    )
  }

  return /^(briefs?|notes?|plans?|proposals?|requirements?|research|specs?)$/i.test(
    firstSegment
  )
}

function getPriority(relativePath: string) {
  const normalizedPath = normalizePath(relativePath).toLowerCase()

  if (/^readme(\.[a-z0-9]+)?$/.test(normalizedPath)) {
    return 100
  }

  if (!normalizedPath.includes('/')) {
    return 90
  }

  if (normalizedPath.startsWith('docs/')) {
    return normalizedPath.startsWith('docs/templates/') ? 0 : 80
  }

  if (/(brief|spec|notes|plan|proposal|requirements)/.test(normalizedPath)) {
    return 70
  }

  return 50
}

function isBoilerplateContent(content: string) {
  return /(master-project|boilerplate|template|flowforge)/i.test(content)
}

async function walkDirectory(
  rootDir: string,
  currentDir: string
): Promise<string[]> {
  const entries = await fs.readdir(currentDir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const absolutePath = path.join(currentDir, entry.name)
    const relativePath = normalizePath(path.relative(rootDir, absolutePath))

    if (entry.isDirectory()) {
      if (EXCLUDED_DIRECTORIES.has(entry.name)) {
        continue
      }

      files.push(...(await walkDirectory(rootDir, absolutePath)))
      continue
    }

    if (!TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      continue
    }

    if (
      EXCLUDED_FILES.has(entry.name) ||
      relativePath.startsWith('docs/templates/') ||
      !shouldIncludeDocumentPath(relativePath)
    ) {
      continue
    }

    files.push(absolutePath)
  }

  return files
}

export async function discoverProjectDocuments(
  rootDir = process.cwd()
): Promise<OnboardingDocument[]> {
  const candidates = await walkDirectory(rootDir, rootDir)
  const ranked = await Promise.all(
    candidates.map(async (absolutePath) => {
      const relativePath = normalizePath(path.relative(rootDir, absolutePath))
      const raw = await fs.readFile(absolutePath, 'utf8')
      const content = normalizeText(raw)

      if (!content || isBoilerplateContent(content)) {
        return null
      }

      return {
        path: relativePath,
        content,
        excerpt: content.slice(0, MAX_EXCERPT_LENGTH),
        priority: getPriority(relativePath),
      }
    })
  )

  return ranked
    .filter((entry): entry is NonNullable<(typeof ranked)[number]> =>
      Boolean(entry)
    )
    .sort((a, b) => b.priority - a.priority || a.path.localeCompare(b.path))
    .slice(0, MAX_DOCUMENTS)
    .map(({ path: documentPath, content, excerpt }) => ({
      path: documentPath,
      content,
      excerpt,
    }))
}
