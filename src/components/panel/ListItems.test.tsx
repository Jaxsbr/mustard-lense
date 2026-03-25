// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { TodoListItem, PeopleListItem } from './ListItems.js'

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
    title: null,
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

describe('Title display preference', () => {
  it('displays title when present instead of truncated text', () => {
    render(<TodoListItem record={makeRecord({ title: 'My Todo Title', text: 'Long text that would be truncated' })} />)
    expect(screen.getByText('My Todo Title')).toBeInTheDocument()
    expect(screen.queryByText('Long text that would be truncated')).not.toBeInTheDocument()
  })

  it('falls back to truncated text when title is null', () => {
    render(<TodoListItem record={makeRecord({ title: null, text: 'Some text content' })} />)
    expect(screen.getByText('Some text content')).toBeInTheDocument()
  })

  it('falls back to truncated text when title is empty string', () => {
    render(<TodoListItem record={makeRecord({ title: '', text: 'Fallback text' })} />)
    expect(screen.getByText('Fallback text')).toBeInTheDocument()
  })

  it('falls back to truncated text when title is whitespace only', () => {
    render(<TodoListItem record={makeRecord({ title: '   ', text: 'Whitespace fallback' })} />)
    expect(screen.getByText('Whitespace fallback')).toBeInTheDocument()
  })

  it('works in PeopleListItem', () => {
    render(<PeopleListItem record={makeRecord({ title: 'Person Title', log_type: 'people_note', person: 'Jaco' })} />)
    expect(screen.getByText('Person Title')).toBeInTheDocument()
  })
})
