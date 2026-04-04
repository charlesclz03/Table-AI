import { expect, test } from '@playwright/test'

test('renders the repaired starter home page', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle(/master-project/i)
  await expect(
    page.getByRole('heading', {
      name: /ship from a working baseline/i,
    })
  ).toBeVisible()
})

test('shows integration status on the dashboard', async ({ page }) => {
  await page.goto('/dashboard')

  await expect(
    page.getByRole('heading', {
      name: /integration status at a glance/i,
    })
  ).toBeVisible()
  await expect(page.getByText(/insforge/i)).toBeVisible()
  await expect(
    page.getByText(/runtime checks are fully configured/i)
  ).toBeVisible()
})

test('returns structured runtime status from the health endpoint', async ({
  request,
}) => {
  const response = await request.get('/api/health')
  const payload = await response.json()

  expect(response.ok()).toBeTruthy()
  expect(payload.status).toBe('ok')
  expect(Array.isArray(payload.integrations)).toBeTruthy()
  expect(payload.summary.total).toBeGreaterThan(0)
})
