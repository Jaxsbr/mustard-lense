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

function makeSearchChain(tableName: string, queryVec: number[], whereFilter?: string) {
  return {
    where: vi.fn((filter: string) => makeSearchChain(tableName, queryVec, filter)),
    limit: vi.fn((k: number) => ({
      toArray: vi.fn(async () => {
        const table = tables.get(tableName)
        if (!table) return []
        let rows = table.rows
        // Apply simple WHERE filter parsing for tests
        if (whereFilter) {
          const eqMatch = whereFilter.match(/^(\w+)\s*=\s*'([^']*)'$/)
          const likeMatch = whereFilter.match(/^(\w+)\s+LIKE\s+'%([^%]*)%'$/)
          if (eqMatch) {
            const [, col, val] = eqMatch
            rows = rows.filter((r) => String(r[col]).toLowerCase() === val.toLowerCase())
          } else if (likeMatch) {
            const [, col, val] = likeMatch
            rows = rows.filter((r) => String(r[col]).toLowerCase().includes(val.toLowerCase()))
          }
        }
        const scored = rows.map((row) => {
          const vec = row.vector as number[]
          let dot = 0
          for (let i = 0; i < vec.length; i++) dot += vec[i] * queryVec[i]
          return { ...row, _score: dot, _distance: 1 - dot }
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
  }
}

vi.mock('@lancedb/lancedb', () => {
  return {
    connect: vi.fn(async () => ({
      tableNames: vi.fn(async () => Array.from(tables.keys())),
      createTable: vi.fn(async (name: string, rows: Record<string, unknown>[]) => {
        tables.set(name, { rows, name })
        return {
          vectorSearch: vi.fn((queryVec: number[]) => makeSearchChain(name, queryVec)),
        }
      }),
      dropTable: vi.fn(async (name: string) => {
        tables.delete(name)
      }),
      openTable: vi.fn(async (name: string) => ({
        vectorSearch: vi.fn((queryVec: number[]) => makeSearchChain(name, queryVec)),
      })),
    })),
  }
})

import { buildIndex, getVocabulary } from './indexer.js'
import { retrieve } from './retriever.js'
import { extractKeywords, planScans, multiRetrieve } from './scanner.js'

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

  it('returns _distance on results', async () => {
    await buildIndex(fixtureDir)
    const results = await retrieve('groceries')
    expect(results.length).toBeGreaterThan(0)
    expect(typeof results[0]._distance).toBe('number')
  })

  it('accepts optional filter parameter', async () => {
    await buildIndex(fixtureDir)
    const results = await retrieve('groceries', 5, "log_type = 'todo'")
    for (const r of results) {
      expect(r.log_type).toBe('todo')
    }
  })
})

describe('vocabulary', () => {
  it('collects person names, tags, and themes after buildIndex', async () => {
    await buildIndex(fixtureDir)
    const vocab = getVocabulary()
    expect(vocab.persons.has('alice')).toBe(true)
    expect(vocab.tags.has('personal')).toBe(true)
    expect(vocab.tags.has('work')).toBe(true)
    expect(vocab.tags.has('design')).toBe(true)
    expect(vocab.themes.has('engineering')).toBe(true)
  })
})

describe('extractKeywords', () => {
  it('matches static dictionary terms', () => {
    const vocab = { persons: new Set<string>(), tags: new Set<string>(), themes: new Set<string>() }
    const kws = extractKeywords('show me all todos', vocab)
    expect(kws).toEqual([{ term: 'todos', filter: "log_type = 'todo'" }])
  })

  it('matches dynamic vocabulary persons', () => {
    const vocab = { persons: new Set(['alice']), tags: new Set<string>(), themes: new Set<string>() }
    const kws = extractKeywords('what did alice say', vocab)
    expect(kws).toEqual([{ term: 'alice', filter: "person = 'alice'" }])
  })

  it('matches dynamic vocabulary themes', () => {
    const vocab = { persons: new Set<string>(), tags: new Set<string>(), themes: new Set(['engineering']) }
    const kws = extractKeywords('engineering updates', vocab)
    expect(kws).toEqual([{ term: 'engineering', filter: "theme = 'engineering'" }])
  })

  it('matches dynamic vocabulary tags', () => {
    const vocab = { persons: new Set<string>(), tags: new Set(['design']), themes: new Set<string>() }
    const kws = extractKeywords('design feedback', vocab)
    expect(kws).toEqual([{ term: 'design', filter: "tags LIKE '%design%'" }])
  })

  it('returns at most 3 keywords', () => {
    const vocab = { persons: new Set(['alice', 'bob']), tags: new Set(['design', 'dev']), themes: new Set<string>() }
    const kws = extractKeywords('alice bob design dev extra', vocab)
    expect(kws.length).toBe(3)
  })

  it('strips punctuation', () => {
    const vocab = { persons: new Set<string>(), tags: new Set<string>(), themes: new Set<string>() }
    const kws = extractKeywords("what's my todo?", vocab)
    expect(kws).toEqual([{ term: 'todo', filter: "log_type = 'todo'" }])
  })

  it('maps person and people to people_note log type', () => {
    const vocab = { persons: new Set<string>(), tags: new Set<string>(), themes: new Set<string>() }
    const kws = extractKeywords('person notes', vocab)
    expect(kws).toEqual([
      { term: 'person', filter: "log_type = 'people_note'" },
      { term: 'notes', filter: "log_type = 'people_note'" },
    ])
    const kws2 = extractKeywords('people updates', vocab)
    expect(kws2).toEqual([{ term: 'people', filter: "log_type = 'people_note'" }])
  })
})

describe('planScans', () => {
  it('0 keywords → 1 unfiltered top-10', () => {
    expect(planScans([])).toEqual([{ k: 10 }])
  })

  it('1 keyword → filtered top-5 + unfiltered top-5', () => {
    const plans = planScans([{ term: 'todo', filter: "log_type = 'todo'" }])
    expect(plans).toEqual([
      { k: 5, filter: "log_type = 'todo'" },
      { k: 5 },
    ])
  })

  it('2 keywords → 2 filtered + 1 unfiltered', () => {
    const plans = planScans([
      { term: 'todo', filter: "log_type = 'todo'" },
      { term: 'alice', filter: "person = 'alice'" },
    ])
    expect(plans).toEqual([
      { k: 5, filter: "log_type = 'todo'" },
      { k: 5, filter: "person = 'alice'" },
      { k: 5 },
    ])
  })

  it('deduplicates keywords with same filter', () => {
    const plans = planScans([
      { term: 'daily', filter: "log_type = 'daily_log'" },
      { term: 'logs', filter: "log_type = 'daily_log'" },
    ])
    expect(plans).toEqual([
      { k: 5, filter: "log_type = 'daily_log'" },
      { k: 5 },
    ])
  })

  it('3 keywords → 3 filtered, no unfiltered', () => {
    const plans = planScans([
      { term: 'todo', filter: "log_type = 'todo'" },
      { term: 'alice', filter: "person = 'alice'" },
      { term: 'design', filter: "tags LIKE '%design%'" },
    ])
    expect(plans).toEqual([
      { k: 5, filter: "log_type = 'todo'" },
      { k: 5, filter: "person = 'alice'" },
      { k: 5, filter: "tags LIKE '%design%'" },
    ])
  })
})

describe('multiRetrieve', () => {
  it('returns deduplicated results sorted by _distance', async () => {
    await buildIndex(fixtureDir)
    const results = await multiRetrieve('show todos')
    expect(results.length).toBeGreaterThan(0)
    expect(results.length).toBeLessThanOrEqual(10)
    // Check sorted by _distance ascending
    for (let i = 1; i < results.length; i++) {
      expect(results[i]._distance).toBeGreaterThanOrEqual(results[i - 1]._distance)
    }
    // Check no duplicate IDs
    const ids = results.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('returns results for unfiltered query', async () => {
    await buildIndex(fixtureDir)
    const results = await multiRetrieve('what happened today')
    expect(results.length).toBeGreaterThan(0)
  })
})
