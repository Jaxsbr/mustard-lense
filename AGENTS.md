# Mustard

## Purpose
Claude Code integrated interface for the mustard data store, enabling natural conversation for managing and viewing mustard data. Split-screen app: collapsible CRUD panel on the left for structured browse, AI-powered lense on the right for natural language queries. Experiments with dynamic UI generation — serving contextual UI based on data and actionable requests.

## Directory layout

```
mustard-lense/
├── src/
│   ├── App.tsx              # Split-screen layout — CRUD panel (left) + lense (right)
│   ├── App.css              # Layout, lense stage, and result animation styles
│   ├── index.css            # Global reset
│   ├── main.tsx             # React entry point
│   ├── components/
│   │   ├── ResultRenderer.tsx    # Component registry — maps type string to renderer
│   │   ├── TodoList.tsx          # todo-list component renderer (lense results)
│   │   ├── LogTimeline.tsx       # log-timeline component renderer
│   │   ├── PersonNotes.tsx       # person-notes component renderer
│   │   ├── IdeaList.tsx          # idea-list component renderer
│   │   ├── Summary.tsx           # summary component renderer
│   │   ├── FallbackComponent.tsx # Fallback for unknown component types
│   │   ├── components.css        # Shared component styles
│   │   ├── tokens.css            # Design tokens (CSS variables): warm gold palette, type colors, dark mode overrides
│   │   └── panel/
│   │       ├── CrudPanel.tsx     # Collapsible panel with type tabs, list views, drawer, sort/limit
│   │       ├── CrudPanel.css     # Panel, tab, list, and add button styles
│   │       ├── CrudPanel.test.tsx # Unit tests for panel tabs and rendering
│   │       ├── DetailDrawer.tsx  # Slide-over drawer for viewing/editing/creating records
│   │       ├── DetailDrawer.css  # Drawer, form, and backdrop styles
│   │       ├── MarkdownEditor.tsx # Dual-mode editor (raw/styled) with TipTap, EditorToolbar inline
│   │       ├── MarkdownEditor.css # Editor surface, mode toggle, toolbar styles (all design tokens)
│   │       ├── MarkdownEditor.test.tsx # Tests: mode toggle, toolbar, markdown round-trip
│   │       ├── markdown-utils.ts # markdownToHtml / htmlToMarkdown conversion helpers
│   │       ├── ListControls.tsx  # Sort dropdown + limit control above record list
│   │       ├── ListControls.css  # Controls bar styles
│   │       ├── ListItems.tsx     # Type-specific list item components
│   │       ├── ListItems.css     # List item styles with type-colored left indicators
│   │       ├── sort.ts           # Sort logic — newest, oldest, status (open first)
│   │       ├── sort.test.ts      # Unit tests for sort logic
│   │       └── types.ts          # Tab definitions and PanelRecord type alias
│   ├── shared/
│   │   └── schema.ts        # Response schema — TypeScript interfaces for component types
│   ├── server/
│   │   ├── app.ts            # Express app: POST /api/lense (SSE), POST /api/reindex, GET /api/records, POST /api/records, PUT /api/records/:id
│   │   ├── index.ts          # Server entry point — builds index on startup, wires deps, listens on 3001
│   │   ├── synthesiser.ts    # Synthesiser interface + CliSynthesiser (wraps invokeClaude)
│   │   ├── synthesiser.test.ts # Unit tests for CliSynthesiser (mocked invokeClaude)
│   │   ├── server.test.ts    # API endpoint unit tests (mocked deps)
│   │   ├── data/
│   │   │   ├── reader.ts     # Reads YAML records from configurable data directory (MUSTARD_DATA_DIR)
│   │   │   └── writer.ts     # Creates and updates YAML record files with UUID generation
│   │   └── rag/
│   │       ├── embedder.ts   # Embedding wrapper — transformers.js, Xenova/all-MiniLM-L6-v2
│   │       ├── indexer.ts    # Imports from data/reader, generates embeddings, writes to LanceDB
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
│   └── lense.spec.ts        # Playwright E2E tests (mocked SSE endpoint + mocked records API)
├── docs/
│   ├── architecture/ARCHITECTURE.md
│   ├── briefs/              # Phase briefs from spec-author
│   ├── manual/layout.md     # User guide — split-screen layout, tabs, list views, dark mode
│   ├── manual/editing.md    # User guide — detail drawer, editing records, Add button
│   ├── plan/                # Build loop state
│   └── product/             # PRD and specs
├── .env.example             # Documents MUSTARD_DATA_DIR env var
├── index.html               # SPA shell with viewport meta + inline theme script (prevents FOUC)
├── vite.config.ts           # Dev server port 5234, Vite proxy /api -> 3001
├── playwright.config.ts     # Playwright E2E config
├── tsconfig.json            # Project references root
├── tsconfig.app.json        # App TS config (strict, node types)
├── tsconfig.node.json       # Node TS config (vite + playwright configs)
├── eslint.config.js         # ESLint config
└── package.json             # Scripts: dev, build, lint, typecheck, test, smoke:*, test:e2e, start
```

## File ownership

| Path | Owner | Notes |
|------|-------|-------|
| `src/lib/claude-cli.ts` | CLI module | Exports `invokeClaude`, `ClaudeResult`, `ClaudeMode` |
| `src/lib/claude-cli.test.ts` | Tests | Mocked unit tests — no real CLI invoked |
| `src/shared/schema.ts` | Schema | Response schema — 5 component types, shared by server and frontend |
| `src/server/app.ts` | API server | Express app: POST /api/lense (SSE), POST /api/reindex, GET /api/records, POST /api/records, PUT /api/records/:id, DELETE /api/records/:id. Uses dependency injection (createApp). |
| `src/server/index.ts` | Entry point | Builds vector index on startup, wires real dependencies, serves `dist/` static files in production, starts server |
| `src/server/data/reader.ts` | Data reader | Reads YAML records from `MUSTARD_DATA_DIR` (default `~/dev/mustard/data/`). Exports `readRecords`, `getDataDir`, `findYamlFiles`. Shared by browse API, RAG indexer, and writer. |
| `src/server/data/writer.ts` | Data writer | Creates, updates, and deletes YAML record files. Exports `createRecord`, `updateRecord`, `deleteRecord`, `validateLogType`, `validateText`. UUID generation, auto-filled metadata, log_type-to-subdirectory mapping. |
| `src/server/synthesiser.ts` | Synthesis | Synthesiser interface + CliSynthesiser — wraps invokeClaude with inline records |
| `src/server/synthesiser.test.ts` | Tests | CliSynthesiser tests — mocked invokeClaude, success + error paths |
| `src/server/rag/embedder.ts` | RAG | Singleton embedding pipeline — transformers.js, Xenova/all-MiniLM-L6-v2, 384d vectors |
| `src/server/rag/indexer.ts` | RAG | Imports readRecords from data/reader, embeds text, writes to LanceDB with metadata |
| `src/server/rag/retriever.ts` | RAG | Embeds query, performs LanceDB vector search, returns top-k records (default k=5) |
| `src/server/rag/rag.test.ts` | Tests | Indexer + retriever tests with fixture YAML data, mocked embedder + LanceDB |
| `src/server/server.test.ts` | Tests | API endpoint tests with mocked deps — verifies SSE events, browse endpoint, reindex, create, update, delete |
| `src/components/ResultRenderer.tsx` | Registry | Maps component type string to React renderer |
| `src/components/*.tsx` | Renderers | Template components for each mustard data type |
| `src/components/panel/CrudPanel.tsx` | CRUD panel | Collapsible panel with type tabs, list views, detail drawer, sort/limit controls, Add button, localStorage prefs, celebration animations (create/edit/delete) |
| `src/components/panel/CrudPanel.test.tsx` | Tests | Unit tests for tab rendering, active state, fetch, loading, empty state |
| `src/components/panel/DetailDrawer.tsx` | Detail drawer | Slide-over drawer for viewing/editing/creating/deleting records, type-specific form fields, inline delete confirmation, composes MarkdownEditor for text field |
| `src/components/panel/MarkdownEditor.tsx` | Markdown editor | Dual-mode editor (raw textarea / styled TipTap), mode toggle with localStorage persistence, EditorToolbar (9 actions, no underline) |
| `src/components/panel/markdown-utils.ts` | Markdown utils | markdownToHtml / htmlToMarkdown conversion for TipTap ↔ Markdown round-trip |
| `src/components/panel/MarkdownEditor.test.tsx` | Tests | Mode toggle, localStorage, toolbar 9 controls, markdown round-trip, rapid mount/unmount |
| `src/components/panel/ListControls.tsx` | List controls | Sort dropdown (newest, oldest, status) + limit control (default 25) + Show all |
| `src/components/panel/ListItems.tsx` | List views | Type-specific list item components: TodoListItem, PeopleListItem, IdeaListItem, DailyLogListItem |
| `src/components/panel/sort.ts` | Sort logic | Sort functions: newest first, oldest first, status grouping (open → parked → done) |
| `src/components/panel/sort.test.ts` | Tests | Unit tests for sort logic: date asc, date desc, status grouping |
| `src/App.tsx` | UI | Split-screen layout — CRUD panel (left, collapsible ~40%), lense (right, always visible). Theme toggle. Responsive at 768px. |
| `src/smoke/*.ts` | Smoke tests | On-demand, invoke real CLI/API — NOT run by `npm test` |
| `e2e/*.spec.ts` | E2E tests | Playwright tests with mocked SSE + records API — NOT run by `npm test` |

## App layout

- **Split-screen** — CRUD panel on left (~40% width), lense on right (fills remaining). Flex layout.
- **Panel toggle** — collapses/expands the CRUD panel. Auto-collapses at viewports below 768px.
- **Theme toggle** — button next to "Mustard" heading. Toggles `data-theme` attribute on `<html>`. Persists to `localStorage` key `mustard-theme`.
- **Title** — "Mustard" (not "Mustard Lense").

## Design tokens and dark mode

- **Token file** — `src/components/tokens.css`. All design values defined as `--lense-*` CSS custom properties.
- **Font sizes** — `--lense-font-size-xs` (0.75rem), `--lense-font-size-sm` (0.9rem), `--lense-font-size-base` (1rem), `--lense-font-size-lg` (1.25rem). All panel/drawer CSS uses these tokens — no hardcoded font-size values.
- **Warm gold palette** — accent `#c8982c`, background `#faf9f6`, type-specific colors (todo `#4a7fc4`, people `#7b5ea7`, daily `#e07850`, idea `#2d9574`), success/error tokens.
- **Dark mode** — `[data-theme="dark"]` selector overrides all color tokens. `@media (prefers-color-scheme: dark) { html:not([data-theme="light"]) }` provides system-preference fallback.
- **No-flash** — inline `<script>` in `index.html` applies saved theme before React hydrates.
- **Type-specific colors** — tabs and list items use `--lense-color-type-*` tokens for active borders, count badges, left indicators, and hover states (`--lense-color-type-*-hover` tokens for light and dark mode).

## CRUD panel

- **Type tabs** — Todos, People, Ideas, Daily Logs. Each tab fetches `GET /api/records?type=<log_type>`.
- **Active tab** — distinguished via `aria-selected` attribute, `.crud-panel-tab--active` CSS class, and type-specific border color (e.g., `--lense-color-type-todo` for Todos tab).
- **Count badges** — each tab shows a record count.
- **Type-specific list views** — TodoListItem (status + text + due date), PeopleListItem (person bold + text + date), IdeaListItem (status + text), DailyLogListItem (date + theme + text).
- **Empty state** — "No records found." when a tab has zero records.
- **Add button** — "+" in panel header, opens detail drawer in create mode with active tab type pre-selected.
- **Sort controls** — dropdown above list: "Newest first" (default), "Oldest first", "Status (open first)" (todo only). Client-side sort, no API call.
- **Limit control** — "Show" dropdown (default 25) with "Show all" link when more records exist.
- **localStorage persistence** — sort and limit prefs saved per tab: `mustard-sort-{type}`, `mustard-limit-{type}`.
- **List interaction polish** — type-specific hover background colors (`--lense-color-type-*-hover`), click feedback (scale), tab content crossfade animation (180ms), drawer backdrop fade-in.
- **Celebration animations** — CSS-only `@keyframes`: create burst on active tab, edit shimmer on updated list item, delete farewell (tilt/shrink/fade) on departing item. No JS animation libraries.

## Detail drawer

- **Slide-over** — overlays from the right, `min(520px, 90vw)` wide. CSS slide transition. Text textarea uses flex layout to fill remaining vertical space (no fixed `rows` constraint).
- **Edit mode** — click a list item. Shows all fields in editable form inputs. `log_type` and `id` are read-only.
- **Create mode** — click Add button. Empty form, `log_type` changeable via dropdown, `text` auto-focused.
- **Markdown editor** — text field uses `MarkdownEditor` with raw/styled mode toggle. Raw mode: plain textarea. Styled mode: TipTap rich editor with formatting toolbar (9 actions). Mode persisted in `localStorage` key `mustard-text-mode`. Both modes serialize to plain Markdown string — no API changes.
- **Type-specific fields** — todo: text (textarea), status (dropdown), due_date (date input). people_note: text, person. idea: text, status. daily_log: text, theme.
- **Save** — PUT `/api/records/:id` (edit) or POST `/api/records` (create). Drawer closes, list refreshes, counts update. Create triggers tab celebration animation; edit triggers shimmer on updated list item.
- **Delete** — visible in edit mode only. Two-step inline confirmation (no browser `confirm()`). Calls DELETE `/api/records/:id`. Departing item plays farewell animation.
- **Close** — button or backdrop click (backdrop fades in). No save.
- **Validation** — Save disabled when text is empty.

## Write API

- **POST /api/records** — creates a record. Requires `log_type` (allowlist: todo, people_note, idea, daily_log) and `text` (non-empty, max 10000 chars). Auto-generates UUID `id`, `capture_date_local` (today), `source: mustard-app`, `meta: { tags: [] }`. Returns 201. Triggers background reindex.
- **PUT /api/records/:id** — updates a record by ID. UUID format validated. Uses ID-to-filepath scan (no path interpolation). Returns 200. Returns 404 if not found. Triggers background reindex.
- **DELETE /api/records/:id** — deletes a record by ID. UUID format validated. Uses ID-to-filepath scan via `deleteRecord` (no path interpolation). Removes YAML file from disk. Returns 200 with `{ id }`. Returns 404 if not found. Triggers background reindex. `DELETE /api/records` (no ID) returns 400 JSON.
- **Validation** — log_type allowlist, text non-empty + max length, UUID format on PUT/DELETE. 400 for invalid input, 500 with structured error on write failure.

## Lense interaction model

- **Intent in, view out** — no chat UI, no conversation thread. User types natural language, results replace previous.
- **Always-replace** — each query clears the current view, shows stage indicators, renders new results.
- **SSE streaming** — POST /api/lense returns Server-Sent Events: `retrieving` → `thinking` → `result`. Frontend shows real-time stage feedback.
- **Template rendering** — Claude returns structured JSON, frontend renders pre-built components (not raw text).
- **Basic mode only** — the lense reads data, doesn't modify it. No admin permissions needed.

## Data configuration

- **`MUSTARD_DATA_DIR`** — env var for the mustard data directory path. Defaults to `~/dev/mustard/data/`. Used by both the browse API (`GET /api/records`) and the RAG indexer.
- **`.env.example`** — documents the env var with description and default value.

## RAG pipeline

- **Embedding** — transformers.js with `Xenova/all-MiniLM-L6-v2` (384d vectors). Local, in-process, zero external API calls.
- **Vector store** — LanceDB (embedded, no server process). Table created/overwritten on each index run.
- **Indexing** — imports `readRecords` from `data/reader.ts`, embeds `text` field, stores metadata columns. Triggered on server start + POST /api/reindex.
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

- `npm test` — Vitest unit tests (96 tests: 8 CLI + 36 server + 9 synthesiser + 7 RAG + 7 panel + 5 sort + 17 markdown editor + 7 reserved) with mocked dependencies
- `npm start` — builds and runs production server on port 7777 (serves `dist/` + API on single port)
- `npm run test:e2e` — Playwright E2E tests with mocked SSE endpoint and mocked records API
- `npm run smoke:basic` / `npm run smoke:admin` — real CLI invocation
- `npm run smoke:lense` — real E2E through API + RAG + Claude + data store (reads SSE stream)
- Smoke tests are excluded from Vitest (in `src/smoke/`, not `*.test.ts`)
- E2E tests are excluded from Vitest (in `e2e/`, configured in vite.config.ts)

## Quality checks

- no-silent-pass
- no-bare-except
- error-path-coverage
- agents-consistency
- token-consumer-check
- e2e-route-coverage
