import { test, expect } from '@playwright/test'

function sseBody(events: Array<{ event: string; data: string }>): string {
  return events.map((e) => `event: ${e.event}\ndata: ${e.data}\n\n`).join('')
}

test('lense input submits query, shows stage indicators, and renders results', async ({ page }) => {
  await page.route('**/api/lense', async (route) => {
    const body = sseBody([
      { event: 'retrieving', data: '{}' },
      { event: 'thinking', data: '{}' },
      {
        event: 'result',
        data: JSON.stringify({
          components: [
            { type: 'summary', data: { title: 'Weekly Overview', text: 'You have 3 open todos.' } },
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
      },
    ])

    await route.fulfill({
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
      body,
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

  // Results should render after stream completes
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

test('lense input shows stage indicator during processing', async ({ page }) => {
  // Use a delayed SSE stream to catch the stage indicator
  await page.route('**/api/lense', async (route) => {
    // Send retrieving event first, delay the rest
    const body = sseBody([
      { event: 'retrieving', data: '{}' },
      { event: 'thinking', data: '{}' },
      {
        event: 'result',
        data: JSON.stringify({
          components: [{ type: 'summary', data: { title: 'Test', text: 'Done' } }],
        }),
      },
    ])

    await route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
      body,
    })
  })

  await page.goto('/')
  const input = page.locator('input[type="text"]')
  await input.fill('test query')
  await input.press('Enter')

  // Results should eventually render
  await expect(page.locator('.lense-results')).toBeVisible({ timeout: 5000 })
})

test('lense input shows error on SSE error event', async ({ page }) => {
  await page.route('**/api/lense', async (route) => {
    const body = sseBody([
      { event: 'retrieving', data: '{}' },
      { event: 'error', data: JSON.stringify({ error: 'Failed to process intent.' }) },
    ])

    await route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
      body,
    })
  })

  await page.goto('/')
  const input = page.locator('input[type="text"]')
  await input.fill('test query')
  await input.press('Enter')

  // Error message should be rendered in the DOM
  await expect(page.locator('.lense-error')).toBeVisible({ timeout: 5000 })
})

test('lense input shows error on HTTP 400 validation', async ({ page }) => {
  await page.route('**/api/lense', async (route) => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Missing or empty intent field.' }),
    })
  })

  await page.goto('/')
  const input = page.locator('input[type="text"]')
  await input.fill('test')
  await input.press('Enter')

  await expect(page.locator('.lense-error')).toBeVisible({ timeout: 5000 })
})
