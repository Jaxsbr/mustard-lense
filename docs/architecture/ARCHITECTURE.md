# Mustard Lense — Architecture

## System topology

```
┌─────────────────────────────────────┐
│         Browser (React SPA)         │
│ localhost:5234 (dev) / :7777 (prod) │
│                                     │
│  ┌──────────┐  ┌─────────────────┐  │
│  │  Lense   │  │    Template     │  │
│  │  Input   │──│   Renderers     │  │
│  │          │  │                 │  │
│  │  Stage   │  │  (planned for   │  │
│  │  Loading │  │   rag-lense:    │  │
│  │  (SSE)   │  │   reads SSE     │  │
│  └──────────┘  │   stream)       │  │
│                └─────────────────┘  │
└──────────────┬──────────────────────┘
               │ POST /api/lense (SSE stream)
               │ POST /api/reindex
               │ DELETE /api/records/:id (planned for living-polish)
               ▼
┌─────────────────────────────────────┐
│         API Server (Express)        │
│         src/server/app.ts           │
│                                     │
│  ┌──────────┐  ┌─────────────────┐  │
│  │  System   │  │   Response      │  │
│  │  Prompt   │  │   Schema        │  │
│  └──────────┘  └─────────────────┘  │
│                                     │
│  (planned for rag-lense phase:)     │
│  ┌──────────────────────────────┐   │
│  │  RAG Pipeline                │   │
│  │  src/server/rag/             │   │
│  │  ┌────────┐ ┌──────────────┐ │   │
│  │  │Embedder│ │   LanceDB    │ │   │
│  │  │(local) │→│ Vector Store │ │   │
│  │  └────────┘ └──────────────┘ │   │
│  │  ┌────────┐ ┌──────────────┐ │   │
│  │  │Indexer │ │  Retriever   │ │   │
│  │  │        │ │  (top-k=5)   │ │   │
│  │  └────────┘ └──────────────┘ │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │  Synthesiser Interface       │   │
│  │  src/server/synthesiser.ts   │   │
│  │  └─ CliSynthesiser (current) │   │
│  │  └─ SdkSynthesiser (future)  │   │
│  └──────────────────────────────┘   │
└──────────────┬──────────────────────┘
               │ invokeClaude(basic)
               │ (no file access — records injected inline)
               ▼
┌─────────────────────────────────────┐
│       Claude Code CLI Module        │
│         src/lib/claude-cli.ts       │
│  ┌───────────┐  ┌────────────────┐  │
│  │ basic mode│  │  admin mode    │  │
│  │ (default) │  │ (--dangerously │  │
│  │           │  │  -skip-perms)  │  │
│  └───────────┘  └────────────────┘  │
└──────────────┬──────────────────────┘
               │ child_process.spawn
               ▼
┌─────────────────────────────────────┐
│         Claude Code CLI             │
│         (system binary)             │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│       Mustard Data Store            │
│    ~/dev/mustard/data/ (YAML)       │
│  todos/ daily_logs/ people_notes/   │
│  ideas/                             │
└─────────────────────────────────────┘
  ↑ read by RAG Indexer at server start + POST /api/reindex
```

## Module structure

```
src/
├── App.tsx                    # Lense page — input, SSE stage loading, result rendering
├── App.css                    # App styles
├── index.css                  # Global reset styles
├── main.tsx                   # React entry point
├── components/
│   ├── ResultRenderer.tsx     # Component registry — maps type string to renderer
│   ├── TodoList.tsx           # todo-list component renderer
│   ├── LogTimeline.tsx        # log-timeline component renderer
│   ├── PersonNotes.tsx        # person-notes component renderer
│   ├── IdeaList.tsx           # idea-list component renderer
│   ├── Summary.tsx            # summary component renderer
│   ├── FallbackComponent.tsx  # Fallback for unknown component types
│   ├── panel/                 # CRUD panel — browse, edit, capture
│   │   ├── CrudPanel.tsx      # Collapsible panel container with type tabs and list views
│   │   ├── DetailDrawer.tsx   # Slide-over drawer for view/edit/create records
│   │   ├── MarkdownEditor.tsx # Rich text editor wrapper — raw/styled mode toggle, TipTap integration, EditorToolbar (inline)
│   │   ├── MarkdownEditor.css # Editor, mode toggle, toolbar, and TipTap surface styles
│   │   ├── markdown-utils.ts  # Markdown ↔ HTML conversion helpers (markdownToHtml, htmlToMarkdown)
│   │   ├── MarkdownEditor.test.tsx # Unit tests for mode toggle, toolbar, markdown round-trip
│   │   ├── ListControls.tsx   # Sort dropdown + limit control above record list
│   │   └── ...                # Type-specific list view components
│   ├── components.css         # Shared component styles
│   └── tokens.css             # Design tokens (CSS variables): warm gold palette, type colors, dark mode overrides
├── shared/
│   └── schema.ts             # Response schema — TypeScript interfaces for component types
├── server/
│   ├── index.ts               # Express API server entry point (triggers index on startup)
│   ├── app.ts                 # Express app with POST /api/lense (SSE) and POST /api/reindex
│   ├── prompt.ts              # Synthesis prompt construction (injects records inline)
│   ├── synthesiser.ts         # Synthesiser interface + CliSynthesiser (planned for rag-lense)
│   ├── server.test.ts         # API endpoint unit tests (mocked retriever + synthesiser)
│   ├── data/                  # Data access layer (read + write)
│   │   ├── reader.ts          # Reads YAML records from configurable data directory
│   │   └── writer.ts          # Creates and updates YAML record files with UUID generation
│   └── rag/                   # (planned for rag-lense phase)
│       ├── embedder.ts        # Embedding wrapper — transformers.js, all-MiniLM-L6-v2
│       ├── indexer.ts         # Reads YAML, generates embeddings, writes to LanceDB
│       ├── retriever.ts       # Embeds query, similarity search, returns top-k records
│       └── rag.test.ts        # Unit tests for indexer + retriever (fixture data)
├── lib/
│   ├── claude-cli.ts          # CLI invocation module with mode support
│   └── claude-cli.test.ts     # Unit tests (mocked child_process)
└── smoke/
    ├── basic.ts               # On-demand smoke test — basic mode
    ├── admin.ts               # On-demand smoke test — admin mode
    └── lense.ts               # On-demand smoke test — lense E2E (SSE stream)
```

## CLI modes

### Basic mode (default)

Standard Claude Code CLI invocation with permission restrictions. Used for routine tasks where the CLI operates within its normal safety guardrails.

**Invocation:** `claude [args]` — no special flags.

### Admin mode (explicit opt-in)

Claude Code CLI with `--dangerously-skip-permissions`. Used for tasks that require unrestricted filesystem, network, or system access.

**Invocation:** `claude --dangerously-skip-permissions [args]`

**Security implications:**
- Admin mode bypasses all CLI permission prompts — the agent can read/write any file, run any command, and make network requests without confirmation.
- Must never be the default. Every admin-mode invocation must be an explicit, conscious choice.
- The module validates the `mode` parameter strictly — only `'basic'` or `'admin'` are accepted.
- CLI invocation uses `child_process.spawn` with argument arrays (never shell string concatenation) to prevent command injection.

## Data flow

### Lense query flow (planned for rag-lense phase — replaces direct CLI file reading)

1. User types natural language intent into the lense input and presses Enter
2. Frontend sends `POST /api/lense` with `{ "intent": "..." }` to the API server
3. API server validates intent (type, length, empty) — returns 400 on failure before opening stream
4. API server opens SSE stream and emits `retrieving` stage event
5. RAG retriever embeds the intent string and performs similarity search against LanceDB, returning top-k records (default k=5) with metadata
6. API server emits `thinking` stage event
7. Synthesiser builds a prompt with retrieved records injected inline (wrapped in `<record>` delimiters) and user intent (wrapped in `<user-intent>` delimiters), then calls `invokeClaude({ mode: 'basic', prompt })` — no file access, no `allowedTools`, no `addDirs`
8. Claude returns structured JSON matching the response schema: `{ "components": [{ "type": "todo-list", "data": {...} }, ...] }`
9. API server parses JSON from stdout and emits `result` SSE event with the components
10. Frontend receives stage events, displays "Finding records..." → "Thinking..." → renders result components with animated transitions

### Index lifecycle (planned for rag-lense phase)

1. **Server start**: indexer reads all YAML files from `~/dev/mustard/data/`, embeds `text` field of each record, writes vectors + metadata to LanceDB table (create or overwrite)
2. **Manual refresh**: `POST /api/reindex` triggers a full re-index — same process as server start
3. **No file-system watcher**: data store changes infrequently; boot-time + on-demand covers the use case

### Response schema contract

Claude returns a JSON object with a `components` array. Each component has:
- `type` — discriminator string matching a known component type (`todo-list`, `log-timeline`, `person-notes`, `idea-list`, `summary`)
- `data` — typed object with fields specific to the component type

The shared schema module (`src/shared/schema.ts`) defines TypeScript interfaces for each component type, used by both server validation and frontend rendering.

### Browse API data flow CRUD panel and data reader

1. Frontend CRUD panel sends `GET /api/records?type=<log_type>` to the API server
2. Data reader module reads all YAML files from `MUSTARD_DATA_DIR` (defaults to `~/dev/mustard/data/`)
3. Records are parsed, filtered by `log_type` if specified, sorted by `capture_date_local` descending
4. JSON array of records returned to the frontend
5. CRUD panel renders records in type-specific list views within the active tab

### Write API data flow

1. User fills in the detail drawer form (edit or create mode) and clicks "Save"
2. Frontend sends `PUT /api/records/:id` (edit) or `POST /api/records` (create) with form data as JSON
3. Server validates required fields (`log_type`, `text`) and `log_type` against known allowlist
4. For create: server auto-generates UUID `id`, sets `capture_date_local` to today, fills `source` and `meta`
5. Data writer module serializes the record to YAML and writes to the correct subdirectory (ID-to-filepath mapping, no path interpolation from user input)
6. Server returns the full record (201 for create, 200 for update)
7. Server triggers background reindex so the lense picks up the change
8. Frontend closes the drawer, refreshes the panel list and tab counts

### Delete API data flow (planned for `living-polish` phase)

1. User opens a record in the detail drawer (edit mode) and clicks the delete button
2. An in-app confirmation element appears (not browser `confirm()`)
3. On confirm, frontend sends `DELETE /api/records/:id`
4. Server validates UUID format on `:id`, locates the YAML file via ID-to-filepath mapping from the data reader
5. Data writer module removes the YAML file from disk
6. Server returns 200 with `{ "id": "<uuid>" }`
7. Server triggers background reindex (same as create/update)
8. Frontend plays a farewell animation on the departing list item, then removes it from the DOM; drawer closes, tab count decrements

### Celebration animations and interaction polish (planned for `living-polish` phase)

CSS-only micro-animations that provide feedback for CRUD actions and list interactions. Zero JavaScript animation libraries.

**Celebration animations** — three cohesive effects sharing timing/easing:
- **Create:** burst/flash/pop localized to the active tab header area on successful `POST /api/records`
- **Edit:** shimmer/pulse on the refreshed list item on successful `PUT /api/records/:id`
- **Delete:** farewell (tilt/shrink/fade) on the departing list item before DOM removal

**List interaction polish:**
- **Hover states:** type-appropriate background color on list items, using `--lense-color-type-*-hover` tokens (light + dark mode)
- **Click feedback:** brief scale/flash on list item click before drawer opens
- **Tab crossfade:** ~150–200ms CSS crossfade transition on tab content swap
- **Drawer backdrop fade:** CSS opacity transition on backdrop open/close

All effects use CSS `@keyframes`, `transition`, and `transform` only.

### Design token architecture

The design token system in `tokens.css` uses CSS custom properties (`--lense-*`) consumed by all component stylesheets. Three layers:

1. **`:root` block** — light-mode defaults: warm gold accent (`#c8982c`), type-specific colors (todo blue, people purple, daily orange, idea green), success/error tokens, warm background (`#faf9f6`). (Planned for `living-polish` phase: type-specific hover variants `--lense-color-type-*-hover`.)
2. **`[data-theme="dark"]` block** — explicit dark mode overrides for all `--lense-color-*` variables. Applied when the user selects dark mode via the theme toggle. (Planned for `living-polish` phase: dark-mode hover token values.)
3. **`@media (prefers-color-scheme: dark) { html:not([data-theme="light"]) }` block** — system-preference fallback. Applies dark palette when the OS is in dark mode and the user hasn't explicitly chosen light.

Theme persistence: `localStorage` key `mustard-theme`. An inline `<script>` in `index.html` applies the stored theme before React hydrates, preventing flash-of-wrong-theme.

### Production static serving

In production, the Express server serves Vite's `dist/` static files alongside the API endpoints, so the full app runs on a single port (7777). This replaces the legacy mustard Flask app on the same port.

### Markdown editor

Dual-mode Markdown editing in the detail drawer's `text` field. `DetailDrawer.tsx` composes `MarkdownEditor` which manages mode state (raw vs styled) and includes `EditorToolbar` (inline component) visible in styled mode. The editor uses TipTap (ProseMirror-based) for WYSIWYG editing, with `markdown-utils.ts` providing Markdown ↔ HTML serialization. No API changes — the `text` field remains a plain string.

**Data flow (styled mode):**
1. Drawer opens → reads `mustard-text-mode` from `localStorage` → selects raw or styled
2. Editor loads `text` string → `markdownToHtml()` converts to ProseMirror document
3. User edits inline (WYSIWYG) or uses toolbar actions
4. On each edit → `htmlToMarkdown()` serializes back → `onChange` propagates to parent
5. On save → sends plain Markdown string via existing `POST`/`PUT` API
6. On drawer close → editor instance destroyed (useEffect cleanup)

**Toolbar:** 9 actions (bold, italic, strikethrough, link, bullet list, ordered list, blockquote, inline code, code block). No underline (non-standard CommonMark). All controls have accessible `aria-label` attributes.

### Always-on deployment (planned for `always-on` phase)

macOS LaunchAgent configuration that keeps mustard-lense running at `localhost:7777` across reboots and crashes. A plist template at `deploy/com.mustard.lense.plist` configures RunAtLoad + KeepAlive. LaunchAgent (not LaunchDaemon) runs in user session for access to `MUSTARD_DATA_DIR` and the `claude` CLI. Template is checked in to the repo; the user copies it to `~/Library/LaunchAgents/` and customizes paths. Setup and teardown documented in a dedicated section below.

### Future (beyond always-on)

Metadata-filtered retrieval, data repo separation (`mustard-data`), old mustard archival, and mustard-capture skill deletion are planned for subsequent phases.

## Hosting

| Environment | Port | Mechanism |
|-------------|------|-----------|
| Development | 5234 | Vite dev server (`npm run dev`) |
| Production | 7777 | Express server serving `dist/` static files + API on single port, replacing legacy mustard. Always-on via macOS LaunchAgent (planned for `always-on` phase). |

## Dependencies on external systems

| System | Purpose | Required |
|--------|---------|----------|
| Claude Code CLI (`claude`) | AI synthesis engine (receives pre-retrieved records, returns structured JSON) | Yes (smoke tests require it; unit tests mock synthesiser) |
| Mustard data store (`MUSTARD_DATA_DIR`, defaults to `~/dev/mustard-data`) | Record storage (YAML files) | Yes for indexing and browse API; configurable via `MUSTARD_DATA_DIR` env var; unit tests use fixture data |
| Express | API server for lense endpoint (SSE) and reindex endpoint | Yes |
| Playwright | E2E browser testing for lense UI | Yes |
| transformers.js (`all-MiniLM-L6-v2`) | Local embedding model for RAG pipeline (planned for rag-lense) | Yes — runs in-process, no external API |
| LanceDB | Embedded vector store for RAG pipeline (planned for rag-lense) | Yes — runs in-process, no server, no external service |
