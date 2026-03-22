# Mustard Lense — Product Requirements Document

## Vision

Claude Code integrated interface for the mustard data store, enabling natural conversation for managing and viewing mustard data. Experiments with dynamic UI generation — serving contextual UI based on data and actionable requests. Supports favourite/reusable UI elements that grow the app based on user usage patterns.

## Background

The mustard data store is a working system for capturing todos, people notes, daily logs, and ideas via a Flask web app and YAML files on disk. While functional, its current UI has friction points that are difficult to articulate. Mustard-lense will serve as both a better interface and a learning vehicle — insights from building and using it will inform mustard's own PRD evolution, particularly around intelligent/semantic search and insight generation.

## Target users

- **Jaco (primary)** — developer and daily mustard user who wants a conversational, AI-assisted interface for managing and exploring mustard data
- **AI agents (secondary)** — Claude Code and Cursor agents that interact with the mustard data store programmatically

---

## Capability areas

### CLI Integration

Claude Code CLI integration with two permission modes:
- **Basic mode** — standard CLI invocation with permission restrictions for routine tasks
- **Admin mode** — CLI with `--dangerously-skip-permissions` for tasks that require unrestricted access

### Intelligent Lense

Natural language intent input that queries the mustard data store and renders structured, visual responses using template components. No chat UI — the interaction model is intent in, view out. A local RAG pipeline (transformers.js embeddings + LanceDB vector store) retrieves relevant records by semantic similarity, then a synthesis layer (Claude Code CLI, swappable to Anthropic SDK) produces structured JSON matching a defined component schema. The frontend shows real processing stages via SSE and renders pre-built template components (todo lists, timelines, note cards, idea cards, summaries) with animated transitions.

### Structured CRUD

Structured browse, capture, and edit interface for the mustard data store. A collapsible panel alongside the lense provides tab-based navigation across record types with type-specific list views, a detail drawer for individual records, and quick capture. The panel is the reliable utility drawer; the lense is the AI-powered insight engine. Together they form the unified mustard product.

### Dynamic UI (future)

Contextual UI generation based on data shape and user intent. Favourite/reusable UI elements that grow the app based on usage patterns. The template component system from the Intelligent Lense is the foundation this will build on.

---

## User stories

### US-L1 — Project scaffold with landing page

As a developer, I want a TypeScript React project with lint, type-check, and build commands plus a landing page, so that the codebase has a reliable foundation and a visible starting point.

**Acceptance criteria**:
- `npm run dev` starts dev server on port 5234
- `npm run build` produces a production-ready bundle
- `npm run lint` runs ESLint with zero errors on the clean codebase
- `npm run typecheck` runs TypeScript compiler check with zero errors
- Landing page renders at root URL with a Bible verse about the mustard seed starting small and growing large (Matthew 13:31-32)
- Landing page is visually clean, centered, and responsive

**User guidance:**
- Discovery: Navigate to `http://localhost:5234` (dev) or `http://localhost:5678` (production)
- Manual section: new page: "Getting Started"
- Key steps: 1. Run `npm install` to install dependencies. 2. Run `npm run dev` to start the dev server on port 5234. 3. Open `http://localhost:5234` to see the landing page with the mustard seed verse.

**Design rationale:** Vite + React + TypeScript gives fast dev feedback and type safety that will support future dynamic UI generation experiments.

---

### US-L2 — Claude Code CLI integration module with mode support

As the application, I want a typed module that invokes the Claude Code CLI in either basic or admin mode, so that features can route tasks to the appropriate permission level.

**Acceptance criteria**:
- Module exports a function accepting a mode parameter (`basic` | `admin`) and a prompt string
- In `basic` mode, invokes `claude` CLI without `--dangerously-skip-permissions`
- In `admin` mode, invokes `claude` CLI with `--dangerously-skip-permissions`
- Returns a typed result with stdout, stderr, and exit code
- Supports a streaming/callback mechanism for output as it arrives

**User guidance:** N/A — internal module.

**Design rationale:** Wrapping the CLI in a typed module with mode support centralizes permission control and makes the invocation boundary mockable for unit tests.

---

### US-L3 — Unit tests with mocked CLI

As a developer, I want unit tests that verify the CLI module using mocks, so that tests run fast without requiring the real Claude Code CLI.

**Acceptance criteria**:
- `npm test` runs unit tests via Vitest
- Tests mock the child process layer (no real CLI invocation)
- Tests verify basic mode omits `--dangerously-skip-permissions` flag
- Tests verify admin mode includes `--dangerously-skip-permissions` flag
- Tests verify the typed result shape (stdout, stderr, exit code)
- Tests cover error cases (non-zero exit, spawn failure)

**User guidance:** N/A — internal developer tooling.

**Design rationale:** Mocking at the process boundary lets tests verify flag construction and result parsing without non-deterministic real invocations.

---

### US-L4 — On-demand smoke tests with CLI output visibility

As a developer, I want on-demand smoke tests that invoke the real Claude Code CLI in each mode and display output, so that I can verify real integration works.

**Acceptance criteria**:
- `npm run smoke:basic` invokes the CLI in basic mode
- `npm run smoke:admin` invokes the CLI in admin mode
- Each test prompts the CLI and asserts non-empty output with exit code 0
- Both mode tests confirm successful CLI integration (non-empty stdout, zero exit code)
- CLI output is streamed to the terminal during the test run
- Smoke tests are NOT triggered by `npm test`

**User guidance:**
- Discovery: Run `npm run smoke:basic` or `npm run smoke:admin` from the project terminal
- Manual section: new page: "Testing Guide"
- Key steps: 1. Ensure the `claude` CLI is installed and available in PATH. 2. Run `npm run smoke:basic` to test basic mode — observe CLI output streamed to terminal. 3. Run `npm run smoke:admin` to test admin mode with bypass permissions.

**Design rationale:** Separate npm scripts per mode keep smoke tests explicit and prevent accidental admin-mode invocations. Streaming output gives real-time visibility into what the CLI is doing.

**Technical limitation (discovered):** Claude Code CLI does not self-report its permission mode in non-interactive (`-p`) output. The mode indicators ("bypass permissions on" / "? for shortcuts") are rendered only in the interactive TUI, not in piped stdout/stderr. Smoke tests therefore assert successful integration (non-empty output, zero exit code) rather than permission-mode detection. Correct flag construction per mode is verified by the mocked unit tests (US-L3).

---

### US-L5 — Architecture and development guidance documentation

As a developer (human or AI), I want architecture documentation and development guidance, so that contributors understand the system design, CLI modes, and conventions.

**Acceptance criteria**:
- `docs/architecture/ARCHITECTURE.md` describes system topology, module structure, and data flow
- `docs/architecture/ARCHITECTURE.md` documents the two CLI modes and their security implications
- `README.md` includes project purpose, setup instructions, and all available npm commands
- `AGENTS.md` is updated with file ownership map and directory layout

**User guidance:** N/A — developer documentation.

**Design rationale:** N/A — straightforward documentation.

---

### US-L6 — API server with intent endpoint and response schema [Shipped]

As the application, I want an API server that accepts natural language intent, routes it to Claude Code with a system prompt instructing it to read the mustard data store and return structured JSON, so that the frontend can render intelligent, data-driven views.

**Acceptance criteria**:
- Server exposes a POST endpoint that accepts a JSON body with an `intent` string field
- The endpoint constructs a system prompt that instructs Claude Code to: read the mustard data store at `~/dev/mustard/data/`, interpret the user's intent, and return JSON matching the response schema
- The endpoint invokes `invokeClaude` in basic mode with the constructed prompt
- The response schema defines component types: `todo-list`, `log-timeline`, `person-notes`, `idea-list`, `summary`
- Each component type has a typed data shape (TypeScript interface) usable by both server and frontend
- The endpoint parses Claude's output as JSON and returns it to the client
- The endpoint returns appropriate HTTP error codes for invalid input (400) and processing failures (500)
- `npm run dev` starts both the Vite dev server and the API server
- The `intent` field is validated for type and maximum length before processing

**User guidance:** N/A — internal API endpoint consumed by the frontend.

**Design rationale:** Co-locating the system prompt and response schema with the API server centralizes the contract between Claude and the frontend. Basic mode is sufficient since reading files doesn't require admin permissions.

---

### US-L7 — Lense input with loading and animated transitions [Shipped]

As a user, I want a single input field where I type what I want to see, with a loading indicator while processing and smooth animated transitions when results appear, so that the interaction feels responsive and intentional despite backend latency.

**Acceptance criteria**:
- A text input field is prominently displayed on the main page
- Pressing Enter or clicking a submit affordance sends the intent to the API endpoint (US-L6)
- A loading spinner/indicator is shown while the API processes the request
- The input is visually distinguished during the loading state
- When the response arrives, result components animate into view (not instant appear)
- On a new query, the current view animates out before the loading state begins (always-replace)
- The input field clears when a new query is submitted
- Error states are displayed gracefully when the API returns an error
- The landing page mustard seed verse is the default/empty state before any query

**User guidance:**
- Discovery: Navigate to `http://localhost:5234` — the lense input is the primary interface element
- Manual section: new page: "Using the Lense"
- Key steps: 1. Type a natural language query into the lense input (e.g., "what's on my plate this week"). 2. Press Enter and watch the loading indicator while Claude processes your intent. 3. View the rendered results — data cards, lists, and summaries drawn from your mustard data.

**Design rationale:** The always-replace model keeps the interface clean and avoids drifting toward a chat thread. Animated transitions make the latency feel intentional rather than sluggish — the "whoa, this is nice" moment.

---

### US-L8 — Template renderer components for mustard data types [Shipped]

As a user, I want structured, visually clean components that render my mustard data (todos, logs, people notes, ideas, summaries), so that query results are immediately scannable and useful rather than raw text.

**Acceptance criteria**:
- A component registry maps each component type string to a React component
- `todo-list` component renders items with status indicator, text, and due date (when present)
- `log-timeline` component renders daily log entries chronologically with date and theme
- `person-notes` component renders notes about a person with capture date and text
- `idea-list` component renders ideas with status badge and text
- `summary` component renders a title and text block for cross-cutting synthesis
- All components accept typed props matching the response schema interfaces (US-L6)
- Components follow a consistent visual style (spacing, typography, color palette)
- An unrecognized component type renders a graceful fallback (not a crash or blank space)

**User guidance:**
- Discovery: Components render automatically when you query the lense — no direct interaction needed
- Manual section: existing page: "Using the Lense"
- Key steps: 1. Query the lense with an intent like "open todos" or "notes about Nisal." 2. View the rendered components — todo lists show status and due dates, timelines show chronological logs, summaries provide cross-cutting insights.

**Design rationale:** Template components over raw LLM text ensures consistent visual quality and enables future interactive affordances (checkboxes, filters) that free-form text can't support. The fallback for unknown types prevents schema evolution from breaking the UI.

---

### US-L9 — End-to-end smoke test with real data [Shipped]

As a developer, I want an on-demand smoke test that sends a real intent through the full stack (API server, Claude Code, mustard data store, JSON response), so that I can verify the integration works end-to-end.

**Acceptance criteria**:
- `npm run smoke:lense` runs an on-demand smoke test separate from `npm test`
- The test sends a cross-cutting intent to the API endpoint
- The test asserts the response is valid JSON matching the response schema structure
- The test asserts at least one component is present in the response
- The test output shows the component types returned and a summary of the data
- The test requires the real `claude` CLI and the real mustard data store at `~/dev/mustard/data/`

**User guidance:**
- Discovery: Run `npm run smoke:lense` from the project terminal
- Manual section: existing page: "Testing Guide"
- Key steps: 1. Ensure the `claude` CLI is installed and the mustard data store exists at `~/dev/mustard/data/`. 2. Run `npm run smoke:lense` to send a real query through the full stack. 3. Observe the response — component types and data summary printed to terminal.

**Design rationale:** An API-level smoke test verifies the most fragile part of the system (the system prompt producing valid JSON from real data) without requiring a browser. Separate from `npm test` to avoid dependence on external systems.

---

### US-L10 — Local RAG pipeline with embedding and vector store

As the application, I want a local RAG pipeline that indexes mustard records into a vector store and retrieves the most relevant records for a given query, so that data retrieval completes in milliseconds instead of dozens of CLI tool-call round trips.

**Acceptance criteria**:
- An embedding wrapper module uses transformers.js with the `all-MiniLM-L6-v2` model to generate embeddings locally (zero external API calls)
- An indexer reads all YAML files from `~/dev/mustard/data/` (todos, daily_logs, people_notes, ideas), embeds the `text` field, and writes vectors + metadata to a LanceDB table
- Each record is stored with metadata columns: `id`, `log_type`, `capture_date_local`, and type-specific fields (`person`, `status`, `due_date_local`, `category`, `theme`, `period`, `tags`)
- A retriever accepts a query string, embeds it, performs similarity search, and returns the top-k records (default k=5) with their metadata
- The LanceDB table is created or overwritten on each index run (no incremental updates)
- Unit tests exist for the indexer and retriever using fixture YAML data (no real data store dependency)

**User guidance:** N/A — internal module.

**Design rationale:** Local embedding (transformers.js) + embedded vector store (LanceDB) meets the zero recurring cost constraint while keeping the entire retrieval pipeline in-process — no external services, no API keys, no additional server processes.

---

### US-L11 — Synthesis layer abstraction

As the application, I want the Claude invocation abstracted behind a synthesis interface that receives pre-retrieved records and an intent string, so that the retrieval and synthesis steps are decoupled and the underlying LLM mechanism can be swapped without touching retrieval or frontend code.

**Acceptance criteria**:
- A synthesiser interface exists with a method that accepts an intent string and an array of retrieved records, and returns the structured `LenseResponse`
- A CLI synthesiser implementation satisfies the interface by wrapping `invokeClaude` in basic mode
- The system prompt injects retrieved records inline (record text + metadata) instead of instructing the LLM to read files from disk
- The `invokeClaude` call no longer passes `allowedTools` or `addDirs` — the LLM receives data, not filesystem access
- User intent is wrapped in `<user-intent>` delimiters (existing prompt injection resistance preserved)
- Raw LLM output is never returned to the client on error paths — errors return generic messages and log details server-side only (existing pattern preserved)
- Unit tests verify the CLI synthesiser with mocked `invokeClaude`, including success and error paths

**User guidance:** N/A — internal module.

**Design rationale:** Abstracting synthesis behind an interface decouples retrieval from LLM invocation. The CLI works now but has ~7s cold start; this architecture lets a future phase swap to the Anthropic SDK for sub-3s focused queries without touching retrieval or frontend.

---

### US-L12 — SSE streaming API with RAG retrieval

As the application, I want `POST /api/lense` to return an SSE stream with real processing stage events and a new `/api/reindex` endpoint for manual index refresh, so that the frontend can show meaningful progress and the index can be rebuilt on demand.

**Acceptance criteria**:
- `POST /api/lense` returns `Content-Type: text/event-stream` instead of `application/json`
- The stream emits named stage events in order: `retrieving`, `thinking`, then `result`
- The `result` event data contains the components JSON (same `{ components: [...] }` shape)
- An `error` event is emitted on the stream if retrieval or synthesis fails (no raw stack traces or LLM output leaked to the client)
- Intent validation (type, length, empty) returns HTTP 400 before opening the stream (existing validation preserved)
- `POST /api/reindex` triggers a full vector index rebuild and returns HTTP 200 with `{ status: "ok", records: <count> }` on success
- The vector index is built on server start (in the server entry point) so the first query does not wait for indexing
- Unit tests mock the retriever and synthesiser and verify the SSE event sequence (retrieving → thinking → result)
- Unit tests verify the `/api/reindex` endpoint returns 200

**User guidance:** N/A — internal API consumed by the frontend.

**Design rationale:** SSE over client-timed stages gives real state transitions from the server rather than fake timed messages — more honest, more lovable. POST + SSE response (not EventSource GET) matches the request-response pattern of a query while enabling streaming, the same pattern used by LLM streaming APIs.

---

### US-L13 — Frontend SSE consumption with stage-based loading

As a user, I want to see real processing stages ("Finding records...", "Thinking...") while my query is being handled, so that I understand what the system is doing instead of watching a static spinner.

**Acceptance criteria**:
- The frontend sends `POST /api/lense` and reads the response as an SSE stream (not JSON)
- Stage-specific loading messages are displayed during processing: "Finding records..." during the `retrieving` stage, "Thinking..." during the `thinking` stage
- Stage transitions have animated visual changes (not instant text swap)
- Result components render when the `result` event arrives (same component rendering as before)
- An `error` event renders an error message in the DOM (existing error display pattern preserved)
- Always-replace behavior is preserved — a new query clears previous results before showing stages
- Input clears on submit (existing behavior preserved)
- Playwright E2E test mocks the SSE endpoint and verifies: stage indicator appears during processing, result components render after the result event
- Playwright E2E test verifies error event renders error message in the DOM

**User guidance:**
- Discovery: Navigate to `http://localhost:5234` — same lense input, now with real-time processing stages
- Manual section: existing page: "Using the Lense"
- Key steps: 1. Type a natural language query into the lense input (e.g., "what's on my plate this week"). 2. Watch the stage indicators — "Finding records..." while retrieval runs, "Thinking..." while Claude processes your intent. 3. View the rendered results when processing completes.

**Design rationale:** Real stage transitions from the server (retrieval done → thinking) rather than fake timed messages give honest, purposeful feedback. This upgrades the loading experience from "something is happening" to "here's what's happening now" — the lovability upgrade for this phase.

---

### US-U1 — Record browse API with configurable data directory [Shipped]

As Jaco, I want an API endpoint that returns my mustard records filtered by type, reading from a configurable data directory, so that the CRUD panel can display my data without depending on the RAG pipeline.

**Acceptance criteria**:
- `GET /api/records?type=todo` returns a JSON array of records matching that `log_type`
- `GET /api/records` (no type filter) returns all records across all types
- Each record in the response includes all fields: `id`, `log_type`, `capture_date_local`, `text`, `person`, `status`, `due_date_local`, `category`, `theme`, `period`, `tags`
- Records are sorted by `capture_date_local` descending (newest first)
- The data directory is read from `MUSTARD_DATA_DIR` env var, falling back to `~/dev/mustard/data/`
- Both the browse API and the RAG indexer use the same `MUSTARD_DATA_DIR` env var
- `GET /api/records?type=invalid_type` returns an empty array (not an error)
- Unit tests exist for the browse endpoint using fixture YAML data (no real data store dependency)

**User guidance:** N/A — internal API consumed by the CRUD panel frontend.

**Design rationale:** A dedicated read endpoint decoupled from the RAG pipeline gives the CRUD panel instant, deterministic access to records without embedding or vector search overhead. The shared `MUSTARD_DATA_DIR` env var ensures both subsystems read from the same source.

---

### US-U2 — Split-screen layout with collapsible CRUD panel [Shipped]

As Jaco, I want a split-screen layout with a collapsible structured panel on the left and the lense on the right, so that I can browse my data and query the lense side-by-side in one tool.

**Acceptance criteria**:
- The app renders a two-column layout: CRUD panel on the left, lense on the right
- A toggle button collapses and expands the CRUD panel
- When the panel is collapsed, the lense expands to fill the full width
- When the panel is expanded, it occupies approximately 40% of the viewport width
- The lense (input + results) is always visible regardless of panel state
- The app title updates to "Mustard" (replacing "Mustard Lense")
- The layout is usable at viewport widths down to 768px (panel auto-collapses on narrow viewports)
- Playwright E2E test verifies: both panel and lense regions are visible, toggle collapses the panel, lense input remains functional after toggle

**User guidance:**
- Discovery: Navigate to `http://localhost:5234` — the split-screen layout is the default view
- Manual section: new page: "App Layout"
- Key steps: 1. Open the app — the CRUD panel is on the left, the lense input on the right. 2. Click the panel toggle to collapse the CRUD panel and give the lense full width. 3. Click again to restore the split-screen view.

**Design rationale:** The lense is the primary experience (AI-powered insight); the CRUD panel is the reliable utility drawer (structured browse). Always-visible lense ensures the AI capability is never hidden behind a tab or mode switch. Left-panel placement follows the convention of navigation/sidebar panels (VS Code, Slack, email clients).

---

### US-U3 — Type tabs in CRUD panel [Shipped]

As Jaco, I want tabs in the CRUD panel for Todos, People, Ideas, and Daily Logs, so that I can quickly switch between record types without leaving the panel.

**Acceptance criteria**:
- The CRUD panel header displays four tabs: Todos, People, Ideas, Daily Logs
- Each tab maps to a `log_type` value (`todo`, `people_note`, `idea`, `daily_log`)
- Clicking a tab fetches records of that type from `GET /api/records?type=<log_type>` and displays them in the panel body
- The active tab is visually distinguished (highlight, underline, or equivalent)
- The Todos tab is active by default on first load
- Each tab displays a record count badge showing the number of records of that type
- Tab switching shows a brief loading state while records are fetched
- Unit tests verify tab rendering and active state toggling

**User guidance:**
- Discovery: Tabs are visible at the top of the CRUD panel — the leftmost column of the app
- Manual section: existing page: "App Layout"
- Key steps: 1. Open the app — the Todos tab is active by default, showing your todo records. 2. Click the "People" tab to see people notes, or "Ideas" for ideas. 3. The record count badge on each tab shows how many records exist for that type.

**Design rationale:** Tab-per-type mirrors how the data is already organized on disk (one directory per type) and matches Jaco's mental model — "show me my todos" vs "show me my people notes." Cross-cutting queries ("everything from today") are the lense's job, keeping the CRUD panel simple and predictable.

---

### US-U4 — Type-specific list views [Shipped]

As Jaco, I want each tab in the CRUD panel to render a compact, scannable list view tailored to that record type, so that I can quickly find and review records without opening each one.

**Acceptance criteria**:
- Todo list items display: status indicator (visual icon/badge), text (truncated to ~80 chars with ellipsis), and `due_date_local` when present
- People list items display: `person` name (bold), text (truncated to ~80 chars), and `capture_date_local`
- Idea list items display: `status` badge, and text (truncated to ~80 chars)
- Daily log list items display: `capture_date_local`, `theme` (when present), and text (truncated to ~80 chars)
- All list views use shared design tokens (spacing, typography, colors) from the existing `tokens.css`
- Empty state: when a tab has zero records, a friendly message is displayed (not a blank panel)
- List items render mustard data text using React JSX expressions (textContent), not `dangerouslySetInnerHTML`
- Playwright E2E test verifies: at least one list item renders in a tab, and list items display the expected fields for that type (mocked API response)

**User guidance:**
- Discovery: List views render automatically when you select a tab in the CRUD panel
- Manual section: existing page: "App Layout"
- Key steps: 1. Click the "Todos" tab — each item shows a status icon, the todo text, and a due date (if set). 2. Click "People" — each item shows the person's name in bold, a note preview, and the capture date. 3. Scan the list to find what you need — key fields are front and centre.

**Design rationale:** Compact list items (key fields only, truncated text) optimize for scanning speed — the user should identify the right record at a glance. Type-specific field selection surfaces what matters most per type (due date for todos, person name for people notes) rather than showing a generic field dump.

---

### US-U5 — Record write API (create and update)

As Jaco, I want API endpoints that create and update mustard records as YAML files, so that the CRUD panel can write data without depending on the old Flask app.

**Acceptance criteria**:
- `POST /api/records` creates a new YAML file in the correct subdirectory based on `log_type` (e.g., `todos/`, `people_notes/`, `ideas/`, `daily_logs/`)
- The request body includes at minimum `log_type` and `text`; returns 400 if either is missing
- `log_type` must be one of `todo`, `people_note`, `idea`, `daily_log`; returns 400 for unknown types
- The server auto-generates a unique `id` (UUID) and sets `capture_date_local` to today's date on create
- The server auto-fills `source: mustard-app` and `meta: { tags: [] }` on create so the user never deals with them
- All other fields (`person`, `status`, `due_date_local`, `category`, `theme`, `period`) are optional and written if provided
- `POST /api/records` returns 201 with the full created record (including generated fields)
- `PUT /api/records/:id` updates an existing record's YAML file in place
- `PUT /api/records/:id` returns 200 with the full updated record
- `PUT /api/records/:id` returns 404 when the record ID is not found
- After a successful create or update, the server triggers a background reindex so the lense picks up the change (response does not wait for reindex to complete)
- Unit tests exist for both endpoints using a temporary directory (no real data store dependency)

**User guidance:** N/A — internal API consumed by the detail drawer and capture form.

**Design rationale:** Writing YAML directly (not through the old Flask app) makes mustard-lense self-sufficient for data mutation. Auto-filling `source`, `meta`, and `capture_date_local` removes friction fields that users never want to think about. Background reindex ensures the lense stays current without blocking the write response.

---

### US-U6 — Detail drawer for viewing and editing records

As Jaco, I want to click a record in the list and have a slide-over drawer open with the full editable form, so that I can view and update any record without leaving the browse panel.

**Acceptance criteria**:
- Clicking a list item in the CRUD panel opens a slide-over drawer that overlays from the right
- The drawer shows all fields for the record in editable form inputs
- Form fields are type-specific: todo shows `text`, `status` (dropdown: open/done/parked), `due_date_local` (date picker); people_note shows `text`, `person`; idea shows `text`, `status`; daily_log shows `text`, `theme`
- The `text` field uses a textarea (not a single-line input) to accommodate multi-line content
- The `log_type` and `id` fields are displayed but not editable in edit mode
- A "Save" button sends `PUT /api/records/:id` with the form data
- On successful save, the drawer closes, the list refreshes to show updated data, and the tab count updates
- A "Close" button (or click outside the drawer) dismisses the drawer without saving
- The list remains visible behind the drawer for context (drawer does not cover the full viewport)
- Drawer open/close has a CSS slide animation (not instant appear/disappear)
- Form fields render user-provided text via React JSX expressions (value attribute or textContent), not `dangerouslySetInnerHTML`
- Playwright E2E test verifies: clicking a list item opens the drawer, drawer displays record fields, close button dismisses the drawer (mocked API)

**User guidance:**
- Discovery: Click any record in the CRUD panel list to open the detail drawer
- Manual section: new page: "Editing Records"
- Key steps: 1. Click a record in any tab — the detail drawer slides in from the right. 2. Edit the fields you want to change (text, status, due date, etc.). 3. Click "Save" to persist changes — the drawer closes and the list updates.

**Design rationale:** A slide-over drawer (not a modal or full-page view) keeps the list visible for context — the user can see which record they selected and what's around it. Type-specific form fields surface only what's relevant per record type, reducing cognitive load.

---

### US-U7 — Quick capture with sticky Add button

As Jaco, I want a sticky "Add" button in the CRUD panel header that opens the detail drawer in create mode with the active tab's type pre-selected, so that capturing a new record is one click away without scrolling or switching context.

**Acceptance criteria**:
- An "Add" button (or "+" affordance) is always visible in the CRUD panel header, without scrolling
- Clicking "Add" opens the detail drawer in create mode (empty form)
- The `log_type` field is pre-set to the active tab's type (e.g., clicking Add while on the Todos tab pre-selects `todo`)
- The `log_type` field is changeable in create mode via a dropdown, in case the user wants a different type
- The `text` field is auto-focused when the drawer opens in create mode, so the user can start typing immediately
- A "Save" button sends `POST /api/records` with the form data
- On successful save, the drawer closes, the panel list refreshes to include the new record, and the tab count updates
- Validation: the "Save" button is disabled when `text` is empty
- Playwright E2E test verifies: clicking Add opens drawer in create mode, log_type is pre-selected from active tab, save button is disabled when text is empty (mocked API)

**User guidance:**
- Discovery: The "Add" button is always visible in the CRUD panel header — top-left of the app
- Manual section: existing page: "Editing Records"
- Key steps: 1. Click the "+" button in the panel header — the detail drawer opens with an empty form, type pre-set to the active tab. 2. Type your note, idea, or todo in the text field (auto-focused). 3. Click "Save" — the record is created and appears in the list.

**Design rationale:** One-click capture with type pre-selection and auto-focus on the text field makes the path from "I want to capture something" to "it's saved" as short as possible. This is the MLP-critical moment — if this doesn't feel faster than a text file, the unification fails.

---

### US-U8 — List view controls (sort, limit, persisted preferences)

As Jaco, I want sort and limit controls on the list view so that I can order records by date or status and cap the visible list at a manageable size, with my preferences remembered between sessions.

**Acceptance criteria**:
- A sort dropdown appears in the CRUD panel body (above the list) with options: "Newest first" (default), "Oldest first"
- The Todos tab has an additional sort option: "Status (open first)" which groups open, then parked, then done
- Selecting a sort option re-orders the displayed list client-side (no additional API call)
- A "Show" control (dropdown or numeric input) sets the maximum number of records displayed, defaulting to 25
- When more records exist than the limit, a "Show all" or "Load more" affordance is visible below the list
- Sort selection and limit value are persisted in `localStorage` per tab (e.g., Todos sorted by status persists independently from People sorted by date)
- On page reload, the persisted sort and limit preferences are restored for each tab
- Unit tests verify sort logic: date ascending, date descending, status grouping for todos
- Playwright E2E test verifies: sort dropdown changes list order, limit control caps visible items (mocked API)

**User guidance:**
- Discovery: Sort and limit controls appear above the record list in each tab
- Manual section: existing page: "App Layout"
- Key steps: 1. Use the sort dropdown to reorder records — "Newest first", "Oldest first", or "Status" for todos. 2. Adjust the "Show" control to limit visible records (default 25). 3. Your preferences are saved automatically — they'll be there next time you open the app.

**Design rationale:** Client-side sorting avoids extra API calls and keeps the interaction instant. Per-tab persistence in localStorage means Jaco's Todos tab stays sorted by status while People stays sorted by date — each tab remembers its own context. A default limit of 25 keeps the panel scannable as the data store grows.

---

## Implementation phases

| Phase | Name | Stories | Status |
|-------|------|---------|--------|
| 1 | Foundation | US-L1, US-L2, US-L3, US-L4, US-L5 | Shipped |
| 2 | Intelligent Lense | US-L6, US-L7, US-L8, US-L9 | Shipped |
| 3 | RAG Lense | US-L10, US-L11, US-L12, US-L13 | Shipped |
| 4 | Structured Browse | US-U1, US-U2, US-U3, US-U4 | Shipped |
| 5 | Capture & Edit | US-U5, US-U6, US-U7, US-U8 | Planned |

### Phase 1 — Foundation

Stand up the mustard-lense application foundation — a TypeScript React project with build tooling, a Claude Code CLI integration module supporting basic and admin permission modes, comprehensive testing (mocked unit tests plus real on-demand smoke tests per mode), architecture documentation, and a landing page anchored by the mustard seed parable.

**Done-when (observable):**

- [ ] `npm run dev` starts Vite dev server on port 5234 without error [US-L1]
- [ ] `npm run build` exits 0 and produces `dist/` directory containing `index.html` [US-L1]
- [ ] `npm run lint` exits 0 with zero errors on the clean codebase [US-L1]
- [ ] `npm run typecheck` exits 0 with zero type errors [US-L1]
- [ ] `index.html` includes `<meta name="viewport" ...>` tag for responsive rendering [US-L1]
- [ ] Landing page at `/` contains text from Matthew 13:31-32 about the mustard seed growing from the smallest seed into a tree [US-L1]
- [ ] `tsconfig.json` exists with `strict: true` [US-L1]
- [ ] `vite.config.ts` exists and configures dev server port 5234 [US-L1]
- [ ] `src/lib/claude-cli.ts` exports an `invokeClaude` function that accepts `{ mode: 'basic' | 'admin', prompt: string }` [US-L2]
- [ ] `invokeClaude` in basic mode spawns `claude` process WITHOUT `--dangerously-skip-permissions` in the argument list [US-L2]
- [ ] `invokeClaude` in admin mode spawns `claude` process WITH `--dangerously-skip-permissions` in the argument list [US-L2]
- [ ] Module exports a `ClaudeResult` type with fields `stdout: string`, `stderr: string`, `exitCode: number` [US-L2]
- [ ] `invokeClaude` accepts an optional `onData` callback for streaming stdout chunks as they arrive [US-L2]
- [ ] CLI invocation uses `child_process.spawn` with an argument array (not shell string concatenation) to prevent command injection [US-L2]
- [ ] `npm test` exits 0 and runs Vitest test suite [US-L3]
- [ ] Unit tests for the CLI module exist in `src/lib/claude-cli.test.ts` [US-L3]
- [ ] Tests mock `child_process.spawn` — no real `claude` CLI process is spawned during `npm test` [US-L3]
- [ ] Test asserts basic mode invocation does not include `--dangerously-skip-permissions` in spawn arguments [US-L3]
- [ ] Test asserts admin mode invocation includes `--dangerously-skip-permissions` in spawn arguments [US-L3]
- [ ] Test asserts return value matches `ClaudeResult` shape (`stdout`, `stderr`, `exitCode` present) [US-L3]
- [ ] Tests cover error scenarios: non-zero exit code and spawn failure (e.g., `claude` not found) [US-L3]
- [ ] `package.json` defines `smoke:basic` script that is separate from `test` script [US-L4]
- [ ] `package.json` defines `smoke:admin` script that is separate from `test` script [US-L4]
- [ ] `npm run smoke:basic` invokes the real `claude` CLI in basic mode and asserts non-empty stdout with exit code 0 [US-L4]
- [ ] `npm run smoke:admin` invokes the real `claude` CLI in admin mode and asserts non-empty stdout with exit code 0 [US-L4]
- [ ] CLI output is piped to `process.stdout` so the developer sees real-time output during smoke test execution [US-L4]
- [ ] `npm test` does NOT execute smoke test files (smoke tests excluded from Vitest config or in a separate directory) [US-L4]
- [ ] `docs/architecture/ARCHITECTURE.md` exists and describes system topology, module structure, and data flow [US-L5]
- [ ] `docs/architecture/ARCHITECTURE.md` documents basic and admin CLI modes including security implications of `--dangerously-skip-permissions` [US-L5]
- [ ] `README.md` exists with project purpose, setup instructions, and lists all npm commands (`dev`, `build`, `lint`, `typecheck`, `test`, `smoke:basic`, `smoke:admin`) [US-L5]
- [ ] `AGENTS.md` includes file ownership map and directory layout reflecting the codebase structure [US-L5]
- [ ] `AGENTS.md` reflects new modules, directories, and CLI modes introduced in this phase [phase]
- [ ] `invokeClaude` validates that `prompt` is a non-empty string before spawning the CLI process [US-L2]
- [ ] `invokeClaude` validates that `mode` is strictly `'basic'` or `'admin'` before spawning (rejects unexpected values) [US-L2]

**Hosting:**
- Dev: `npm run dev` on port 5234
- Production: macOS plist serving built app on port 5678

**Golden principles (phase-relevant):**
- **Faithful stewardship** — quality foundation over speed; strict TypeScript, linting, and tests from day one
- **Safety and ethics** — admin mode (`--dangerously-skip-permissions`) must be explicit, opt-in, and documented; never the default
- **Clarity over complexity** — keep the foundation minimal and well-documented; resist premature abstraction
- **Continuous improvement** — architecture docs and tests established early so future phases compound on a solid base

### Phase 2 — Intelligent Lense

Connect the React frontend to the Claude Code CLI backend through a lightweight API server, creating an intelligent lense interface. The user types natural language intent into a single input field, the backend routes it to Claude Code (which reads the mustard data store directly), and the frontend renders the response as pre-built template components with animated transitions. No chat UI — input replaces previous results, loading spinner during processing, components animate into view.

**Done-when (observable):**

- [ ] A server module exists (e.g. `src/server/`) that exports an Express or equivalent HTTP server with a `POST /api/lense` route [US-L6]
- [ ] `POST /api/lense` with valid `{ "intent": "open todos" }` body returns HTTP 200 with `Content-Type: application/json` [US-L6]
- [ ] A system prompt module exists that references the mustard data store path (`~/dev/mustard/data/`) and enumerates the response schema component types [US-L6]
- [ ] The API endpoint calls `invokeClaude` with `mode: 'basic'` (verified by unit test mocking `invokeClaude`) [US-L6]
- [ ] A shared response schema module exports TypeScript interfaces for all five component types: `todo-list`, `log-timeline`, `person-notes`, `idea-list`, `summary` [US-L6]
- [ ] Each component type interface defines a `type` discriminator field and a `data` object with typed fields (e.g., `todo-list` data includes `items` array with `id`, `text`, `status` fields) [US-L6]
- [ ] `npm run dev` starts both the Vite dev server on port 5234 and the API server, with API requests from the frontend proxied or routed correctly [US-L6]
- [ ] Unit tests exist for the API endpoint that mock `invokeClaude` and verify: valid request returns parsed JSON, missing intent returns 400, invocation failure returns 500 [US-L6]
- [ ] Root URL (`/`) renders a visible text input element that serves as the lense input [US-L7]
- [ ] Submitting the input (Enter key or submit affordance) triggers a `POST` request to `/api/lense` with the input value as `intent` [US-L7]
- [ ] A loading indicator element (spinner or equivalent) is present in the DOM while the API request is in flight [US-L7]
- [ ] The input element has a visually distinct loading state (e.g., `disabled` attribute or CSS class change) while the request is in flight [US-L7]
- [ ] Result components are rendered inside an animation wrapper that applies CSS `transition` or `animation` on mount (verifiable by presence of animation/transition CSS properties or class) [US-L7]
- [ ] When a new query is submitted, existing result components are removed from the DOM before new results render (always-replace) [US-L7]
- [ ] The input value resets to empty string after a query is submitted [US-L7]
- [ ] When the API returns an error, an error message is rendered in the DOM (not a browser alert or console-only error) [US-L7]
- [ ] Before any query is submitted, the page displays the Matthew 13:31-32 mustard seed verse as the default empty state [US-L7]
- [ ] Playwright test exists that: types a query, asserts loading indicator appears, and asserts at least one result component renders after loading completes [US-L7]
- [ ] A component registry module exists that accepts a component type string and returns the corresponding React component (or a fallback) [US-L8]
- [ ] `todo-list` renderer displays each item's `status` (as a visual indicator), `text`, and `due_date_local` when present [US-L8]
- [ ] `log-timeline` renderer displays entries with `capture_date_local`, `theme`, and `text` [US-L8]
- [ ] `person-notes` renderer displays notes with `person` name, `capture_date_local`, and `text` [US-L8]
- [ ] `idea-list` renderer displays items with `status` badge and `text` [US-L8]
- [ ] `summary` renderer displays a `title` and `text` block [US-L8]
- [ ] All renderer components accept props typed with the shared schema interfaces from US-L6 (`npm run typecheck` passes) [US-L8]
- [ ] Passing an unrecognized component type to the registry returns a fallback component that renders a visible element (not empty/blank) and does not throw a runtime error [US-L8]
- [ ] Renderer components use a shared CSS module, CSS variables, or design tokens file for consistent spacing, typography, and color [US-L8]
- [ ] `package.json` defines a `smoke:lense` script that is separate from the `test` script [US-L9]
- [ ] `npm test` does NOT execute the lense smoke test [US-L9]
- [ ] `npm run smoke:lense` sends an HTTP request with a cross-cutting intent (e.g., "what's going on this week") to the API endpoint [US-L9]
- [ ] The smoke test asserts the response parses as valid JSON containing a `components` array with at least one entry [US-L9]
- [ ] The smoke test prints the component types present in the response to stdout [US-L9]
- [ ] `POST /api/lense` returns 400 when the `intent` field is missing from the request body [US-L6]
- [ ] `POST /api/lense` returns 400 when the `intent` field is an empty string [US-L6]
- [ ] `POST /api/lense` returns 500 with a structured JSON error body (not a raw stack trace) when `invokeClaude` fails [US-L6]
- [ ] The `intent` field is validated for type (`string`) and maximum length before being passed to `invokeClaude` [US-L6]
- [ ] All renderer components render mustard data text using React JSX expressions (textContent), not `dangerouslySetInnerHTML` [US-L8]
- [ ] `AGENTS.md` reflects new API server modules, response schema, frontend components, and lense interaction introduced in this phase [phase]
- [ ] `README.md` or `docs/` contains a "Using the Lense" section documenting the lense input, example queries, and component types rendered [US-L7]

**Hosting:**
- Dev: `npm run dev` on port 5234 (Vite + API server)
- Production: macOS plist serving built app on port 5678

**Golden principles (phase-relevant):**
- **Faithful stewardship** — quality over speed; the system prompt and response schema are the highest-leverage code in this phase — get them right
- **Safety and ethics** — basic CLI mode only; user intent is passed via argument array, not shell interpolation; no dangerouslySetInnerHTML
- **Clarity over complexity** — template components over dynamic code generation; a known set of component types rather than unbounded flexibility
- **People first** — polished transitions and loading states treat user time and attention with respect; the interface should feel intentional, not bolted-on
- **Continuous improvement** — the response schema and component registry are designed to grow; new component types can be added without restructuring

### Phase 3 — RAG Lense

Replace the Claude CLI's file-reading tool calls with a local RAG pipeline that pre-retrieves relevant mustard records and injects them inline into the synthesis prompt. Change POST /api/lense from synchronous JSON to an SSE stream with real processing stage events (retrieving → thinking → result). Abstract the synthesis layer behind an interface so it can be swapped from the CLI to the Anthropic SDK in a future phase. Add a manual reindex endpoint.

**Done-when (observable):**

- [ ] `src/server/rag/` directory exists with embedding, indexer, and retriever modules [US-L10]
- [ ] Embedding module imports from a transformers.js package and loads the `Xenova/all-MiniLM-L6-v2` model (verifiable by model name string in source) [US-L10]
- [ ] Indexer reads all YAML files from a configurable data store path, embeds the `text` field of each record, and writes vectors to a LanceDB table [US-L10]
- [ ] Each LanceDB record stores metadata columns: `id`, `log_type`, `capture_date_local`, and type-specific fields where present (`person`, `status`, `due_date_local`, `category`, `theme`, `period`, `tags`) [US-L10]
- [ ] Retriever exports a function that accepts a query string and optional `k` parameter (default 5), returns an array of records with `text` and metadata fields [US-L10]
- [ ] Indexer creates or overwrites the LanceDB table on each run — not incremental [US-L10]
- [ ] Unit tests exist for indexer and retriever using fixture YAML data — `npm test` does not depend on the real mustard data store [US-L10]
- [ ] Embedding runs locally in-process — no HTTP calls to external embedding APIs (verifiable by absence of fetch/axios calls in embedding module) [US-L10]
- [ ] `package.json` includes a transformers.js package and a LanceDB package as dependencies [US-L10]
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

**Golden principles (phase-relevant):**
- **Great Commission ambition + nonprofit stewardship** — zero recurring cost architecture: local embedding (transformers.js), local vector store (LanceDB), no external APIs for retrieval. Every dollar is donor-trust money.
- **Faithful stewardship** — RAG retrieval quality is the highest-leverage code in this phase; k=5 validated by POC benchmarking. Get the embedding and retrieval right.
- **People first** — SSE stage events give honest, purposeful feedback; "Finding records..." and "Thinking..." respect user attention more than a static spinner.
- **Clarity over complexity** — server-start indexing + manual reindex over file-system watchers; synthesis interface is minimal (one method). No premature abstraction.
- **Continuous improvement** — synthesis interface enables future SDK swap without rework; RAG pipeline enables future dynamic-k, metadata filtering, and full-scan optimizations.

### Phase 4 — Structured Browse

Introduce a structured browse panel alongside the existing lense, creating the unified mustard split-screen layout. A collapsible CRUD panel on the left provides tab-based navigation across four record types (Todos, People, Ideas, Daily Logs) with type-specific compact list views. The lense on the right remains always visible. A new read API endpoint serves records directly from YAML files, with the data directory configurable via `MUSTARD_DATA_DIR` env var (shared with the RAG indexer). Browse only — no write operations, no detail drawer, no capture form.

**Done-when (observable):**

- [ ] `GET /api/records` returns HTTP 200 with `Content-Type: application/json` containing a JSON array [US-U1]
- [ ] `GET /api/records?type=todo` returns only records where `log_type` equals `todo` [US-U1]
- [ ] `GET /api/records` (no type parameter) returns records from all log types [US-U1]
- [ ] Each record object in the response contains fields: `id`, `log_type`, `capture_date_local`, `text`, `person`, `status`, `due_date_local`, `category`, `theme`, `period`, `tags` [US-U1]
- [ ] Records are sorted by `capture_date_local` descending (newest first) [US-U1]
- [ ] The data directory is read from `MUSTARD_DATA_DIR` env var, defaulting to `~/dev/mustard/data/` when unset [US-U1]
- [ ] The RAG indexer (`src/server/rag/indexer.ts`) reads from `MUSTARD_DATA_DIR` env var when set (shared configuration with the browse API) [US-U1]
- [ ] `GET /api/records?type=nonexistent_type` returns HTTP 200 with an empty JSON array `[]` [US-U1]
- [ ] A data reader module exists (e.g. `src/server/data/reader.ts`) that exports a function for reading and parsing YAML records from the configured data directory [US-U1]
- [ ] `.env.example` documents `MUSTARD_DATA_DIR` with a description and default value [US-U1]
- [ ] Unit tests for the browse endpoint exist and pass using fixture YAML data — `npm test` does not depend on the real mustard data store [US-U1]
- [ ] `GET /api/records` returns HTTP 500 with a structured JSON error body (not a raw stack trace or unhandled exception) when YAML file reading fails [US-U1]
- [ ] The `type` query parameter is used as an in-memory filter on parsed records — not interpolated into file system paths, shell commands, or directory names [US-U1]
- [ ] The app renders a two-column layout: CRUD panel on the left, lense on the right [US-U2]
- [ ] A toggle button in the DOM collapses and expands the CRUD panel [US-U2]
- [ ] When collapsed, the lense region fills the full viewport width (panel region not visible) [US-U2]
- [ ] When expanded, the CRUD panel occupies approximately 40% of the viewport width [US-U2]
- [ ] The lense input and result rendering remain functional in both collapsed and expanded panel states [US-U2]
- [ ] The visible app title reads "Mustard" (not "Mustard Lense") [US-U2]
- [ ] At viewport widths below 768px, the CRUD panel is collapsed by default [US-U2]
- [ ] CRUD panel components exist in a dedicated directory (e.g. `src/components/panel/`) [US-U2]
- [ ] Playwright E2E test verifies: both panel and lense regions are present in the DOM, toggle button collapses and expands the panel, lense input accepts text input after toggle [US-U2]
- [ ] User guide page documents the split-screen layout, panel toggle, type tabs, and list view field descriptions (at `docs/manual/layout.md` or equivalent path) [US-U2]
- [ ] Four tab elements render in the CRUD panel header with labels: "Todos", "People", "Ideas", "Daily Logs" [US-U3]
- [ ] Clicking a tab triggers a fetch to `GET /api/records?type=<log_type>` where log_type is `todo`, `people_note`, `idea`, or `daily_log` respectively [US-U3]
- [ ] The active tab is visually distinguished (verifiable by CSS class or `aria-selected` attribute) [US-U3]
- [ ] The "Todos" tab is active by default on first load [US-U3]
- [ ] Each tab displays a record count badge showing the number of records for that type [US-U3]
- [ ] A loading indicator is visible in the panel body while records are being fetched [US-U3]
- [ ] Unit tests verify tab rendering and active state toggling [US-U3]
- [ ] Todo list items display: status indicator (visual icon or badge), text (truncated to ~80 chars with ellipsis), and `due_date_local` when present [US-U4]
- [ ] People list items display: `person` name (bold), text (truncated to ~80 chars), and `capture_date_local` [US-U4]
- [ ] Idea list items display: `status` badge and text (truncated to ~80 chars) [US-U4]
- [ ] Daily log list items display: `capture_date_local`, `theme` (when present), and text (truncated to ~80 chars) [US-U4]
- [ ] List views use CSS custom properties from `tokens.css` for spacing, typography, and colors [US-U4]
- [ ] When a tab has zero records, a friendly empty-state message is displayed in the panel body (not a blank panel) [US-U4]
- [ ] List items render record text via React JSX expressions (textContent), not `dangerouslySetInnerHTML` [US-U4]
- [ ] Playwright E2E test verifies: at least one list item renders in a tab, list items contain expected field elements for that record type (mocked API response) [US-U4]
- [ ] `AGENTS.md` reflects new browse API endpoint (`GET /api/records`), data reader module, CRUD panel components, split-screen layout, and `MUSTARD_DATA_DIR` configuration introduced in this phase [phase]

**AGENTS.md sections affected:**
- File ownership map (new data reader module, panel components)
- Directory layout (new `src/server/data/`, `src/components/panel/`)
- Behavior rules (new `GET /api/records` endpoint, split-screen layout)
- Testing conventions (new test files for browse API and panel components)

**User documentation:**
- New "App Layout" page at `docs/manual/layout.md` documenting split-screen layout, panel toggle, type tabs, and list view field descriptions

**Golden principles (phase-relevant):**
- **People first** — split-screen layout and type-specific views respect Jaco's time; data is scannable at a glance, not buried behind AI queries
- **Clarity over complexity** — tab-per-type mirrors the on-disk data structure; direct YAML file reading with no ORM; configurable data path via a single env var
- **Faithful stewardship** — unit tests and E2E tests from day one; shared `MUSTARD_DATA_DIR` ensures browse API and RAG indexer always read from the same source
- **Continuous improvement** — the CRUD panel architecture is designed to extend with write operations, detail drawer, and capture form in subsequent phases

### Phase 5 — Capture & Edit

Add write capability and list controls to the unified mustard app. A write API creates and updates records as YAML files with auto-generated IDs and auto-filled metadata. A slide-over detail drawer lets users view and edit any record by clicking it in the list. A sticky "Add" button in the panel header opens the drawer in create mode with the active tab's type pre-selected — the zero-friction capture path that makes this a daily driver. List view controls add sort options (date, status) and a configurable record limit (default 25), with per-tab preferences persisted in localStorage.

**Done-when (observable):**

- [ ] `POST /api/records` with valid `{ "log_type": "todo", "text": "Buy milk" }` returns HTTP 201 with a JSON object containing `id`, `log_type`, `text`, `capture_date_local`, `source`, and `meta` fields [US-U5]
- [ ] The created record is written as a YAML file in the correct subdirectory: `todos/` for `todo`, `people_notes/` for `people_note`, `ideas/` for `idea`, `daily_logs/` for `daily_log` [US-U5]
- [ ] `POST /api/records` returns 400 when `log_type` is missing from the request body [US-U5]
- [ ] `POST /api/records` returns 400 when `text` is missing or empty from the request body [US-U5]
- [ ] `POST /api/records` returns 400 when `log_type` is not one of `todo`, `people_note`, `idea`, `daily_log` [US-U5]
- [ ] The server auto-generates a UUID `id` on create (verifiable by presence of UUID-format string in response) [US-U5]
- [ ] The server auto-fills `capture_date_local` to today's date (YYYY-MM-DD format) on create [US-U5]
- [ ] The server auto-fills `source: "mustard-app"` and `meta: { tags: [] }` on create [US-U5]
- [ ] Optional fields (`person`, `status`, `due_date_local`, `category`, `theme`, `period`) are written to the YAML file when provided in the request body [US-U5]
- [ ] `PUT /api/records/:id` with valid body returns HTTP 200 with the full updated record [US-U5]
- [ ] `PUT /api/records/:id` updates the existing YAML file in place (verifiable by reading the file after update) [US-U5]
- [ ] `PUT /api/records/:id` returns 404 when the record ID is not found [US-U5]
- [ ] After a successful create or update, the server triggers a background reindex (verifiable by server log output indicating reindex started) [US-U5]
- [ ] A data writer module exists (e.g. `src/server/data/writer.ts`) that exports functions for creating and updating YAML record files [US-U5]
- [ ] Unit tests exist for both `POST /api/records` and `PUT /api/records/:id` using a temporary directory — `npm test` does not depend on the real data store [US-U5]
- [ ] `POST /api/records` validates `log_type` against a known allowlist (`todo`, `people_note`, `idea`, `daily_log`) — unknown types are rejected with 400 before any file write [US-U5]
- [ ] `POST /api/records` validates `text` is a non-empty string with a maximum length before writing (prevents empty or excessively large files) [US-U5]
- [ ] `PUT /api/records/:id` validates the `id` parameter format before attempting file lookup — no user-provided values are interpolated into file paths via string concatenation (use ID-to-filepath mapping from the data reader) [US-U5]
- [ ] `POST /api/records` returns 500 with a structured JSON error body (not a raw stack trace) when YAML file writing fails [US-U5]
- [ ] `PUT /api/records/:id` returns 500 with a structured JSON error body (not a raw stack trace) when YAML file writing fails [US-U5]
- [ ] Clicking a list item in the CRUD panel opens a slide-over drawer element in the DOM [US-U6]
- [ ] The drawer overlays from the right side and does not cover the full viewport — the list remains partially visible behind it [US-U6]
- [ ] Drawer open/close has a CSS slide animation (verifiable by presence of `transition` or `animation` CSS property) [US-U6]
- [ ] The drawer displays all fields for the selected record in editable form inputs [US-U6]
- [ ] Todo records show: `text` (textarea), `status` (dropdown: open/done/parked), `due_date_local` (date input) [US-U6]
- [ ] People note records show: `text` (textarea), `person` (text input) [US-U6]
- [ ] Idea records show: `text` (textarea), `status` (dropdown: open/done/parked) [US-U6]
- [ ] Daily log records show: `text` (textarea), `theme` (text input) [US-U6]
- [ ] The `text` field renders as a `<textarea>` element (not a single-line `<input>`) [US-U6]
- [ ] The `log_type` and `id` fields are displayed but not editable in edit mode (read-only or disabled) [US-U6]
- [ ] A "Save" button sends `PUT /api/records/:id` with the form data [US-U6]
- [ ] On successful save, the drawer closes, the list refreshes to show updated data, and tab count updates [US-U6]
- [ ] A "Close" button (or click-outside) dismisses the drawer without saving [US-U6]
- [ ] The detail drawer form renders all user-provided text via React `value` attributes or JSX text nodes, not `dangerouslySetInnerHTML` [US-U6]
- [ ] Playwright E2E test verifies: clicking a list item opens the drawer, drawer displays record fields, close button dismisses the drawer (mocked API) [US-U6]
- [ ] User guide page "Editing Records" exists (at `docs/manual/editing.md` or equivalent) documenting the detail drawer, save/close actions, type-specific form fields, and the Add button capture flow [US-U6]
- [ ] An "Add" button (or "+" affordance) is visible in the CRUD panel header without scrolling [US-U7]
- [ ] Clicking "Add" opens the detail drawer in create mode (empty form, no record data pre-populated) [US-U7]
- [ ] The `log_type` field is pre-set to the active tab's type (e.g., `todo` when on the Todos tab) [US-U7]
- [ ] The `log_type` field is changeable in create mode via a dropdown [US-U7]
- [ ] The `text` textarea is auto-focused when the drawer opens in create mode [US-U7]
- [ ] A "Save" button sends `POST /api/records` with the form data [US-U7]
- [ ] On successful save, the drawer closes, the panel list refreshes to include the new record, and tab count updates [US-U7]
- [ ] The "Save" button is disabled when the `text` field is empty [US-U7]
- [ ] Playwright E2E test verifies: clicking Add opens drawer in create mode, log_type is pre-selected from active tab, save button is disabled when text is empty (mocked API) [US-U7]
- [ ] A sort dropdown is visible above the record list in the CRUD panel body with options: "Newest first" (default), "Oldest first" [US-U8]
- [ ] The Todos tab sort dropdown includes an additional option: "Status (open first)" which orders records as open → parked → done [US-U8]
- [ ] Selecting a sort option re-orders the displayed list client-side without an additional API call [US-U8]
- [ ] A "Show" control (dropdown or numeric input) is visible above the list, defaulting to 25 [US-U8]
- [ ] The list displays at most the number of records specified by the "Show" control [US-U8]
- [ ] When more records exist than the limit, a "Show all" or "Load more" affordance is visible below the list [US-U8]
- [ ] Sort selection is persisted in `localStorage` per tab (e.g., key `mustard-sort-todo`) [US-U8]
- [ ] Limit value is persisted in `localStorage` per tab (e.g., key `mustard-limit-todo`) [US-U8]
- [ ] On page reload, persisted sort and limit preferences are restored for each tab [US-U8]
- [ ] Unit tests verify sort logic: date ascending, date descending, and status grouping (open → parked → done) for todos [US-U8]
- [ ] Playwright E2E test verifies: sort dropdown changes list order, limit control caps the number of visible list items (mocked API) [US-U8]
- [ ] `AGENTS.md` reflects new write API endpoints (`POST /api/records`, `PUT /api/records/:id`), data writer module, detail drawer component, Add button, list view controls, and localStorage preferences introduced in this phase [phase]
- [ ] User guide page "App Layout" updated to document sort and limit controls with per-tab persistence [US-U8]

**AGENTS.md sections affected:**
- File ownership map (new data writer module, detail drawer component, list controls)
- Directory layout (new `src/server/data/writer.ts`, new `src/components/panel/DetailDrawer.tsx`)
- Behavior rules (new `POST /api/records`, `PUT /api/records/:id` endpoints, detail drawer interaction, Add button, sort/limit controls)
- Testing conventions (new test files for write API, drawer, sort logic)

**User documentation:**
- New "Editing Records" page at `docs/manual/editing.md` documenting detail drawer, save/close, type-specific forms, and Add button capture flow
- Updated "App Layout" page with sort and limit controls documentation

**Golden principles (phase-relevant):**
- **People first** — capture is the MLP-critical moment; auto-focus, type pre-selection, and one-click Add make the path from intent to saved record as short as possible
- **Faithful stewardship** — auto-filled metadata (source, capture_date, meta) removes friction fields without losing data lineage; relaxed validation puts UX proof before schema hardening
- **Safety and ethics** — ID-to-filepath mapping prevents path traversal; log_type allowlist prevents arbitrary directory writes; all form text rendered safely via React value binding
- **Clarity over complexity** — client-side sorting avoids extra API calls; localStorage persistence is simple and requires no backend state; the drawer is one component shared between create and edit
- **Continuous improvement** — background reindex after writes keeps the lense current; per-tab sort/limit preferences compound into a personalized daily-driver experience
