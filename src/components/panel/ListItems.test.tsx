// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { TodoListItem } from './ListItems.js'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function makeRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 'todo-1',
    log_type: 'todo',
    capture_date_local: '2026-03-15',
    text: 'Buy groceries',
    person: null,
    status: 'open',
    due_date_local: null as string | null,
    category: null,
    theme: null,
    period: null,
    tags: [],
    ...overrides,
  }
}

describe('TodoListItem today highlight', () => {
  it('applies today class when due date is today', () => {
    const today = new Date().toLocaleDateString('en-CA')
    render(<TodoListItem record={makeRecord({ due_date_local: today })} />)

    const dateSpan = screen.getByText(today)
    expect(dateSpan).toHaveClass('list-date--today')
  })

  it('does not apply today class for other dates', () => {
    render(<TodoListItem record={makeRecord({ due_date_local: '2020-01-01' })} />)

    const dateSpan = screen.getByText('2020-01-01')
    expect(dateSpan).not.toHaveClass('list-date--today')
  })

  it('renders no date span when due_date_local is null', () => {
    render(<TodoListItem record={makeRecord({ due_date_local: null })} />)

    const item = screen.getByTestId('list-item-todo')
    expect(item.querySelector('.list-date')).toBeNull()
  })
})
