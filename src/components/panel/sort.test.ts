import { describe, it, expect } from 'vitest'
import { sortRecords } from './sort.js'
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
    makeRecord({ id: '1', capture_date_local: '2026-03-10', status: 'done' }),
    makeRecord({ id: '2', capture_date_local: '2026-03-15', status: 'open' }),
    makeRecord({ id: '3', capture_date_local: '2026-03-12', status: 'parked' }),
  ]

  it('sorts newest first (descending date)', () => {
    const sorted = sortRecords(records, 'newest')
    expect(sorted.map((r) => r.id)).toEqual(['2', '3', '1'])
  })

  it('sorts oldest first (ascending date)', () => {
    const sorted = sortRecords(records, 'oldest')
    expect(sorted.map((r) => r.id)).toEqual(['1', '3', '2'])
  })

  it('sorts by status: open → parked → done', () => {
    const sorted = sortRecords(records, 'status')
    expect(sorted.map((r) => r.status)).toEqual(['open', 'parked', 'done'])
  })

  it('status sort uses date as secondary sort (newest first within same status)', () => {
    const sameStatus = [
      makeRecord({ id: 'a', capture_date_local: '2026-03-10', status: 'open' }),
      makeRecord({ id: 'b', capture_date_local: '2026-03-15', status: 'open' }),
    ]
    const sorted = sortRecords(sameStatus, 'status')
    expect(sorted.map((r) => r.id)).toEqual(['b', 'a'])
  })

  it('does not mutate the original array', () => {
    const original = [...records]
    sortRecords(records, 'oldest')
    expect(records.map((r) => r.id)).toEqual(original.map((r) => r.id))
  })
})
