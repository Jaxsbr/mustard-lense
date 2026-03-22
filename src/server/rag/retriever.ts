import * as lancedb from '@lancedb/lancedb'
import { embed } from './embedder.js'
import { DB_PATH, TABLE_NAME } from './indexer.js'

const DEFAULT_K = 5

export interface RetrievedRecord {
  id: string
  log_type: string
  capture_date_local: string
  text: string
  person: string | null
  status: string | null
  due_date_local: string | null
  category: string | null
  theme: string | null
  period: string | null
  tags: string
}

function toNullable(val: string | undefined | null): string | null {
  return val && val !== '' ? val : null
}

export async function retrieve(query: string, k: number = DEFAULT_K): Promise<RetrievedRecord[]> {
  const queryVector = await embed(query)
  const db = await lancedb.connect(DB_PATH)
  const table = await db.openTable(TABLE_NAME)
  const results = await table.vectorSearch(queryVector).limit(k).toArray()

  return results.map((row) => ({
    id: String(row.id),
    log_type: String(row.log_type),
    capture_date_local: String(row.capture_date_local),
    text: String(row.text),
    person: toNullable(row.person as string),
    status: toNullable(row.status as string),
    due_date_local: toNullable(row.due_date_local as string),
    category: toNullable(row.category as string),
    theme: toNullable(row.theme as string),
    period: toNullable(row.period as string),
    tags: String(row.tags ?? ''),
  }))
}
