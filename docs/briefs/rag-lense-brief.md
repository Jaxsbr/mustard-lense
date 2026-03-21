---
date: 2026-03-21
topic: rag-lense
status: draft
---

# Intent Brief: RAG-accelerated Lense

## What

Replace the Claude CLI's file-reading tool calls with a local RAG pipeline that pre-retrieves relevant mustard records and injects them inline into the prompt. Add Server-Sent Events (SSE) so the frontend shows real processing stages ("Finding records...", "Thinking...") instead of a static spinner. Abstract the synthesis layer (CLI today) behind an interface so it can be swapped to the Anthropic SDK later without touching retrieval or frontend code.

## Data source

The RAG pipeline indexes records from the **mustard** project's data store — a separate project at `~/dev/mustard/data/`. Each record is a single YAML file identified by UUID.

**Structure (80 files total as of 2026-03-21):**

```
~/dev/mustard/data/
├── todos/<YYYY>/<MM>/<uuid>.yaml          — 54 files
├── daily_logs/<YYYY>/<MM>/<uuid>.yaml     —  6 files
├── ideas/<YYYY>/<MM>/<uuid>.yaml          —  3 files
└── people_notes/<person>/<YYYY>/<MM>/<uuid>.yaml — 17 files
```

**Common fields across all record types:**
- `id` — UUID
- `log_type` — `todo` | `daily_log` | `idea` | `people_note`
- `capture_date_local` — date string (YYYY-MM-DD)
- `text` — main content (plain text, can be multi-line and lengthy)
- `meta.tags` — keyword array (used by mustard's YAKE tagger)

**Type-specific fields:**
- Todos: `status`, `due_date_local`, `category`
- Daily logs: `theme`, `period`
- People notes: `person`
- Ideas: `status`

Each YAML file is a natural embedding chunk — one record, one vector. Only the `text` field is embedded. The remaining fields (`id`, `log_type`, `capture_date_local`, `person`, `status`, `due_date_local`, `category`, `theme`, `period`, `meta.tags`) are stored as metadata columns on the LanceDB record for potential filtering and for inclusion in the prompt context injected alongside retrieved records.

## Why

The current architecture takes ~50 seconds per query because the CLI makes dozens of Read/Glob tool-call round trips across 80+ YAML files. POC benchmarking (2026-03-21) proved that injecting 5 records inline drops focused queries to ~8s and synthesis queries to ~24s — both dominated by CLI cold start and reasoning time, not data retrieval. The RAG approach meets the sub-20s target for the common case (focused queries) and SSE loading stages make longer synthesis queries feel purposeful rather than broken.

## Where

- **New: `src/server/rag/`** — RAG module containing indexer (reads YAML, generates embeddings, writes to LanceDB), retriever (embeds intent, similarity search, returns top-k records), and embedding wrapper (transformers.js).
- **Modified: `src/server/prompt.ts`** — Prompt construction changes from "read these directories" to "here are the relevant records" with records injected inline. CLI tool permissions (Read/Glob) removed from prompt.
- **Modified: `src/server/app.ts`** — `POST /api/lense` keeps its verb and request shape (`{ "intent": "..." }`) but the response changes from synchronous JSON to an SSE stream (`Content-Type: text/event-stream`). The stream emits stage events (`retrieving`, `thinking`) followed by a final `result` event containing the components JSON. This is the same pattern used by LLM streaming APIs — POST in, streamed response out. Existing smoke test (`smoke:lense`) will need updating to read the stream. New `POST /api/reindex` endpoint for manual re-index trigger.
- **New: `src/server/synthesiser.ts`** — Synthesis layer interface. Initial implementation wraps `invokeClaude` (CLI). Designed so a future Anthropic SDK implementation can be swapped in.
- **Modified: `src/App.tsx`** — Frontend reads SSE stream, renders stage-based loading messages, then components on completion.
- **Modified: `src/components/`** — Loading stage UI components (stage indicator with animated transitions between stages).

## Constraints

- **Zero recurring cost.** Local embedding model (transformers.js, `all-MiniLM-L6-v2`) and local vector store (LanceDB). No API keys, no external services for retrieval.
- **Existing tests must pass.** 19 unit tests (8 CLI + 11 server) and Playwright E2E tests must not break. Server tests that mock `invokeClaude` will need updating to reflect the new RAG + synthesis flow.
- **Basic CLI mode only.** RAG retrieval replaces file reading — no admin permissions needed. The CLI receives pre-retrieved data, not filesystem access.
- **k=5 default.** Start with 5 retrieved records. Tunable, but the POC validated this produces good results for both focused and synthesis queries.
- **Index refresh: server start + manual.** Vector index rebuilds on server boot (guarantees freshness) and via `POST /api/reindex` (on-demand during development or after mustard data changes). During the implementation cycle the first index may be triggered manually — if not, the first lense query simply takes longer while the index builds. No background indexing or "not ready" status needed.
- **Pre-computed summaries out of scope.** Deferred to a future phase. This phase focuses on the core RAG pipeline and loading UX.
- **Cross-cutting query optimisation out of scope.** Broad intents ("show me everything from this week") may under-retrieve with k=5. Acceptable for now — optimisation (dynamic k, full-scan mode) deferred to a later phase.

## Key decisions

- **LanceDB over ChromaDB/SQLite-vec:** Embedded, no server process, strong JS/TS support, zero config. Fits the TypeScript stack and zero-cost constraint.
- **Local transformers.js over OpenAI ada:** Zero recurring cost, runs in-process, no external API dependency. Aligns with nonprofit stewardship principle.
- **SSE over client-timed stages:** Real stage transitions from the server (retrieval done → thinking) rather than fake timed messages. More honest, more lovable, marginal additional complexity.
- **Synthesis layer abstraction:** CLI today, SDK-swappable later. The ~7s CLI cold start is acceptable for now, but the architecture shouldn't lock us in. A future phase can add an Anthropic SDK synthesiser and eliminate the cold start entirely (sub-3s focused queries).
- **Server start + manual index refresh over file-system watch:** Simple, reliable, no watcher complexity. Data store changes infrequently enough that boot-time indexing plus on-demand re-index covers the use case.

## Open questions

None — ready for spec.

## Next step

→ spec-author: "define a phase" using this brief as input.
