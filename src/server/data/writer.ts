import * as fs from 'node:fs'
import * as path from 'node:path'
import * as crypto from 'node:crypto'
import { stringify as stringifyYaml, parse as parseYaml } from 'yaml'
import { getDataDir, findYamlFiles } from './reader.js'
import type { MustardRecord } from '../../shared/record.js'

const VALID_LOG_TYPES = ['todo', 'people_note', 'idea', 'daily_log'] as const
type LogType = (typeof VALID_LOG_TYPES)[number]

const LOG_TYPE_DIR: Record<LogType, string> = {
  todo: 'todos',
  people_note: 'people_notes',
  idea: 'ideas',
  daily_log: 'daily_logs',
}

const MAX_TEXT_LENGTH = 10000

const MAX_TITLE_LENGTH = 120

export interface CreateRecordInput {
  log_type: string
  text: string
  title?: string | null
  person?: string
  status?: string
  due_date_local?: string
  category?: string
  theme?: string
  period?: string
}

export interface UpdateRecordInput {
  text?: string
  title?: string | null
  person?: string | null
  status?: string | null
  due_date_local?: string | null
  category?: string | null
  theme?: string | null
  period?: string | null
}

export function validateLogType(logType: unknown): logType is LogType {
  return typeof logType === 'string' && VALID_LOG_TYPES.includes(logType as LogType)
}

export function validateText(text: unknown): text is string {
  return typeof text === 'string' && text.trim().length > 0 && text.length <= MAX_TEXT_LENGTH
}

export function validateTitle(title: unknown): boolean {
  if (title === undefined || title === null || title === '') return true
  return typeof title === 'string' && title.length <= MAX_TITLE_LENGTH
}

export function createRecord(input: CreateRecordInput, dataDir?: string): MustardRecord {
  const dir = dataDir ?? getDataDir()
  const logType = input.log_type as LogType
  const id = crypto.randomUUID()
  const captureDate = new Date().toISOString().slice(0, 10)

  // Derive YYYY/MM from captureDate for month-folder organisation
  const [year, month] = captureDate.split('-')
  const subDir = path.join(dir, LOG_TYPE_DIR[logType], year, month)

  fs.mkdirSync(subDir, { recursive: true })

  const record: Record<string, unknown> = {
    id,
    log_type: logType,
    capture_date_local: captureDate,
    text: input.text,
    source: 'mustard-app',
    meta: { tags: [] },
  }

  // Add optional fields if provided
  if (input.title !== undefined) record.title = input.title
  if (input.person !== undefined) record.person = input.person
  if (input.status !== undefined) record.status = input.status
  if (input.due_date_local !== undefined) record.due_date_local = input.due_date_local
  if (input.category !== undefined) record.category = input.category
  if (input.theme !== undefined) record.theme = input.theme
  if (input.period !== undefined) record.period = input.period

  const yamlContent = stringifyYaml(record)
  const filePath = path.join(subDir, `${id}.yaml`)
  fs.writeFileSync(filePath, yamlContent, 'utf-8')

  return {
    id,
    log_type: logType,
    capture_date_local: captureDate,
    title: input.title ?? null,
    text: input.text,
    person: input.person ?? null,
    status: input.status ?? null,
    due_date_local: input.due_date_local ?? null,
    category: input.category ?? null,
    theme: input.theme ?? null,
    period: input.period ?? null,
    tags: [],
  }
}

export function updateRecord(id: string, input: UpdateRecordInput, dataDir?: string): MustardRecord | null {
  const dir = dataDir ?? getDataDir()

  // Find file by scanning records — no path interpolation from user input
  const filePath = findRecordFile(id, dir)
  if (!filePath) return null

  // Read existing YAML
  const content = fs.readFileSync(filePath, 'utf-8')
  const doc = parseYaml(content) as Record<string, unknown>

  // Update fields
  if (input.text !== undefined) doc.text = input.text
  if (input.title !== undefined) doc.title = input.title
  if (input.person !== undefined) doc.person = input.person
  if (input.status !== undefined) doc.status = input.status
  if (input.due_date_local !== undefined) doc.due_date_local = input.due_date_local
  if (input.category !== undefined) doc.category = input.category
  if (input.theme !== undefined) doc.theme = input.theme
  if (input.period !== undefined) doc.period = input.period

  const yamlContent = stringifyYaml(doc)
  fs.writeFileSync(filePath, yamlContent, 'utf-8')

  return {
    id: String(doc.id),
    log_type: String(doc.log_type),
    capture_date_local: String(doc.capture_date_local),
    title: (doc.title as string) ?? null,
    text: String(doc.text),
    person: (doc.person as string) ?? null,
    status: (doc.status as string) ?? null,
    due_date_local: (doc.due_date_local as string) ?? null,
    category: (doc.category as string) ?? null,
    theme: (doc.theme as string) ?? null,
    period: (doc.period as string) ?? null,
    tags: Array.isArray((doc.meta as Record<string, unknown>)?.tags) ? (doc.meta as Record<string, unknown>).tags as string[] : [],
  }
}

// O(n) scan — acceptable at current scale. Natural upgrade: in-memory ID→filepath index populated at startup/reindex.
function findRecordFile(id: string, dataDir: string): string | null {
  const files = findYamlFiles(dataDir)
  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const doc = parseYaml(content)
      if (doc && String(doc.id) === id) return filePath
    } catch {
      continue
    }
  }
  return null
}

export function deleteRecord(id: string, dataDir?: string): string | null {
  const dir = dataDir ?? getDataDir()

  const filePath = findRecordFile(id, dir)
  if (!filePath) return null

  fs.unlinkSync(filePath)
  return id
}

export { VALID_LOG_TYPES, MAX_TEXT_LENGTH, MAX_TITLE_LENGTH }
