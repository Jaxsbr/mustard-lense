import type { MustardRecord } from '../../shared/record.js'

export type SortOption = 'newest' | 'oldest' | 'status'

const STATUS_ORDER: Record<string, number> = {
  open: 0,
  parked: 1,
  done: 2,
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
    case 'status':
      sorted.sort((a, b) => {
        const aOrder = STATUS_ORDER[a.status ?? 'open'] ?? 0
        const bOrder = STATUS_ORDER[b.status ?? 'open'] ?? 0
        if (aOrder !== bOrder) return aOrder - bOrder
        return b.capture_date_local.localeCompare(a.capture_date_local)
      })
      break
  }
  return sorted
}
