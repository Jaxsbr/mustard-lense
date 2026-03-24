import * as fs from 'node:fs'
import * as path from 'node:path'
import { parse as parseYaml } from 'yaml'
import type { MustardRecord } from '../../shared/record.js'

const DEFAULT_DATA_PATH = '~/dev/mustard-data'

export function getDataDir(): string {
  return resolveHome(process.env.MUSTARD_DATA_DIR ?? DEFAULT_DATA_PATH)
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
      tags: Array.isArray(doc.meta?.tags) ? doc.meta.tags : [],
    }
  } catch {
    console.warn(`Failed to parse YAML: ${filePath}`)
    return null
  }
}

export function readRecords(dataDir?: string): MustardRecord[] {
  const dir = dataDir ?? getDataDir()
  const files = findYamlFiles(dir)
  const records = files.map(parseRecord).filter((r): r is MustardRecord => r !== null)
  records.sort((a, b) => b.capture_date_local.localeCompare(a.capture_date_local))
  return records
}

export type { MustardRecord }
export { findYamlFiles, resolveHome }
