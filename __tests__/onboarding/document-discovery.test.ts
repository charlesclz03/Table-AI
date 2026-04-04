/* @vitest-environment node */

import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { discoverProjectDocuments } from '@/lib/onboarding/document-discovery'

const tempDirectories: string[] = []

async function createWorkspace() {
  const workspace = await mkdtemp(
    path.join(os.tmpdir(), 'master-project-docs-')
  )
  tempDirectories.push(workspace)
  return workspace
}

afterAll(async () => {
  for (const directory of tempDirectories) {
    await rm(directory, { recursive: true, force: true })
  }
})

describe('discoverProjectDocuments', () => {
  it('prefers user-authored docs and ignores excluded folders', async () => {
    const workspace = await createWorkspace()

    await mkdir(path.join(workspace, 'docs'), { recursive: true })
    await mkdir(path.join(workspace, 'docs', 'templates'), { recursive: true })
    await mkdir(path.join(workspace, '.agent'), { recursive: true })
    await mkdir(path.join(workspace, '.github'), { recursive: true })

    await writeFile(
      path.join(workspace, 'README.md'),
      '# Studio Atlas\nA planning workspace for creative teams.\nBrand color: Ocean Blue (#0ea5e9).'
    )
    await writeFile(
      path.join(workspace, 'docs', 'product-brief.md'),
      'We will use Supabase for the database and Stripe for subscriptions.'
    )
    await writeFile(
      path.join(workspace, '.agent', 'notes.md'),
      '# Hidden note\nThis should never be discovered.'
    )
    await writeFile(
      path.join(workspace, '.github', 'PULL_REQUEST_TEMPLATE.md'),
      '# Pull Request\nThis should never be used for onboarding.'
    )
    await writeFile(
      path.join(workspace, 'docs', 'templates', 'FEATURES.md'),
      '# Template\nThis is a boilerplate template.'
    )

    const documents = await discoverProjectDocuments(workspace)

    expect(documents.map((document) => document.path)).toEqual([
      'README.md',
      'docs/product-brief.md',
    ])
  })

  it('filters out boilerplate-only content', async () => {
    const workspace = await createWorkspace()

    await writeFile(
      path.join(workspace, 'README.md'),
      '# master-project\nThis boilerplate turns into a template.'
    )

    const documents = await discoverProjectDocuments(workspace)

    expect(documents).toEqual([])
  })

  it('keeps root planning docs but skips hidden markdown files', async () => {
    const workspace = await createWorkspace()

    await writeFile(
      path.join(workspace, 'project-brief.md'),
      'Name: Atlas HQ\nBilling: subscriptions'
    )
    await writeFile(
      path.join(workspace, '.notes.md'),
      'This hidden file should not be included.'
    )

    const documents = await discoverProjectDocuments(workspace)

    expect(documents.map((document) => document.path)).toEqual([
      'project-brief.md',
    ])
  })
})
