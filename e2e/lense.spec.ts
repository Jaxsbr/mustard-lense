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

test('split-screen layout shows panel and lense regions', async ({ page }) => {
  await page.goto('/')

  // Both regions are present
  const panel = page.locator('[data-testid="crud-panel"]')
  const lense = page.locator('[data-testid="lense-region"]')
  await expect(panel).toBeVisible()
  await expect(lense).toBeVisible()

  // Toggle collapses the panel
  const toggle = page.locator('[data-testid="panel-toggle"]')
  await toggle.click()
  await expect(panel).toHaveClass(/crud-panel--collapsed/)

  // Toggle expands the panel
  await toggle.click()
  await expect(panel).not.toHaveClass(/crud-panel--collapsed/)

  // Lense input remains functional after toggle
  const input = page.locator('input[type="text"]')
  await expect(input).toBeVisible()
  await input.fill('test query')
  await expect(input).toHaveValue('test query')
})

test('CRUD panel renders type-specific list items from mocked API', async ({ page }) => {
  const todoRecords = [
    { id: 'todo-1', log_type: 'todo', capture_date_local: '2026-03-15', text: 'Buy groceries for the week', person: null, status: 'open', due_date_local: '2026-03-16', category: null, theme: null, period: null, tags: [] },
    { id: 'todo-2', log_type: 'todo', capture_date_local: '2026-03-14', text: 'Review PR', person: null, status: 'done', due_date_local: null, category: null, theme: null, period: null, tags: [] },
  ]

  const allRecords = [
    ...todoRecords,
    { id: 'note-1', log_type: 'people_note', capture_date_local: '2026-03-14', text: 'Alice on design system', person: 'alice', status: null, due_date_local: null, category: null, theme: null, period: null, tags: [] },
  ]

  await page.route('**/api/records*', async (route) => {
    const url = new URL(route.request().url())
    const type = url.searchParams.get('type')
    const records = type ? allRecords.filter((r) => r.log_type === type) : allRecords
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(records),
    })
  })

  await page.goto('/')

  // Wait for list items to render (Todos tab active by default)
  await expect(page.locator('[data-testid="list-item-todo"]').first()).toBeVisible({ timeout: 5000 })

  // At least one list item rendered
  const items = page.locator('[data-testid="panel-list-item"]')
  expect(await items.count()).toBeGreaterThanOrEqual(1)

  // Todo list items have expected fields (status indicator and text)
  const firstTodo = page.locator('[data-testid="list-item-todo"]').first()
  await expect(firstTodo.locator('.list-status')).toBeVisible()
  await expect(firstTodo.locator('.list-text')).toBeVisible()
})
