## Phase goal

Replace the single unfiltered vector search with parallel keyword-guided scans for better retrieval across record types.

### Stories in scope
- US-X8 — Dynamic vocabulary from indexed data
- US-X9 — Keyword extraction and scan planning
- US-X10 — Multi-retrieve with merge and dedup

### Done-when (observable)

- [x] `getVocabulary()` returns person names, tags, themes after `buildIndex()` [US-X8]
- [x] Vocabulary is refreshed on every `buildIndex()` call [US-X8]
- [x] Keyword extraction maps static terms to log_type filters [US-X9]
- [x] Keyword extraction maps person names from vocabulary to metadata filters [US-X9]
- [x] Scan slot allocation follows 0/1/2/3+ keyword rules [US-X9]
- [x] `multiRetrieve()` runs parallel scans and returns deduped top-10 [US-X10]
- [x] `retrieve()` supports optional `filter` parameter [US-X10]
- [x] `_distance` is included in `RetrievedRecord` [US-X10]
- [x] `/api/lense` uses `multiRetrieve` [US-X10]
- [x] No new npm dependencies [US-X10]
- [x] `npm run typecheck` exits 0 [phase]
- [x] `npm run lint` exits 0 [phase]
- [x] `npm test` exits 0 with all tests passing [phase]
- [x] `npm run build` exits 0 [phase]
- [x] Unit tests cover keyword extraction, vocabulary, scan planning, multi-retrieve [phase]

### Golden principles (phase-relevant)
- **Faithful stewardship** — the existing `retrieve()` remains intact as the single-scan primitive; `multiRetrieve` composes it
- **Clarity over complexity** — deterministic keyword matching, no LLM at query time
