## Phase goal

Replace the single unfiltered vector search with parallel keyword-guided scans for better retrieval across record types.

### Stories in scope
- US-X8 — Dynamic vocabulary from indexed data
- US-X9 — Keyword extraction and scan planning
- US-X10 — Multi-retrieve with merge and dedup

### Done-when (observable)

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

### Golden principles (phase-relevant)
- **Faithful stewardship** — the existing `retrieve()` remains intact as the single-scan primitive; `multiRetrieve` composes it
- **Clarity over complexity** — deterministic keyword matching, no LLM at query time
