# Mustard Lense

## Purpose
Claude Code integrated interface for the mustard data store, enabling natural conversation for managing and viewing mustard data. Experiments with dynamic UI generation — serving contextual UI based on data and actionable requests. Supports favourite/reusable UI elements that grow the app based on user usage patterns.

## Directory layout

```
mustard-lense/
├── src/
│   ├── App.tsx              # Lense page — input, SSE stage loading, result rendering
│   ├── App.css              # Lense page styles with stage and result animations
│   ├── index.css            # Global reset
│   ├── main.tsx             # React entry point
│   ├── components/
│   │   ├── ResultRenderer.tsx    # Component registry — maps type string to renderer
│   │   ├── TodoList.tsx          # todo-list component renderer
│   │   ├── LogTimeline.tsx       # log-timeline component renderer
│   │   ├── PersonNotes.tsx       # person-notes component renderer
│   │   ├── IdeaList.tsx          # idea-list component renderer
│   │   ├── Summary.tsx           # summary component renderer
│   │   ├── FallbackComponent.tsx # Fallback for unknown component types
│   │   ├── components.css        # Shared component styles
│   │   └── tokens.css            # Design tokens (CSS variables)
│   ├── shared/
│   │   └── schema.ts        # Response schema — TypeScript interfaces for component types
│   ├── server/
│   │   ├── app.ts            # Express app with POST /api/lense (SSE) and POST /api/reindex
│   │   ├── index.ts          # Server entry point — builds index on startup, then listens on port 3001
│   │   ├── synthesiser.ts    # Synthesiser interface + CliSynthesiser (wraps invokeClaude)
│   │   ├── synthesiser.test.ts # Unit tests for CliSynthesiser (mocked invokeClaude)
│   │   ├── server.test.ts    # API endpoint unit tests (mocked retriever + synthesiser)
│   │   └── rag/
│   │       ├── embedder.ts   # Embedding wrapper — transformers.js, Xenova/all-MiniLM-L6-v2
│   │       ├── indexer.ts    # Reads YAML, generates embeddings, writes to LanceDB
│   │       ├── retriever.ts  # Embeds query, similarity search, returns top-k records
│   │       └── rag.test.ts   # Unit tests for indexer + retriever (fixture data, mocked embedder)
│   ├── lib/
│   │   ├── claude-cli.ts     # Claude CLI integration — invokeClaude(), ClaudeResult
│   │   └── claude-cli.test.ts  # Mocked unit tests (vi.mock child_process)
│   └── smoke/
│       ├── basic.ts          # On-demand smoke test — basic mode
│       ├── admin.ts          # On-demand smoke test — admin mode
│       └── lense.ts          # On-demand smoke test — lense E2E (reads SSE stream)
├── e2e/
│   └── lense.spec.ts        # Playwright E2E tests (mocked SSE endpoint)
├── docs/
│   ├── architecture/ARCHITECTURE.md
│   ├── briefs/              # Phase briefs from spec-author
│   ├── plan/                # Build loop state
│   └── product/             # PRD and specs
├── index.html               # SPA shell with viewport meta
├── vite.config.ts           # Dev server port 5234, Vite proxy /api -> 3001
├── playwright.config.ts     # Playwright E2E config
├── tsconfig.json            # Project references root
├── tsconfig.app.json        # App TS config (strict, node types)
├── tsconfig.node.json       # Node TS config (vite + playwright configs)
├── eslint.config.js         # ESLint config
└── package.json             # Scripts: dev, build, lint, typecheck, test, smoke:*, test:e2e
```

## File ownership

| Path | Owner | Notes |
|------|-------|-------|
| `src/lib/claude-cli.ts` | CLI module | Exports `invokeClaude`, `ClaudeResult`, `ClaudeMode` |
| `src/lib/claude-cli.test.ts` | Tests | Mocked unit tests — no real CLI invoked |
| `src/shared/schema.ts` | Schema | Response schema — 5 component types, shared by server and frontend |
| `src/server/app.ts` | API server | Express app with POST /api/lense (SSE) and POST /api/reindex. Uses dependency injection (createApp). |
| `src/server/index.ts` | Entry point | Builds vector index on startup, wires real dependencies, starts server |
| `src/server/synthesiser.ts` | Synthesis | Synthesiser interface + CliSynthesiser — wraps invokeClaude with inline records |
| `src/server/synthesiser.test.ts` | Tests | CliSynthesiser tests — mocked invokeClaude, success + error paths |
| `src/server/rag/embedder.ts` | RAG | Singleton embedding pipeline — transformers.js, Xenova/all-MiniLM-L6-v2, 384d vectors |
| `src/server/rag/indexer.ts` | RAG | Reads YAML from configurable path, embeds text, writes to LanceDB with metadata |
| `src/server/rag/retriever.ts` | RAG | Embeds query, performs LanceDB vector search, returns top-k records (default k=5) |
| `src/server/rag/rag.test.ts` | Tests | Indexer + retriever tests with fixture YAML data, mocked embedder + LanceDB |
| `src/server/server.test.ts` | Tests | API endpoint tests with mocked retriever + synthesiser — verifies SSE event sequence |
| `src/components/ResultRenderer.tsx` | Registry | Maps component type string to React renderer |
| `src/components/*.tsx` | Renderers | Template components for each mustard data type |
| `src/App.tsx` | UI | Lense page — input, SSE stage indicators ("Finding records...", "Thinking..."), animated results |
| `src/smoke/*.ts` | Smoke tests | On-demand, invoke real CLI/API — NOT run by `npm test` |
| `e2e/*.spec.ts` | E2E tests | Playwright tests with mocked SSE endpoint — NOT run by `npm test` |

## Lense interaction model

- **Intent in, view out** — no chat UI, no conversation thread. User types natural language, results replace previous.
- **Always-replace** — each query clears the current view, shows stage indicators, renders new results.
- **SSE streaming** — POST /api/lense returns Server-Sent Events: `retrieving` → `thinking` → `result`. Frontend shows real-time stage feedback.
- **Template rendering** — Claude returns structured JSON, frontend renders pre-built components (not raw text).
- **Basic mode only** — the lense reads data, doesn't modify it. No admin permissions needed.

## RAG pipeline

- **Embedding** — transformers.js with `Xenova/all-MiniLM-L6-v2` (384d vectors). Local, in-process, zero external API calls.
- **Vector store** — LanceDB (embedded, no server process). Table created/overwritten on each index run.
- **Indexing** — reads YAML files from `~/dev/mustard/data/`, embeds `text` field, stores metadata columns (id, log_type, capture_date_local, person, status, due_date_local, category, theme, period, tags). Triggered on server start + POST /api/reindex.
- **Retrieval** — embeds query string, similarity search, returns top-k records (default k=5).
- **Synthesis** — CliSynthesiser wraps invokeClaude in basic mode. Records injected inline in `<record>` delimiters, intent in `<user-intent>` delimiters. No file access — LLM receives data, not filesystem.

## Response schema

The synthesiser returns JSON with a `components` array. Each component has:
- `type` — discriminator: `todo-list`, `log-timeline`, `person-notes`, `idea-list`, `summary`
- `data` — typed object specific to the component type

Defined in `src/shared/schema.ts`, used by both server and frontend.

## CLI modes

- **basic** — default, restricted permissions. Spawns `claude -p <prompt>`.
- **admin** — explicit opt-in, unrestricted. Spawns `claude --dangerously-skip-permissions -p <prompt>`. Never the default.

## Testing

- `npm test` — Vitest unit tests (37 tests: 8 CLI + 11 server + 9 synthesiser + 7 RAG + 2 reserved) with mocked dependencies
- `npm run test:e2e` — Playwright E2E tests with mocked SSE endpoint
- `npm run smoke:basic` / `npm run smoke:admin` — real CLI invocation
- `npm run smoke:lense` — real E2E through API + RAG + Claude + data store (reads SSE stream)
- Smoke tests are excluded from Vitest (in `src/smoke/`, not `*.test.ts`)
- E2E tests are excluded from Vitest (in `e2e/`, configured in vite.config.ts)

## Quality checks

- no-silent-pass
- no-bare-except
- error-path-coverage
- agents-consistency
