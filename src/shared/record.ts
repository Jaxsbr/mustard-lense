export interface MustardRecord {
  id: string
  log_type: string
  capture_date_local: string
  title: string | null
  text: string
  person: string | null
  status: string | null
  due_date_local: string | null
  category: string | null
  theme: string | null
  period: string | null
  tags: string[]
}
