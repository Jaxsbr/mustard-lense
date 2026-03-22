import * as fs from 'node:fs'
import * as path from 'node:path'
import { parse as parseYaml } from 'yaml'
import * as lancedb from '@lancedb/lancedb'
import { embed, EMBEDDING_DIM } from './embedder.js'

const DEFAULT_DATA_PATH = '~/dev/mustard/data'
const DB_PATH = path.join('node_modules', '.cache', 'lancedb')
const TABLE_NAME = 'mustard_records'

export interface MustardRecord {
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

export interface IndexResult {
  records: number
}

function resolveHome(p: string): string {
  return p.startsWith('~/') ? path.join(process.env.HOME ?? '', p.slice(2)) : p
}

function findYamlFiles(dir: string): string[] {
  const files: string[] = []
  if (!fs.existsSync(dir)) return files
  for (const entry of fs.readdirSync(dir, { recursive: true, withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith('.yaml')) {
      files.push(path.join(entry.parentPath ?? (entry as { path?: string }).path ?? dir, entry.name))
    }
  }
  return files
}

function parseRecord(filePath: string): MustardRecord | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const doc = parseYaml(content)
    if (!doc || typeof doc.text !== 'string' || !doc.id) return null
    return {
      id: String(doc.id),
      log_type: String(doc.log_type ?? ''),
      capture_date_local: String(doc.capture_date_local ?? ''),
      text: doc.text,
      person: doc.person ?? null,
      status: doc.status ?? null,
      due_date_local: doc.due_date_local ?? null,
      category: doc.category ?? null,
      theme: doc.theme ?? null,
      period: doc.period ?? null,
      tags: Array.isArray(doc.meta?.tags) ? doc.meta.tags.join(', ') : '',
    }
  } catch {
    console.warn(`Failed to parse YAML: ${filePath}`)
    return null
  }
}

export async function buildIndex(dataPath: string = DEFAULT_DATA_PATH): Promise<IndexResult> {
  const resolved = resolveHome(dataPath)
  const files = findYamlFiles(resolved)
  console.log(`[indexer] Found ${files.length} YAML files in ${resolved}`)

  if (files.length === 0) {
    return { records: 0 }
  }

  const records = files.map(parseRecord).filter((r): r is MustardRecord => r !== null)
  console.log(`[indexer] Parsed ${records.length} valid records`)

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
      tags: record.tags,
    })
  }

  const db = await lancedb.connect(DB_PATH)

  // Create or overwrite table on each run
  const tableNames = await db.tableNames()
  if (tableNames.includes(TABLE_NAME)) {
    await db.dropTable(TABLE_NAME)
  }
  await db.createTable(TABLE_NAME, rows)

  console.log(`[indexer] Indexed ${rows.length} records into LanceDB`)
  return { records: rows.length }
}

export { DB_PATH, TABLE_NAME, EMBEDDING_DIM }
