# Phase 9 — Markdown Editor

**Status: Shipped**

Add Markdown authoring for the shared record `text` field in the detail drawer: a mode control switching between raw Markdown source and a styled, editable rich view (Notion-like), a compact formatting toolbar, and localStorage persistence of the preferred mode. Storage remains plain text — no API or schema changes. Applies to all four record types.

## Stories

### US-R3 — Raw vs styled Markdown mode toggle [Shipped]

- [x] `DetailDrawer.tsx` (or a child component it imports) renders a visible mode control element for the main `text` field when the drawer is open in edit mode
- [x] The mode control is present in create mode for all four `log_type` values: `todo`, `people_note`, `idea`, `daily_log`
- [x] User can switch between raw mode (plain textarea) and styled mode (editable rich view); automated test asserts both modes are reachable from the UI
- [x] Default text editing mode is read from `localStorage` key `mustard-text-mode` on drawer open; changing mode writes the same key
- [x] Switching modes does not clear `text` in component state — automated test: set text, switch modes twice, assert same string value
- [x] Save sends only existing fields to `POST /api/records` and `PUT /api/records/:id` with `text` as a plain string — no new JSON keys added to the request body

### US-R4 — Styled editable rich text surface [Shipped]

- [x] In styled mode, the text area is interactive: typing produces content in the editor (not a read-only preview)
- [x] Styled-mode content serializes to a plain Markdown string stored in `text`; Vitest test covers at least one formatting case round-tripping through serialize → deserialize
- [x] `rg 'dangerouslySetInnerHTML' src/components/panel/` returns zero matches, OR any matches use a sanitization library
- [x] Rapid open/close of the drawer in styled mode does not throw
- [x] Editor component cleans up on unmount — useEffect return disposes the editor instance

### US-R5 — Compact formatting toolbar [Shipped]

- [x] A toolbar element is visible in the DOM when styled mode is active
- [x] Toolbar is hidden or absent from the DOM when raw mode is active
- [x] Toolbar contains controls with accessible names for each of: bold, italic, strikethrough, link, bullet list, ordered list, blockquote, inline code, code block — 9 labeled controls
- [x] No toolbar button for underline exists in the DOM
- [x] At least one toolbar action updates the serialized `text` state
- [x] Toolbar styling uses `var(--lense-*)` design tokens — no hardcoded color hex values

## Documentation

- [x] `docs/manual/editing.md` includes "Markdown editing" subsection
- [x] `docs/manual/editing.md` includes "Formatting toolbar" subsection

## Structural

- [x] `docs/architecture/ARCHITECTURE.md` documents the editor module
- [x] `AGENTS.md` directory layout and file ownership table list the editor modules
- [x] `POST /api/records` and `PUT /api/records/:id` still return 400 when `text` exceeds server max length

## Golden principles applied

- **Clarity over complexity** — one editor integration path; styled mode is the single rich surface
- **People first** — mode toggle respects both Markdown-native and WYSIWYG preferences; persistence remembers choice
- **Faithful stewardship** — no unsafe HTML rendering; existing server validation unchanged
- **Continuous improvement** — editor module isolated behind a component boundary for future extensions
