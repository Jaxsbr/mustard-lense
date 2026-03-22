## Phase goal

Add write capability and list controls to the unified mustard app. A write API creates and updates records as YAML files with auto-generated IDs and auto-filled metadata. A slide-over detail drawer lets users view and edit any record by clicking it in the list. A sticky "Add" button in the panel header opens the drawer in create mode with the active tab's type pre-selected — the zero-friction capture path that makes this a daily driver. List view controls add sort options (date, status) and a configurable record limit (default 25), with per-tab preferences persisted in localStorage.

### Dependencies
- structured-browse (archived)

### Stories in scope
- US-U5 — Record write API (create and update)
- US-U6 — Detail drawer for viewing and editing records
- US-U7 — Quick capture with sticky Add button
- US-U8 — List view controls (sort, limit, persisted preferences)

### Done-when (observable)
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

### Golden principles (phase-relevant)
- **People first** — capture is the MLP-critical moment; auto-focus, type pre-selection, and one-click Add make the path from intent to saved record as short as possible
- **Faithful stewardship** — auto-filled metadata (source, capture_date, meta) removes friction fields without losing data lineage; relaxed validation puts UX proof before schema hardening
- **Safety and ethics** — ID-to-filepath mapping prevents path traversal; log_type allowlist prevents arbitrary directory writes; all form text rendered safely via React value binding
- **Clarity over complexity** — client-side sorting avoids extra API calls; localStorage persistence is simple and requires no backend state; the drawer is one component shared between create and edit
