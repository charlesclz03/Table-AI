import { expect, test } from '@playwright/test'

test('renders the Gustia landing page', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle(/gustia/i)
  await expect(
    page.getByRole('heading', {
      name: /your restaurant's ai concierge/i,
    })
  ).toBeVisible()
})

test('redirects unauthenticated admin traffic to owner login', async ({
  page,
}) => {
  await page.goto('/admin')

  await expect(page).toHaveURL(/\/admin\/login/)
  await expect(
    page.getByRole('heading', { name: /owner login/i })
  ).toBeVisible()
})

test('loads the guest chat demo flow', async ({ page }) => {
  await page.goto('/chat/demo')

  await expect(page.getByText(/gustia concierge/i)).toBeVisible()
  await expect(page.getByText(/table t1/i)).toBeVisible()
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
