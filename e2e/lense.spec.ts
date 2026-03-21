import { test, expect } from '@playwright/test'

test('lense input submits query, shows loading, and renders results', async ({ page }) => {
  // Mock the API endpoint to avoid real Claude invocation
  await page.route('**/api/lense', async (route) => {
    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 200))
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        components: [
          {
            type: 'summary',
            data: { title: 'Weekly Overview', text: 'You have 3 open todos and 2 recent daily logs.' },
          },
          {
            type: 'todo-list',
            data: {
              items: [
                { id: '1', text: 'Review PR for mustard', status: 'open' },
                { id: '2', text: 'Write architecture docs', status: 'done' },
              ],
            },
          },
        ],
      }),
    })
  })

  await page.goto('/')

  // Default empty state shows the mustard seed verse
  await expect(page.locator('blockquote')).toBeVisible()

  // Type a query
  const input = page.locator('input[type="text"]')
  await expect(input).toBeVisible()
  await input.fill("what's on my plate this week")
  await input.press('Enter')

  // Loading indicator should appear
  await expect(page.locator('[aria-label="Loading"]')).toBeVisible()

  // Results should render after loading
  await expect(page.locator('.lense-results')).toBeVisible({ timeout: 5000 })

  // At least one result component rendered
  const resultItems = page.locator('.lense-result-item')
  await expect(resultItems).toHaveCount(2)

  // Verify animation class is present
  await expect(resultItems.first()).toHaveCSS('animation-name', 'fadeSlideIn')

  // Input should be cleared
  await expect(input).toHaveValue('')

  // Empty state (verse) should be gone
  await expect(page.locator('blockquote')).not.toBeVisible()
})

test('lense input shows error on API failure', async ({ page }) => {
  await page.route('**/api/lense', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Claude invocation failed.' }),
    })
  })

  await page.goto('/')

  const input = page.locator('input[type="text"]')
  await input.fill('test query')
  await input.press('Enter')

  // Error message should be rendered in the DOM
  await expect(page.locator('.lense-error')).toBeVisible({ timeout: 5000 })
})
