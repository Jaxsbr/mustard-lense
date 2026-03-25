import * as lancedb from '@lancedb/lancedb'
import * as path from 'node:path'
import { embed, EMBEDDING_DIM } from './embedder.js'
import { readRecords, getDataDir } from '../data/reader.js'
import type { MustardRecord } from '../data/reader.js'

const DB_PATH = path.join('node_modules', '.cache', 'lancedb')
const TABLE_NAME = 'mustard_records'

export interface IndexResult {
  records: number
}

export async function buildIndex(dataPath?: string): Promise<IndexResult> {
  const dir = dataPath ?? getDataDir()
  const records = readRecords(dir)
  console.log(`[indexer] Found ${records.length} valid records in ${dir}`)

  if (records.length === 0) {
    return { records: 0 }
  }

  // TODO: batch embedding when data store scales beyond ~100 records
  const rows = []
  for (const record of records) {
    const vector = await embed(record.text)
    rows.push({
      vector,
      id: record.id,
      log_type: record.log_type,
      capture_date_local: record.capture_date_local,
      text: record.text,
      person: record.person ?? '',
      status: record.status ?? '',
      due_date_local: record.due_date_local ?? '',
      category: record.category ?? '',
      theme: record.theme ?? '',
      period: record.period ?? '',
      tags: record.tags.join(', '),
    })
  }

  const db = await lancedb.connect(DB_PATH)

  // Create or overwrite table on each run
  const tableNames = await db.tableNames()
  if (tableNames.includes(TABLE_NAME)) {
    await db.dropTable(TABLE_NAME)
  }
  await db.createTable(TABLE_NAME, rows)

  currentVocabulary = collectVocabulary(records)
  console.log(`[indexer] Indexed ${rows.length} records into LanceDB`)
  return { records: rows.length }
}

export interface Vocabulary {
  persons: Set<string>
  tags: Set<string>
  themes: Set<string>
}

let currentVocabulary: Vocabulary = { persons: new Set(), tags: new Set(), themes: new Set() }

function collectVocabulary(records: MustardRecord[]): Vocabulary {
  const persons = new Set<string>()
  const tags = new Set<string>()
  const themes = new Set<string>()
  for (const r of records) {
    if (r.person) persons.add(r.person.toLowerCase())
    for (const t of r.tags) tags.add(t.toLowerCase())
    if (r.theme) themes.add(r.theme.toLowerCase())
  }
  return { persons, tags, themes }
}

export function getVocabulary(): Vocabulary {
  return currentVocabulary
}

export { DB_PATH, TABLE_NAME, EMBEDDING_DIM }
export type { MustardRecord }
