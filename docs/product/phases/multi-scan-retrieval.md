# Phase 15 — Multi-Scan Retrieval

**Status: Draft**

Replace the single unfiltered vector search with parallel keyword-guided scans for better retrieval across record types.

## Stories

### US-X8 — Dynamic vocabulary from indexed data

As the system, I want to build a vocabulary of person names, tags, and themes at index time, so that keyword extraction can match query terms to data-specific filters.

**Acceptance criteria:**
- After `buildIndex()`, a `Vocabulary` object is available via `getVocabulary()`
- Vocabulary contains unique lowercase person names, tags, and themes from the data
- Vocabulary refreshes on every `buildIndex()` call

### US-X9 — Keyword extraction and scan planning

As the system, I want to extract up to 3 keywords from a query using static dictionary + dynamic vocabulary matching, so that parallel filtered scans target the right subsets.

**Acceptance criteria:**
- Static dictionary maps common terms to `log_type` filters
- Dynamic vocabulary maps person names, tags, themes to metadata filters
- Scan slot allocation follows the brief's table (0 keywords → 1 unfiltered top-10; 1 → filtered + unfiltered; 2 → 2 filtered + unfiltered; 3+ → 3 filtered)
- Keyword extraction is case-insensitive and strips basic punctuation

### US-X10 — Multi-retrieve with merge and dedup

As the system, I want to run parallel filtered vector searches and merge/dedup results to the top 10, so that the lense gets diverse, relevant context.

**Acceptance criteria:**
- `multiRetrieve(intent)` runs parallel scans per the scan plan
- Results are deduped by record ID (keep lowest `_distance`)
- Final results sorted by `_distance` ascending, capped at 10
- `retrieve()` accepts an optional `filter` string for LanceDB `.where()` prefiltering
- `_distance` is included in `RetrievedRecord`
- `/api/lense` uses `multiRetrieve` instead of `retrieve`

## Done-when (observable)

- [ ] `getVocabulary()` returns person names, tags, themes after `buildIndex()` [US-X8]
- [ ] Vocabulary is refreshed on every `buildIndex()` call [US-X8]
- [ ] Keyword extraction maps static terms to log_type filters [US-X9]
- [ ] Keyword extraction maps person names from vocabulary to metadata filters [US-X9]
- [ ] Scan slot allocation follows 0/1/2/3+ keyword rules [US-X9]
- [ ] `multiRetrieve()` runs parallel scans and returns deduped top-10 [US-X10]
- [ ] `retrieve()` supports optional `filter` parameter [US-X10]
- [ ] `_distance` is included in `RetrievedRecord` [US-X10]
- [ ] `/api/lense` uses `multiRetrieve` [US-X10]
- [ ] No new npm dependencies [US-X10]
- [ ] `npm run typecheck` exits 0 [phase]
- [ ] `npm run lint` exits 0 [phase]
- [ ] `npm test` exits 0 with all tests passing [phase]
- [ ] `npm run build` exits 0 [phase]
- [ ] Unit tests cover keyword extraction, vocabulary, scan planning, multi-retrieve [phase]

**AGENTS.md sections affected:**
- Directory layout (new scanner.ts)
- File ownership (scanner.ts entry)
- RAG pipeline description (multi-scan retrieval)

## Golden principles (phase-relevant)
- **Faithful stewardship** — the existing `retrieve()` remains intact as the single-scan primitive; `multiRetrieve` composes it
- **Clarity over complexity** — deterministic keyword matching, no LLM at query time
