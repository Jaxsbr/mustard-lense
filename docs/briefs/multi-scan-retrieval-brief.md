---
date: 2026-03-25
topic: multi-scan-retrieval
status: draft
---

# Intent Brief: Keyword-Guided Multi-Scan Retrieval

## What
Replace the single unfiltered vector search (top-5) with parallel filtered scans based on keywords extracted from the user's query. At index time, generate a dynamic vocabulary from the data (unique person names, tags, themes, categories). At query time, extract up to 3 keywords, map each to a LanceDB `WHERE` filter, run parallel filtered vector searches (top 5 each), and merge/deduplicate results to the top 10 for Claude synthesis.

### Scan slot allocation

| Keywords found | Slot 1 | Slot 2 | Slot 3 |
|---|---|---|---|
| 0 | unfiltered (top 10) | — | — |
| 1 | filtered (top 5) | unfiltered (top 5) | — |
| 2 | filtered (top 5) | filtered (top 5) | unfiltered (top 5) |
| 3+ | filtered (top 5) | filtered (top 5) | filtered (top 5) |

The unfiltered baseline ensures we never do worse than today when keywords are scarce. When 3+ keywords are found, the most specific ones win (person name > tag > log_type).

### Keyword sources

1. **Static dictionary** — hardcoded mappings for common terms:
   - `task`, `todo`, `tasks`, `todos`, `action` → `log_type = 'todo'`
   - `person`, `people` → `log_type = 'people_note'`
   - `log`, `journal`, `day`, `reflection`, `daily` → `log_type = 'daily_log'`
   - `idea`, `ideas`, `brainstorm`, `concept` → `log_type = 'idea'`
2. **Dynamic vocabulary** (generated at index time from actual data):
   - Person names (e.g., `sway`, `charles`, `tatai`) → `log_type = 'people_note' AND person = '<name>'`
   - Tags (e.g., `nextsteps`, `strategic`) → `tags LIKE '%<tag>%'`
   - Themes (e.g., `thesis-reset`) → `theme = '<theme>'`

### Example: "what did sway say about my tasks"

| Keyword | Source | Filter |
|---|---|---|
| `sway` | dynamic vocabulary (person name) | `log_type = 'people_note' AND person = 'sway'` |
| `tasks` | static dictionary | `log_type = 'todo'` |
| — | baseline | no filter |

Three parallel scans, each top 5. Merge all 15, deduplicate by `id`, rank by `_distance`, return top 10 to Claude.

### Merge strategy

LanceDB returns `_distance` on every result (L2 distance — lower is better). After collecting all results:
1. Deduplicate by record `id` (keep the copy with the lowest `_distance`)
2. Sort ascending by `_distance`
3. Take top 10

## Why
Vague or multi-topic queries return poor or no results because a single embedding search over all records misses contextually relevant records from different categories. A query like "is my job in trouble" returns nothing useful today. With parallel filtered scans, the system searches todos, people notes, and daily logs separately, giving Claude diverse context to work with — even if the answer is "your data doesn't indicate that."

The key insight: embedding similarity is good at finding semantically close records, but bad at cross-category discovery. Filtering by metadata (log_type, person, tags) and running separate searches covers the breadth that a single embedding vector cannot.

## Where
- `src/server/rag/indexer.ts` — after building the index, collect unique person names, tags, themes, categories into a `Vocabulary` object stored in a module-level variable. Export a `getVocabulary()` accessor. Refreshed on every `buildIndex()` call (which already runs on startup and after every CRUD operation).
- `src/server/rag/scanner.ts` — **new file**. Keyword extractor (static dictionary + dynamic vocabulary matching), scan planner (produces up to 3 scan plans with WHERE clauses), and `multiRetrieve()` function (parallel execution, merge, dedup, rank).
- `src/server/rag/retriever.ts` — add optional `filter` parameter to `retrieve()` that chains `.where(filter)` onto the LanceDB `vectorSearch()` call. Add `_distance` to the `RetrievedRecord` interface (returned by LanceDB but currently dropped).
- `src/server/app.ts` — replace `deps.retrieve(intent)` with `deps.multiRetrieve(intent)` in the `/api/lense` handler. Update `AppDependencies` interface.
- `src/server/index.ts` — wire `multiRetrieve` from scanner into the app dependencies.
- `src/server/rag/rag.test.ts` — update LanceDB mock to support `.where()` chaining. Add tests for keyword extraction, parallel filtered retrieval, deduplication, and merge ranking.

## Constraints
- Zero new external dependencies — uses existing LanceDB `.where()` prefiltering and existing `Xenova/all-MiniLM-L6-v2` embedding model.
- Zero recurring cost — everything runs locally in-process.
- No API changes — `POST /api/lense` still takes `{ intent }`, SSE event sequence unchanged.
- No UI changes — the improvement is purely in retrieval quality (more/better records fed to Claude).
- The existing `retrieve()` function must remain intact as the single-scan primitive — `multiRetrieve` composes it, doesn't replace it.
- Keyword extraction must be deterministic and fast (pure string matching, no LLM call at query time).
- Query tokenization should be case-insensitive and handle basic punctuation stripping.

## Key decisions
- **Static dictionary + dynamic vocabulary over LLM-based extraction** — deterministic, zero-latency, zero-cost. The vocabulary approach handles the common cases (person names, explicit type references, known tags) without the overhead or unpredictability of an LLM call.
- **LanceDB prefiltering (default) over postfiltering** — prefiltering restricts the search space before vector comparison, ensuring we get the full `limit` results within the filtered subset. Postfiltering could return fewer than 5 if the nearest vectors don't match the filter.
- **Unfiltered baseline in remaining slots** — ensures the feature never degrades results compared to the current single-scan approach. The baseline catches records that no keyword filter would surface.
- **Merge by `_distance` without boosting** — keep it simple. Filtered scans bring in records that would have been missed entirely; their inclusion is the value, not a score adjustment. If ranking quality becomes an issue, boosting is a future knob.
- **Top 10 cap (up from 5)** — gives Claude more context without overwhelming the prompt window. At ~100-500 tokens per record, 10 records is well within budget.
- **Vocabulary in memory (not persisted)** — since `buildIndex()` runs on every startup and after every CRUD operation, the vocabulary is always fresh. No need for a separate persistence layer.

## Open questions
- Should the `thinking` SSE event include scan metadata (e.g., "3 scans: sway notes, todos, baseline") for transparency? Start without and revisit based on usage.
- If the vocabulary grows large (hundreds of tags), should keyword matching use a trie or prefix tree? Likely premature — current data set is small. Monitor at scale.
- Should categories be included in the dynamic vocabulary? Current data rarely uses `category` — include the plumbing but don't over-invest in matching logic.

## Future concepts (captured separately)
- **Fuzzy keyword-to-topic mapping** — semantic/associative mapping from vague terms to record categories without explicit dictionaries. See `docs/concepts/fuzzy-keyword-mapping.md`.
- **Synthesiser prompt enrichment** — telling Claude why certain records were surfaced so it can explain its reasoning or acknowledge data gaps. See `docs/concepts/synthesis-keyword-context.md`.

## Next step
→ spec-author: "define a phase" using this brief as input.
