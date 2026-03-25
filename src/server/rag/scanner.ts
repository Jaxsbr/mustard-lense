import { getVocabulary, type Vocabulary } from './indexer.js'
import { retrieve, type RetrievedRecord } from './retriever.js'

// Static dictionary: common terms → SQL WHERE filters
const STATIC_DICT: Record<string, string> = {
  task: "log_type = 'todo'",
  todo: "log_type = 'todo'",
  todos: "log_type = 'todo'",
  idea: "log_type = 'idea'",
  ideas: "log_type = 'idea'",
  note: "log_type = 'people_note'",
  notes: "log_type = 'people_note'",
  people_note: "log_type = 'people_note'",
  log: "log_type = 'daily_log'",
  logs: "log_type = 'daily_log'",
  daily_log: "log_type = 'daily_log'",
  daily: "log_type = 'daily_log'",
}

export interface Keyword {
  term: string
  filter: string
}

export interface ScanPlan {
  k: number
  filter?: string
}

/**
 * Extract up to 3 keywords from a query using static dictionary and dynamic vocabulary.
 * Pure string matching — deterministic, no LLM.
 */
export function extractKeywords(query: string, vocabulary: Vocabulary): Keyword[] {
  const tokens = query
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((t) => t.length > 0)

  const seen = new Set<string>()
  const keywords: Keyword[] = []

  for (const token of tokens) {
    if (keywords.length >= 3) break
    if (seen.has(token)) continue
    seen.add(token)

    // Check static dictionary first
    if (STATIC_DICT[token]) {
      keywords.push({ term: token, filter: STATIC_DICT[token] })
      continue
    }

    // Check dynamic vocabulary (escape single quotes for SQL safety)
    const escaped = token.replace(/'/g, "''")
    if (vocabulary.persons.has(token)) {
      keywords.push({ term: token, filter: `person = '${escaped}'` })
    } else if (vocabulary.themes.has(token)) {
      keywords.push({ term: token, filter: `theme = '${escaped}'` })
    } else if (vocabulary.tags.has(token)) {
      keywords.push({ term: token, filter: `tags LIKE '%${escaped}%'` })
    }
  }

  return keywords
}

/**
 * Plan scan slots based on number of keywords.
 * 0 keywords → 1 unfiltered top-10
 * 1 keyword  → filtered top-5 + unfiltered top-5
 * 2 keywords → 2 filtered top-5 + unfiltered top-5
 * 3+ keywords → 3 filtered top-5
 */
export function planScans(keywords: Keyword[]): ScanPlan[] {
  if (keywords.length === 0) {
    return [{ k: 10 }]
  }
  if (keywords.length === 1) {
    return [{ k: 5, filter: keywords[0].filter }, { k: 5 }]
  }
  if (keywords.length === 2) {
    return [{ k: 5, filter: keywords[0].filter }, { k: 5, filter: keywords[1].filter }, { k: 5 }]
  }
  // 3+
  return keywords.slice(0, 3).map((kw) => ({ k: 5, filter: kw.filter }))
}

/**
 * Multi-scan retrieval: extract keywords, plan scans, run in parallel,
 * deduplicate by ID (keep lowest _distance), return top 10.
 */
export async function multiRetrieve(intent: string): Promise<RetrievedRecord[]> {
  const vocabulary = getVocabulary()
  const keywords = extractKeywords(intent, vocabulary)
  const scans = planScans(keywords)

  const allResults = await Promise.all(scans.map((scan) => retrieve(intent, scan.k, scan.filter)))

  // Deduplicate by ID, keeping lowest _distance
  const bestByID = new Map<string, RetrievedRecord>()
  for (const results of allResults) {
    for (const record of results) {
      const existing = bestByID.get(record.id)
      if (!existing || record._distance < existing._distance) {
        bestByID.set(record.id, record)
      }
    }
  }

  // Sort by _distance ascending, return top 10
  return Array.from(bestByID.values())
    .sort((a, b) => a._distance - b._distance)
    .slice(0, 10)
}
