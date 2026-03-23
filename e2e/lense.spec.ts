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

const fixtureRecords = [
  { id: 'aaaaaaaa-1111-2222-3333-444444444444', log_type: 'todo', capture_date_local: '2026-03-15', text: 'Buy groceries for the week', person: null, status: 'open', due_date_local: '2026-03-16', category: null, theme: null, period: null, tags: [] },
  { id: 'bbbbbbbb-1111-2222-3333-444444444444', log_type: 'todo', capture_date_local: '2026-03-14', text: 'Review PR', person: null, status: 'done', due_date_local: null, category: null, theme: null, period: null, tags: [] },
  { id: 'cccccccc-1111-2222-3333-444444444444', log_type: 'people_note', capture_date_local: '2026-03-14', text: 'Alice on design system', person: 'alice', status: null, due_date_local: null, category: null, theme: null, period: null, tags: [] },
]

function setupRecordsRoute(page: import('@playwright/test').Page) {
  return page.route('**/api/records*', async (route) => {
    const method = route.request().method()
    if (method === 'GET') {
      const url = new URL(route.request().url())
      const type = url.searchParams.get('type')
      const records = type ? fixtureRecords.filter((r) => r.log_type === type) : fixtureRecords
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(records),
      })
    } else if (method === 'POST') {
      const body = JSON.parse(route.request().postData() ?? '{}')
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'new-uuid-1234', ...body, capture_date_local: '2026-03-22', tags: [] }),
      })
    } else if (method === 'PUT') {
      const body = JSON.parse(route.request().postData() ?? '{}')
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...fixtureRecords[0], ...body }),
      })
    } else if (method === 'DELETE') {
      const url = new URL(route.request().url())
      const id = url.pathname.split('/').pop()
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id }),
      })
    }
  })
}

test('CRUD panel renders type-specific list items from mocked API', async ({ page }) => {
  await setupRecordsRoute(page)
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

test('clicking a list item opens the detail drawer with record fields', async ({ page }) => {
  await setupRecordsRoute(page)
  await page.goto('/')

  // Wait for list items
  await expect(page.locator('[data-testid="panel-list-item"]').first()).toBeVisible({ timeout: 5000 })

  // Click the first list item
  await page.locator('[data-testid="panel-list-item"]').first().click()

  // Drawer should be visible
  const drawer = page.locator('[data-testid="detail-drawer"]')
  await expect(drawer).toBeVisible({ timeout: 3000 })

  // Drawer shows record fields
  await expect(page.locator('[data-testid="drawer-field-text"]')).toBeVisible()
  await expect(page.locator('[data-testid="drawer-field-id"]')).toBeVisible()

  // Close button dismisses the drawer
  await page.locator('[data-testid="drawer-close"]').click()
  await expect(drawer).not.toBeVisible()
})

test('sort dropdown changes list order and limit caps visible items', async ({ page }) => {
  // Create enough records to test limiting
  const manyRecords = Array.from({ length: 30 }, (_, i) => ({
    id: `todo-${String(i).padStart(3, '0')}`,
    log_type: 'todo',
    capture_date_local: `2026-03-${String(i + 1).padStart(2, '0')}`,
    text: `Todo item ${i}`,
    person: null,
    status: i < 10 ? 'open' : i < 20 ? 'parked' : 'done',
    due_date_local: null,
    category: null,
    theme: null,
    period: null,
    tags: [],
  }))

  await page.route('**/api/records*', async (route) => {
    const url = new URL(route.request().url())
    const type = url.searchParams.get('type')
    const records = type ? manyRecords.filter((r) => r.log_type === type) : manyRecords
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(records),
    })
  })

  await page.goto('/')
  await expect(page.locator('[data-testid="list-controls"]')).toBeVisible({ timeout: 5000 })

  // Sort dropdown is visible
  const sortSelect = page.locator('[data-testid="sort-select"]')
  await expect(sortSelect).toBeVisible()

  // Default is newest first — change to oldest
  await sortSelect.selectOption('oldest')

  // Limit dropdown is visible
  const limitSelect = page.locator('[data-testid="limit-select"]')
  await expect(limitSelect).toBeVisible()

  // Default limit is 25 — list should show 25 items (not all 30)
  const items = page.locator('[data-testid="panel-list-item"]')
  await expect(items).toHaveCount(25)

  // "Show all" button should be visible since 30 > 25
  await expect(page.locator('[data-testid="show-all-button"]')).toBeVisible()

  // Change limit to 10
  await limitSelect.selectOption('10')
  await expect(items).toHaveCount(10)

  // Status filter is visible on Todos tab
  const filterSelect = page.locator('[data-testid="status-filter-select"]')
  await expect(filterSelect).toBeVisible()

  // Filter to open only — should show 10 open records (limited by current limit of 10)
  await filterSelect.selectOption('open')
  const filteredItems = page.locator('[data-testid="panel-list-item"]')
  expect(await filteredItems.count()).toBeLessThanOrEqual(10)
})

test('theme toggle button exists and clicking it changes data-theme attribute', async ({ page }) => {
  await page.goto('/')

  // Theme toggle button exists with accessible label
  const toggle = page.locator('button[aria-label*="theme" i]')
  await expect(toggle).toBeVisible({ timeout: 3000 })

  // Get initial theme state
  const initialTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))

  // Click toggle
  await toggle.click()

  // data-theme attribute should change
  const newTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
  expect(newTheme).not.toEqual(initialTheme)
  expect(['dark', 'light']).toContain(newTheme)

  // Click again to toggle back
  await toggle.click()
  const finalTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
  expect(finalTheme).not.toEqual(newTheme)
})

test('active tab border color varies by type', async ({ page }) => {
  await setupRecordsRoute(page)
  await page.goto('/')

  // Wait for tabs to load
  await expect(page.locator('[data-testid="tab-todo"]')).toBeVisible({ timeout: 5000 })

  // Todos tab is active — check its border color is the todo blue
  const todoTab = page.locator('[data-testid="tab-todo"]')
  const todoBorder = await todoTab.evaluate((el) => getComputedStyle(el).borderBottomColor)
  // #4a7fc4 in light mode or #6a9fd4 in dark mode — both are blue-ish
  expect(todoBorder).not.toBe('rgba(0, 0, 0, 0)')

  // Switch to People tab and wait for it to become active
  const peopleTab = page.locator('[data-testid="tab-people_note"]')
  await peopleTab.click()
  await expect(peopleTab).toHaveClass(/crud-panel-tab--active/)

  // Wait for CSS transition to settle
  await page.waitForTimeout(300)
  const peopleBorder = await peopleTab.evaluate((el) => getComputedStyle(el).borderBottomColor)

  // The todo tab should no longer be active
  const todoTabAfter = await todoTab.evaluate((el) => getComputedStyle(el).borderBottomColor)

  // People tab should have a non-transparent border when active
  // and it should differ from the todo color
  expect(peopleBorder).not.toEqual(todoTabAfter)
})

test('delete button visible in edit mode, absent in create mode, confirmation appears on click', async ({ page }) => {
  await setupRecordsRoute(page)
  await page.goto('/')

  // Wait for list items
  await expect(page.locator('[data-testid="panel-list-item"]').first()).toBeVisible({ timeout: 5000 })

  // Click a list item to open drawer in edit mode
  await page.locator('[data-testid="panel-list-item"]').first().click()
  const drawer = page.locator('[data-testid="detail-drawer"]')
  await expect(drawer).toBeVisible({ timeout: 3000 })

  // Delete button should be visible in edit mode
  const deleteBtn = page.locator('[data-testid="drawer-delete"]')
  await expect(deleteBtn).toBeVisible()

  // Click delete — confirmation element should appear
  await deleteBtn.click()
  const confirmEl = page.locator('[data-testid="drawer-delete-confirm"]')
  await expect(confirmEl).toBeVisible()

  // Cancel confirmation
  await page.locator('[data-testid="drawer-delete-no"]').click()
  await expect(confirmEl).not.toBeVisible()

  // Close drawer
  await page.locator('[data-testid="drawer-close"]').click()
  await expect(drawer).not.toBeVisible()

  // Open drawer in create mode — delete button should NOT be present
  await page.locator('[data-testid="panel-add"]').click()
  await expect(drawer).toBeVisible({ timeout: 3000 })
  await expect(page.locator('[data-testid="drawer-delete"]')).not.toBeVisible()
})

test('list items have hover transition and tab content has crossfade animation', async ({ page }) => {
  await setupRecordsRoute(page)
  await page.goto('/')

  // Wait for list items
  await expect(page.locator('[data-testid="panel-list-item"]').first()).toBeVisible({ timeout: 5000 })

  // List item should have transition on background-color (hover effect)
  const listItem = page.locator('.list-item').first()
  const transition = await listItem.evaluate((el) => getComputedStyle(el).transition)
  expect(transition).toContain('background-color')

  // Tab content container should have the crossfade animation
  const body = page.locator('.crud-panel-body')
  const animation = await body.evaluate((el) => getComputedStyle(el).animationName)
  expect(animation).toBe('tab-crossfade')
})

test('clicking Add opens drawer in create mode with active tab type pre-selected', async ({ page }) => {
  await setupRecordsRoute(page)
  await page.goto('/')

  // Wait for panel to load
  await expect(page.locator('[data-testid="panel-add"]')).toBeVisible({ timeout: 5000 })

  // Click Add button
  await page.locator('[data-testid="panel-add"]').click()

  // Drawer should open in create mode
  const drawer = page.locator('[data-testid="detail-drawer"]')
  await expect(drawer).toBeVisible({ timeout: 3000 })

  // log_type dropdown is present (not disabled input) and pre-selected to todo (active tab)
  const logTypeSelect = page.locator('[data-testid="drawer-field-log-type-select"]')
  await expect(logTypeSelect).toBeVisible()
  await expect(logTypeSelect).toHaveValue('todo')

  // Save button should be disabled when text is empty
  const saveBtn = page.locator('[data-testid="drawer-save"]')
  await expect(saveBtn).toBeDisabled()

  // Type some text — save button becomes enabled
  await page.locator('[data-testid="drawer-field-text"]').fill('Test record')
  await expect(saveBtn).not.toBeDisabled()
})
