## Phase goal

Replace the Claude CLI's file-reading tool calls with a local RAG pipeline that pre-retrieves relevant mustard records and injects them inline into the synthesis prompt. Change POST /api/lense from synchronous JSON to an SSE stream with real processing stage events (retrieving → thinking → result). Abstract the synthesis layer behind an interface so it can be swapped from the CLI to the Anthropic SDK in a future phase. Add a manual reindex endpoint.

### Dependencies
- intelligent-lense

### Stories in scope
- US-L10 — Local RAG pipeline with embedding and vector store
- US-L11 — Synthesis layer abstraction
- US-L12 — SSE streaming API with RAG retrieval
- US-L13 — Frontend SSE consumption with stage-based loading

### Done-when (observable)
- [x] `src/server/rag/` directory exists with embedding, indexer, and retriever modules [US-L10]
- [x] Embedding module imports from a transformers.js package and loads the `Xenova/all-MiniLM-L6-v2` model (verifiable by model name string in source) [US-L10]
- [x] Indexer reads all YAML files from a configurable data store path, embeds the `text` field of each record, and writes vectors to a LanceDB table [US-L10]
- [x] Each LanceDB record stores metadata columns: `id`, `log_type`, `capture_date_local`, and type-specific fields where present (`person`, `status`, `due_date_local`, `category`, `theme`, `period`, `tags`) [US-L10]
- [x] Retriever exports a function that accepts a query string and optional `k` parameter (default 5), returns an array of records with `text` and metadata fields [US-L10]
- [x] Indexer creates or overwrites the LanceDB table on each run — not incremental [US-L10]
- [x] Unit tests exist for indexer and retriever using fixture YAML data — `npm test` does not depend on the real mustard data store [US-L10]
- [x] Embedding runs locally in-process — no HTTP calls to external embedding APIs (verifiable by absence of fetch/axios calls in embedding module) [US-L10]
- [x] `package.json` includes a transformers.js package and a LanceDB package as dependencies [US-L10]
- [ ] `src/server/synthesiser.ts` exports a `Synthesiser` interface with a method accepting `intent` (string) and `records` (array of retrieved records), returning `Promise<LenseResponse>` [US-L11]
- [ ] `src/server/synthesiser.ts` exports a `CliSynthesiser` class or function that implements the `Synthesiser` interface by wrapping `invokeClaude` [US-L11]
- [ ] The synthesis prompt injects retrieved records inline with their text and metadata — no file-reading instructions, no data store path reference, no `allowedTools` or `addDirs` in the `invokeClaude` call [US-L11]
- [ ] User intent is wrapped in `<user-intent>` delimiters in the synthesis prompt (existing prompt injection resistance preserved) [US-L11]
- [ ] Retrieved records injected into the prompt are wrapped in explicit delimiters (e.g., `<record>...</record>`) to distinguish data from instructions [US-L11]
- [ ] Error paths return generic messages and log details server-side only — raw LLM output is never included in client-facing error responses [US-L11]
- [ ] Unit tests verify `CliSynthesiser` with mocked `invokeClaude`: success path returns `LenseResponse`, error path returns generic error without leaking raw output [US-L11]
- [ ] `POST /api/lense` returns `Content-Type: text/event-stream` [US-L12]
- [ ] The SSE stream emits named events in order: `retrieving`, `thinking`, `result` [US-L12]
- [ ] The `result` event `data` field parses as JSON with a `components` array matching the existing `LenseResponse` shape [US-L12]
- [ ] An `error` event is emitted on stream failure with a generic error message (no stack traces, no raw LLM output) [US-L12]
- [ ] Intent validation (type check, empty check, max length) returns HTTP 400 JSON response before opening the SSE stream [US-L12]
- [ ] `POST /api/reindex` triggers a full vector index rebuild and returns HTTP 200 with `{ "status": "ok", "records": <count> }` on success [US-L12]
- [ ] `POST /api/reindex` returns HTTP 500 with a structured JSON error body (not a raw stack trace) when indexing fails [US-L12]
- [ ] Server entry point (`src/server/index.ts`) triggers vector index build on startup before accepting requests [US-L12]
- [ ] Unit tests mock retriever and synthesiser and verify the SSE event sequence (`retrieving` → `thinking` → `result`) [US-L12]
- [ ] Unit test verifies `POST /api/reindex` returns 200 with record count [US-L12]
- [ ] `smoke:lense` script updated to read the SSE stream and extract the `result` event instead of calling `res.json()` [US-L12]
- [ ] Diagnostic timing is logged server-side for retrieval and synthesis stages (console output includes retrieval and synthesis durations) [US-L12]
- [ ] Frontend sends `POST` to `/api/lense` and reads the response as an SSE stream [US-L13]
- [ ] "Finding records..." text is visible in the DOM during the `retrieving` stage [US-L13]
- [ ] "Thinking..." text is visible in the DOM during the `thinking` stage [US-L13]
- [ ] Stage transitions have CSS `animation` or `transition` properties (verifiable by computed style or class presence) [US-L13]
- [ ] Result components render when the `result` SSE event arrives (same component rendering pipeline as before) [US-L13]
- [ ] An `error` SSE event renders an error message in the DOM (not a browser alert or console-only error) [US-L13]
- [ ] New query clears previous results before showing stage indicators (always-replace behavior preserved) [US-L13]
- [ ] Input value resets to empty string after submit (existing behavior preserved) [US-L13]
- [ ] Playwright E2E test mocks the SSE endpoint and verifies: stage indicator appears during processing, at least one result component renders after the `result` event [US-L13]
- [ ] Playwright E2E test verifies an `error` SSE event renders an error message in the DOM [US-L13]
- [ ] "Using the Lense" documentation updated to describe the stage-based loading experience (stage names and what they mean) [US-L13]
- [ ] `AGENTS.md` reflects new RAG modules (`src/server/rag/`), synthesiser (`src/server/synthesiser.ts`), SSE streaming on `POST /api/lense`, and `POST /api/reindex` endpoint introduced in this phase [phase]

### Golden principles (phase-relevant)
- **Great Commission ambition + nonprofit stewardship** — zero recurring cost architecture: local embedding (transformers.js), local vector store (LanceDB), no external APIs for retrieval. Every dollar is donor-trust money.
- **Faithful stewardship** — RAG retrieval quality is the highest-leverage code in this phase; k=5 validated by POC benchmarking. Get the embedding and retrieval right.
- **People first** — SSE stage events give honest, purposeful feedback; "Finding records..." and "Thinking..." respect user attention more than a static spinner.
- **Clarity over complexity** — server-start indexing + manual reindex over file-system watchers; synthesis interface is minimal (one method). No premature abstraction.
- **Continuous improvement** — synthesis interface enables future SDK swap without rework; RAG pipeline enables future dynamic-k, metadata filtering, and full-scan optimizations.
