## Phase goal

Introduce a structured browse panel alongside the existing lense, creating the unified mustard split-screen layout. A collapsible CRUD panel on the left provides tab-based navigation across four record types (Todos, People, Ideas, Daily Logs) with type-specific compact list views. The lense on the right remains always visible. A new read API endpoint serves records directly from YAML files, with the data directory configurable via `MUSTARD_DATA_DIR` env var (shared with the RAG indexer). Browse only — no write operations, no detail drawer, no capture form.

### Dependencies
- rag-lense

### Stories in scope
- US-U1 — Record browse API with configurable data directory
- US-U2 — Split-screen layout with collapsible CRUD panel
- US-U3 — Type tabs in CRUD panel
- US-U4 — Type-specific list views

### Done-when (observable)
- [x] `GET /api/records` returns HTTP 200 with `Content-Type: application/json` containing a JSON array [US-U1]
- [x] `GET /api/records?type=todo` returns only records where `log_type` equals `todo` [US-U1]
- [x] `GET /api/records` (no type parameter) returns records from all log types [US-U1]
- [x] Each record object in the response contains fields: `id`, `log_type`, `capture_date_local`, `text`, `person`, `status`, `due_date_local`, `category`, `theme`, `period`, `tags` [US-U1]
- [x] Records are sorted by `capture_date_local` descending (newest first) [US-U1]
- [x] The data directory is read from `MUSTARD_DATA_DIR` env var, defaulting to `~/dev/mustard/data/` when unset [US-U1]
- [x] The RAG indexer (`src/server/rag/indexer.ts`) reads from `MUSTARD_DATA_DIR` env var when set (shared configuration with the browse API) [US-U1]
- [x] `GET /api/records?type=nonexistent_type` returns HTTP 200 with an empty JSON array `[]` [US-U1]
- [x] A data reader module exists (e.g. `src/server/data/reader.ts`) that exports a function for reading and parsing YAML records from the configured data directory [US-U1]
- [x] `.env.example` documents `MUSTARD_DATA_DIR` with a description and default value [US-U1]
- [x] Unit tests for the browse endpoint exist and pass using fixture YAML data — `npm test` does not depend on the real mustard data store [US-U1]
- [x] `GET /api/records` returns HTTP 500 with a structured JSON error body (not a raw stack trace or unhandled exception) when YAML file reading fails [US-U1]
- [x] The `type` query parameter is used as an in-memory filter on parsed records — not interpolated into file system paths, shell commands, or directory names [US-U1]
- [x] The app renders a two-column layout: CRUD panel on the left, lense on the right [US-U2]
- [x] A toggle button in the DOM collapses and expands the CRUD panel [US-U2]
- [x] When collapsed, the lense region fills the full viewport width (panel region not visible) [US-U2]
- [x] When expanded, the CRUD panel occupies approximately 40% of the viewport width [US-U2]
- [x] The lense input and result rendering remain functional in both collapsed and expanded panel states [US-U2]
- [x] The visible app title reads "Mustard" (not "Mustard Lense") [US-U2]
- [x] At viewport widths below 768px, the CRUD panel is collapsed by default [US-U2]
- [x] CRUD panel components exist in a dedicated directory (e.g. `src/components/panel/`) [US-U2]
- [x] Playwright E2E test verifies: both panel and lense regions are present in the DOM, toggle button collapses and expands the panel, lense input accepts text input after toggle [US-U2]
- [x] User guide page documents the split-screen layout, panel toggle, type tabs, and list view field descriptions (at `docs/manual/layout.md` or equivalent path) [US-U2]
- [x] Four tab elements render in the CRUD panel header with labels: "Todos", "People", "Ideas", "Daily Logs" [US-U3]
- [x] Clicking a tab triggers a fetch to `GET /api/records?type=<log_type>` where log_type is `todo`, `people_note`, `idea`, or `daily_log` respectively [US-U3]
- [x] The active tab is visually distinguished (verifiable by CSS class or `aria-selected` attribute) [US-U3]
- [x] The "Todos" tab is active by default on first load [US-U3]
- [x] Each tab displays a record count badge showing the number of records for that type [US-U3]
- [x] A loading indicator is visible in the panel body while records are being fetched [US-U3]
- [x] Unit tests verify tab rendering and active state toggling [US-U3]
- [ ] Todo list items display: status indicator (visual icon or badge), text (truncated to ~80 chars with ellipsis), and `due_date_local` when present [US-U4]
- [ ] People list items display: `person` name (bold), text (truncated to ~80 chars), and `capture_date_local` [US-U4]
- [ ] Idea list items display: `status` badge and text (truncated to ~80 chars) [US-U4]
- [ ] Daily log list items display: `capture_date_local`, `theme` (when present), and text (truncated to ~80 chars) [US-U4]
- [ ] List views use CSS custom properties from `tokens.css` for spacing, typography, and colors [US-U4]
- [ ] When a tab has zero records, a friendly empty-state message is displayed in the panel body (not a blank panel) [US-U4]
- [ ] List items render record text via React JSX expressions (textContent), not `dangerouslySetInnerHTML` [US-U4]
- [ ] Playwright E2E test verifies: at least one list item renders in a tab, list items contain expected field elements for that record type (mocked API response) [US-U4]
- [ ] `AGENTS.md` reflects new browse API endpoint (`GET /api/records`), data reader module, CRUD panel components, split-screen layout, and `MUSTARD_DATA_DIR` configuration introduced in this phase [phase]

### Golden principles (phase-relevant)
- **People first** — split-screen layout and type-specific views respect Jaco's time; data is scannable at a glance, not buried behind AI queries
- **Clarity over complexity** — tab-per-type mirrors the on-disk data structure; direct YAML file reading with no ORM; configurable data path via a single env var
- **Faithful stewardship** — unit tests and E2E tests from day one; shared `MUSTARD_DATA_DIR` ensures browse API and RAG indexer always read from the same source
- **Continuous improvement** — the CRUD panel architecture is designed to extend with write operations, detail drawer, and capture form in subsequent phases
