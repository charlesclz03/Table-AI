import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { chromium } from '@playwright/test'

const CDP_URL = process.env.CDP_URL ?? 'http://127.0.0.1:9222'
const BASE_URL = process.env.BASE_URL ?? 'http://127.0.0.1:3000'
const OUTPUT_PATH = process.env.OUTPUT_PATH

function nowIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

function result(status, name, details = undefined) {
  return { status, name, details }
}

async function safeGoto(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 })
  await page
    .waitForLoadState('networkidle', { timeout: 10_000 })
    .catch(() => {})
}

async function checkHeading(page, pathName, headingRegex) {
  await safeGoto(page, `${BASE_URL}${pathName}`)
  const heading = page.getByRole('heading', { name: headingRegex })
  const visible = await heading
    .waitFor({ state: 'visible', timeout: 15_000 })
    .then(() => true)
    .catch(() => false)

  return visible
    ? result('PASS', `heading ${pathName}`, String(headingRegex))
    : result('FAIL', `heading ${pathName}`, `Missing heading ${headingRegex}`)
}

async function checkHealth(page) {
  const response = await page.request.get(`${BASE_URL}/api/health`)
  if (!response.ok()) {
    return result('FAIL', 'api health', response.status())
  }

  const payload = await response.json()
  return payload?.status === 'ok'
    ? result('PASS', 'api health', payload)
    : result('FAIL', 'api health', payload)
}

async function checkOnboardingFallback(page) {
  const response = await page.request.post(
    `${BASE_URL}/api/onboarding/suggestions`,
    {
      data: {
        documents: [
          {
            path: 'README.md',
            content:
              '# Studio Atlas\nA planning workspace for creative teams.\nUse Supabase and Stripe.',
          },
        ],
      },
    }
  )

  if (!response.ok()) {
    return result('FAIL', 'onboarding suggestions', response.status())
  }

  const payload = await response.json()
  const hasSuggestions = Array.isArray(payload.suggestions)
  return hasSuggestions
    ? result('PASS', 'onboarding suggestions', {
        provider: payload.provider,
        count: payload.suggestions.length,
      })
    : result('FAIL', 'onboarding suggestions', payload)
}

async function check404(page) {
  await safeGoto(page, `${BASE_URL}/missing-route`)
  const heading = page.getByRole('heading', { name: /page not found/i })
  const visible = await heading
    .waitFor({ state: 'visible', timeout: 15_000 })
    .then(() => true)
    .catch(() => false)

  return visible
    ? result('PASS', '404 page')
    : result('FAIL', '404 page', 'Missing 404 heading')
}

async function main() {
  const results = []
  const meta = { date: nowIsoDate(), baseUrl: BASE_URL, cdpUrl: CDP_URL }

  let browser
  try {
    browser = await chromium.connectOverCDP(CDP_URL)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(
      '[prod-launch-audit] Failed to connect to Chrome CDP:',
      message
    )
    console.error(
      '[prod-launch-audit] Start Chrome with: chrome.exe --remote-debugging-port=9222 --user-data-dir=<path>'
    )
    process.exit(2)
  }

  const context = browser.contexts()[0] ?? (await browser.newContext())
  const page = context.pages()[0] ?? (await context.newPage())

  results.push(await checkHeading(page, '/', /ship from a working baseline/i))
  results.push(
    await checkHeading(page, '/dashboard', /integration status at a glance/i)
  )
  results.push(await checkHealth(page))
  results.push(await checkOnboardingFallback(page))
  results.push(await check404(page))

  const summary = {
    meta,
    counts: {
      pass: results.filter((item) => item.status === 'PASS').length,
      fail: results.filter((item) => item.status === 'FAIL').length,
    },
    results,
  }

  const json = JSON.stringify(summary, null, 2)
  console.log(json)

  const outputPath =
    OUTPUT_PATH ??
    path.join(process.cwd(), 'brain', `PROD_LAUNCH_AUDIT_${nowIsoDate()}.json`)
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, json, 'utf8')
  console.error(`[prod-launch-audit] Wrote: ${outputPath}`)

  await browser.close()

  if (summary.counts.fail > 0) process.exit(1)
}

main().catch((error) => {
  const message =
    error instanceof Error ? error.stack || error.message : String(error)
  console.error('[prod-launch-audit] Unexpected error:', message)
  process.exit(1)
})
