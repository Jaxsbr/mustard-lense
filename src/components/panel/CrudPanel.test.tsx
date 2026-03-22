// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { CrudPanel } from './CrudPanel.js'

beforeEach(() => {
  vi.restoreAllMocks()
})

afterEach(() => {
  cleanup()
})

function mockFetch(records: Array<Record<string, unknown>>) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(records),
  })
}

const fixtureRecords = [
  { id: 'todo-1', log_type: 'todo', capture_date_local: '2026-03-15', text: 'Buy groceries', person: null, status: 'open', due_date_local: '2026-03-16', category: null, theme: null, period: null, tags: [] },
  { id: 'todo-2', log_type: 'todo', capture_date_local: '2026-03-14', text: 'Review PR', person: null, status: 'done', due_date_local: null, category: null, theme: null, period: null, tags: [] },
]

describe('CrudPanel tabs', () => {
  it('renders four tabs with correct labels', () => {
    global.fetch = mockFetch([])
    render(<CrudPanel collapsed={false} onToggle={() => {}} />)

    expect(screen.getByText('Todos')).toBeInTheDocument()
    expect(screen.getByText('People')).toBeInTheDocument()
    expect(screen.getByText('Ideas')).toBeInTheDocument()
    expect(screen.getByText('Daily Logs')).toBeInTheDocument()
  })

  it('Todos tab is active by default', () => {
    global.fetch = mockFetch([])
    render(<CrudPanel collapsed={false} onToggle={() => {}} />)

    const todosTab = screen.getByTestId('tab-todo')
    expect(todosTab).toHaveAttribute('aria-selected', 'true')
  })

  it('clicking a tab changes active state', async () => {
    global.fetch = mockFetch([])
    render(<CrudPanel collapsed={false} onToggle={() => {}} />)

    const peopleTab = screen.getByTestId('tab-people_note')
    fireEvent.click(peopleTab)

    await waitFor(() => {
      expect(peopleTab).toHaveAttribute('aria-selected', 'true')
    })

    const todosTab = screen.getByTestId('tab-todo')
    expect(todosTab).toHaveAttribute('aria-selected', 'false')
  })

  it('fetches records when tab is clicked', async () => {
    const fetchMock = mockFetch(fixtureRecords)
    global.fetch = fetchMock
    render(<CrudPanel collapsed={false} onToggle={() => {}} />)

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/records?type=todo')
    })
  })

  it('shows loading indicator while fetching', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {})) // never resolves
    render(<CrudPanel collapsed={false} onToggle={() => {}} />)

    expect(screen.getByTestId('panel-loading')).toBeInTheDocument()
  })

  it('renders records after fetch completes', async () => {
    global.fetch = mockFetch(fixtureRecords)
    render(<CrudPanel collapsed={false} onToggle={() => {}} />)

    await waitFor(() => {
      expect(screen.getAllByTestId('panel-list-item')).toHaveLength(2)
    })
  })

  it('shows empty state when no records', async () => {
    global.fetch = mockFetch([])
    render(<CrudPanel collapsed={false} onToggle={() => {}} />)

    await waitFor(() => {
      expect(screen.getByTestId('panel-empty')).toBeInTheDocument()
    })
  })
})
