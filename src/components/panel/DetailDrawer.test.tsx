// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { DetailDrawer } from './DetailDrawer.js'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const noop = () => {}

describe('DetailDrawer due date default', () => {
  it('auto-populates due date to today in create mode for todo', () => {
    const today = new Date().toLocaleDateString('en-CA')
    render(
      <DetailDrawer
        record={null}
        mode="create"
        defaultLogType="todo"
        open={true}
        onClose={noop}
        onSave={noop}
      />
    )

    const input = screen.getByTestId('drawer-field-due-date') as HTMLInputElement
    expect(input.value).toBe(today)
  })

  it('does not auto-populate due date in edit mode', () => {
    const record = {
      id: 'test-1',
      log_type: 'todo',
      capture_date_local: '2026-03-01',
      text: 'Test',
      status: 'open',
      due_date_local: '2026-04-01',
      person: null,
      category: null,
      theme: null,
      period: null,
      tags: [],
    }
    render(
      <DetailDrawer
        record={record}
        mode="edit"
        open={true}
        onClose={noop}
        onSave={noop}
      />
    )

    const input = screen.getByTestId('drawer-field-due-date') as HTMLInputElement
    expect(input.value).toBe('2026-04-01')
  })

  it('does not show due date field for non-todo type in create mode', () => {
    render(
      <DetailDrawer
        record={null}
        mode="create"
        defaultLogType="idea"
        open={true}
        onClose={noop}
        onSave={noop}
      />
    )

    expect(screen.queryByTestId('drawer-field-due-date')).not.toBeInTheDocument()
  })

  it('resets due date to today when switching back to todo in create mode', () => {
    const today = new Date().toLocaleDateString('en-CA')
    render(
      <DetailDrawer
        record={null}
        mode="create"
        defaultLogType="idea"
        open={true}
        onClose={noop}
        onSave={noop}
      />
    )

    // Switch to todo
    const select = screen.getByTestId('drawer-field-log-type-select')
    fireEvent.change(select, { target: { value: 'todo' } })

    const input = screen.getByTestId('drawer-field-due-date') as HTMLInputElement
    expect(input.value).toBe(today)
  })

  it('allows clearing due date', () => {
    render(
      <DetailDrawer
        record={null}
        mode="create"
        defaultLogType="todo"
        open={true}
        onClose={noop}
        onSave={noop}
      />
    )

    const input = screen.getByTestId('drawer-field-due-date') as HTMLInputElement
    fireEvent.change(input, { target: { value: '' } })
    expect(input.value).toBe('')
  })
})
