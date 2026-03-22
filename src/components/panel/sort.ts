import type { MustardRecord } from '../../shared/record.js'

export type SortOption = 'newest' | 'oldest'
export type StatusFilter = 'all' | 'open' | 'done' | 'parked'

export function filterByStatus(records: MustardRecord[], filter: StatusFilter): MustardRecord[] {
  if (filter === 'all') return records
  return records.filter((r) => (r.status ?? 'open') === filter)
}

/** Returns the date used for display and sorting — due_date for todos, capture_date otherwise. */
function sortDate(r: MustardRecord): string {
  return r.due_date_local ?? r.capture_date_local
}

export function sortRecords(records: MustardRecord[], sort: SortOption): MustardRecord[] {
  const sorted = [...records]
  switch (sort) {
    case 'newest':
      sorted.sort((a, b) => sortDate(b).localeCompare(sortDate(a)))
      break
    case 'oldest':
      sorted.sort((a, b) => sortDate(a).localeCompare(sortDate(b)))
      break
  }
  return sorted
}
