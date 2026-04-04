/* @vitest-environment node */

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const projectRoot = process.cwd()

describe('monitoring companion scaffolds', () => {
  it('point both companion configs at the starter health surfaces', async () => {
    const upptimeConfig = await readFile(
      path.join(projectRoot, 'ops', 'upptime', '.upptimerc.yml'),
      'utf8'
    )
    const openstatusConfig = await readFile(
      path.join(projectRoot, 'ops', 'openstatus', 'monitors.json'),
      'utf8'
    )

    expect(upptimeConfig).toContain('/api/health')
    expect(upptimeConfig).toContain('/dashboard')
    expect(openstatusConfig).toContain('/api/health')
    expect(openstatusConfig).toContain('/dashboard')
  })
})
