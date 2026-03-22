import type { MustardRecord } from '../../shared/record.js'

export type PanelRecord = MustardRecord

export const TABS = [
  { label: 'Todos', type: 'todo' },
  { label: 'People', type: 'people_note' },
  { label: 'Ideas', type: 'idea' },
  { label: 'Daily Logs', type: 'daily_log' },
] as const
