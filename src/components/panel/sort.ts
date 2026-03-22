import type { MustardRecord } from '../../shared/record.js'

export type SortOption = 'newest' | 'oldest'
export type StatusFilter = 'all' | 'open' | 'done' | 'parked'

export function filterByStatus(records: MustardRecord[], filter: StatusFilter): MustardRecord[] {
  if (filter === 'all') return records
  return records.filter((r) => (r.status ?? 'open') === filter)
}

export function sortRecords(records: MustardRecord[], sort: SortOption): MustardRecord[] {
  const sorted = [...records]
  switch (sort) {
    case 'newest':
      sorted.sort((a, b) => b.capture_date_local.localeCompare(a.capture_date_local))
      break
    case 'oldest':
      sorted.sort((a, b) => a.capture_date_local.localeCompare(b.capture_date_local))
      break
  }
  return sorted
}
