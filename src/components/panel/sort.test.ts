import { describe, it, expect } from 'vitest'
import { sortRecords, filterByStatus } from './sort.js'
import type { MustardRecord } from '../../shared/record.js'

function makeRecord(overrides: Partial<MustardRecord>): MustardRecord {
  return {
    id: 'test',
    log_type: 'todo',
    capture_date_local: '2026-03-15',
    text: 'test',
    person: null,
    status: null,
    due_date_local: null,
    category: null,
    theme: null,
    period: null,
    tags: [],
    ...overrides,
  }
}

describe('sortRecords', () => {
  const records = [
    makeRecord({ id: '1', capture_date_local: '2026-03-10' }),
    makeRecord({ id: '2', capture_date_local: '2026-03-15' }),
    makeRecord({ id: '3', capture_date_local: '2026-03-12' }),
  ]

  it('sorts newest first (descending date)', () => {
    const sorted = sortRecords(records, 'newest')
    expect(sorted.map((r) => r.id)).toEqual(['2', '3', '1'])
  })

  it('sorts oldest first (ascending date)', () => {
    const sorted = sortRecords(records, 'oldest')
    expect(sorted.map((r) => r.id)).toEqual(['1', '3', '2'])
  })

  it('does not mutate the original array', () => {
    const original = [...records]
    sortRecords(records, 'oldest')
    expect(records.map((r) => r.id)).toEqual(original.map((r) => r.id))
  })

  it('sorts todos by due_date_local when present (newest)', () => {
    const todos = [
      makeRecord({ id: 'a', capture_date_local: '2026-03-01', due_date_local: '2026-04-01' }),
      makeRecord({ id: 'b', capture_date_local: '2026-03-15', due_date_local: '2026-03-20' }),
      makeRecord({ id: 'c', capture_date_local: '2026-03-10', due_date_local: null }),
    ]
    const sorted = sortRecords(todos, 'newest')
    // a (due 04-01) > b (due 03-20) > c (capture 03-10, no due date)
    expect(sorted.map((r) => r.id)).toEqual(['a', 'b', 'c'])
  })

  it('sorts todos by due_date_local when present (oldest)', () => {
    const todos = [
      makeRecord({ id: 'a', capture_date_local: '2026-03-01', due_date_local: '2026-04-01' }),
      makeRecord({ id: 'b', capture_date_local: '2026-03-15', due_date_local: '2026-03-20' }),
    ]
    const sorted = sortRecords(todos, 'oldest')
    expect(sorted.map((r) => r.id)).toEqual(['b', 'a'])
  })
})

describe('filterByStatus', () => {
  const records = [
    makeRecord({ id: '1', status: 'open' }),
    makeRecord({ id: '2', status: 'done' }),
    makeRecord({ id: '3', status: 'parked' }),
    makeRecord({ id: '4', status: 'open' }),
  ]

  it('returns all records when filter is "all"', () => {
    expect(filterByStatus(records, 'all')).toHaveLength(4)
  })

  it('filters to open records only', () => {
    const filtered = filterByStatus(records, 'open')
    expect(filtered.map((r) => r.id)).toEqual(['1', '4'])
  })

  it('filters to done records only', () => {
    const filtered = filterByStatus(records, 'done')
    expect(filtered.map((r) => r.id)).toEqual(['2'])
  })

  it('filters to parked records only', () => {
    const filtered = filterByStatus(records, 'parked')
    expect(filtered.map((r) => r.id)).toEqual(['3'])
  })

  it('treats null status as open', () => {
    const withNull = [makeRecord({ id: 'x', status: null })]
    expect(filterByStatus(withNull, 'open').map((r) => r.id)).toEqual(['x'])
    expect(filterByStatus(withNull, 'done')).toHaveLength(0)
  })
})
