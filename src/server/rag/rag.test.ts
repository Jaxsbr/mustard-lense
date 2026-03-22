import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'

// Create temp dirs at module scope (before vi.mock hoisting)
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rag-test-'))
const fixtureDir = path.join(tmpDir, 'data')

// Mock embedder — deterministic vectors based on text content
vi.mock('./embedder.js', () => {
  function hashToVector(text: string): number[] {
    const vec = new Array(384).fill(0)
    for (let i = 0; i < text.length; i++) {
      vec[i % 384] += text.charCodeAt(i) / 1000
    }
    const mag = Math.sqrt(vec.reduce((s, v) => s + v * v, 0))
    return mag > 0 ? vec.map((v) => v / mag) : vec
  }
  return {
    embed: vi.fn(async (text: string) => hashToVector(text)),
    getEmbedder: vi.fn(),
    EMBEDDING_DIM: 384,
  }
})

// Store for mock LanceDB tables
const tables: Map<string, { rows: Record<string, unknown>[]; name: string }> = new Map()

vi.mock('@lancedb/lancedb', () => {
  return {
    connect: vi.fn(async () => ({
      tableNames: vi.fn(async () => Array.from(tables.keys())),
      createTable: vi.fn(async (name: string, rows: Record<string, unknown>[]) => {
        tables.set(name, { rows, name })
        return {
          vectorSearch: vi.fn((queryVec: number[]) => ({
            limit: vi.fn((k: number) => ({
              toArray: vi.fn(async () => {
                // Simple cosine-distance ranking
                const table = tables.get(name)
                if (!table) return []
                const scored = table.rows.map((row) => {
                  const vec = row.vector as number[]
                  let dot = 0
                  for (let i = 0; i < vec.length; i++) dot += vec[i] * queryVec[i]
                  return { ...row, _score: dot }
                })
                scored.sort((a, b) => b._score - a._score)
                return scored.slice(0, k).map((row) => {
                  const copy = { ...(row as Record<string, unknown>) }
                  delete copy.vector
                  delete copy._score
                  return copy
                })
              }),
            })),
          })),
        }
      }),
      dropTable: vi.fn(async (name: string) => {
        tables.delete(name)
      }),
      openTable: vi.fn(async (name: string) => {
        const table = tables.get(name)
        return {
          vectorSearch: vi.fn((queryVec: number[]) => ({
            limit: vi.fn((k: number) => ({
              toArray: vi.fn(async () => {
                if (!table) return []
                const scored = table.rows.map((row) => {
                  const vec = row.vector as number[]
                  let dot = 0
                  for (let i = 0; i < vec.length; i++) dot += vec[i] * queryVec[i]
                  return { ...row, _score: dot }
                })
                scored.sort((a, b) => b._score - a._score)
                return scored.slice(0, k).map((row) => {
                  const copy = { ...(row as Record<string, unknown>) }
                  delete copy.vector
                  delete copy._score
                  return copy
                })
              }),
            })),
          })),
        }
      }),
    })),
  }
})

import { buildIndex } from './indexer.js'
import { retrieve } from './retriever.js'

beforeAll(() => {
  tables.clear()

  // Create fixture YAML files
  fs.mkdirSync(path.join(fixtureDir, 'todos', '2026', '03'), { recursive: true })
  fs.mkdirSync(path.join(fixtureDir, 'people_notes', 'alice', '2026', '03'), { recursive: true })
  fs.mkdirSync(path.join(fixtureDir, 'daily_logs', '2026', '03'), { recursive: true })

  fs.writeFileSync(
    path.join(fixtureDir, 'todos', '2026', '03', 'todo-1.yaml'),
    `id: todo-1
log_type: todo
capture_date_local: '2026-03-15'
text: Buy groceries for the week
status: open
due_date_local: '2026-03-16'
meta:
  tags:
    - personal
    - errands
`,
  )

  fs.writeFileSync(
    path.join(fixtureDir, 'todos', '2026', '03', 'todo-2.yaml'),
    `id: todo-2
log_type: todo
capture_date_local: '2026-03-15'
text: Review pull request for authentication module
status: done
due_date_local: '2026-03-15'
meta:
  tags:
    - work
    - code-review
`,
  )

  fs.writeFileSync(
    path.join(fixtureDir, 'people_notes', 'alice', '2026', '03', 'note-1.yaml'),
    `id: note-1
log_type: people_note
capture_date_local: '2026-03-14'
text: Alice mentioned she is working on the new design system
person: alice
meta:
  tags:
    - design
    - team
`,
  )

  fs.writeFileSync(
    path.join(fixtureDir, 'daily_logs', '2026', '03', 'log-1.yaml'),
    `id: log-1
log_type: daily_log
capture_date_local: '2026-03-15'
text: Productive day focused on RAG pipeline implementation
theme: engineering
meta:
  tags:
    - dev
    - rag
`,
  )
})

afterAll(() => {
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
})

describe('indexer', () => {
  it('indexes fixture YAML files and returns record count', async () => {
    const result = await buildIndex(fixtureDir)
    expect(result.records).toBe(4)
  })

  it('returns 0 for empty directory', async () => {
    const emptyDir = path.join(tmpDir, 'empty')
    fs.mkdirSync(emptyDir, { recursive: true })
    const result = await buildIndex(emptyDir)
    expect(result.records).toBe(0)
  })

  it('returns 0 for non-existent directory', async () => {
    const result = await buildIndex(path.join(tmpDir, 'does-not-exist'))
    expect(result.records).toBe(0)
  })

  it('overwrites table on re-index', async () => {
    const result1 = await buildIndex(fixtureDir)
    const result2 = await buildIndex(fixtureDir)
    expect(result1.records).toBe(4)
    expect(result2.records).toBe(4)
  })
})

describe('retriever', () => {
  it('retrieves records with text and metadata fields', async () => {
    await buildIndex(fixtureDir)
    const results = await retrieve('groceries')
    expect(results.length).toBeGreaterThan(0)
    expect(results.length).toBeLessThanOrEqual(5)

    const first = results[0]
    expect(first).toHaveProperty('id')
    expect(first).toHaveProperty('log_type')
    expect(first).toHaveProperty('capture_date_local')
    expect(first).toHaveProperty('text')
    expect(first).toHaveProperty('person')
    expect(first).toHaveProperty('status')
    expect(first).toHaveProperty('tags')
  })

  it('respects k parameter', async () => {
    await buildIndex(fixtureDir)
    const results = await retrieve('todo', 2)
    expect(results.length).toBeLessThanOrEqual(2)
  })

  it('returns records with correct metadata types', async () => {
    await buildIndex(fixtureDir)
    const results = await retrieve('Alice design system')
    const personNote = results.find((r) => r.id === 'note-1')
    if (personNote) {
      expect(personNote.person).toBe('alice')
      expect(personNote.log_type).toBe('people_note')
    }
  })
})
