## Phase goal

Add Markdown authoring for the shared record `text` field in the detail drawer: a mode control switching between raw Markdown source and a styled, editable rich view (Notion-like), a compact formatting toolbar, and localStorage persistence of the preferred mode. Storage remains plain text — no API or schema changes. Applies to all four record types.

### Dependencies
- typography-layout (archived)

### Stories in scope
- US-R3 — Raw vs styled Markdown mode toggle
- US-R4 — Styled editable rich text surface
- US-R5 — Compact formatting toolbar

### Done-when (observable)

**US-R3 — Raw vs styled Markdown mode toggle:**

- [x] `DetailDrawer.tsx` (or a child component it imports) renders a visible mode control element for the main `text` field when the drawer is open in edit mode [US-R3]
- [x] The mode control is present in create mode for all four `log_type` values: `todo`, `people_note`, `idea`, `daily_log` [US-R3]
- [x] User can switch between raw mode (plain textarea) and styled mode (editable rich view); automated test (Vitest or Playwright) asserts both modes are reachable from the UI [US-R3]
- [x] Default text editing mode is read from `localStorage` key `mustard-text-mode` on drawer open; changing mode writes the same key [US-R3]
- [x] Switching modes does not clear `text` in component state — automated test: set text, switch modes twice, assert same string value [US-R3]
- [x] Save sends only existing fields to `POST /api/records` and `PUT /api/records/:id` with `text` as a plain string — no new JSON keys added to the request body (verifiable by server.test.ts existing create/update tests still passing) [US-R3]

**US-R4 — Styled editable rich text surface:**

- [ ] In styled mode, the text area is interactive: typing produces content in the editor (not a read-only preview) — automated test verifies typing produces a state change [US-R4]
- [ ] Styled-mode content serializes to a plain Markdown string stored in `text`; Vitest test covers at least one formatting case (e.g. `**bold**` or `- list item`) round-tripping through serialize → deserialize [US-R4]
- [ ] `rg 'dangerouslySetInnerHTML' src/components/panel/` returns zero matches, OR any matches use a sanitization library (e.g. DOMPurify) — not raw user-controlled strings [US-R4]
- [ ] Rapid open/close of the drawer in styled mode does not throw — Playwright or Vitest test exercises: open drawer → styled mode → close → reopen [US-R4]
- [ ] Editor component cleans up on unmount — useEffect return (or equivalent) disposes the editor instance; no orphan event listeners (verifiable by source inspection of cleanup in the editor wrapper component) [US-R4]

**US-R5 — Compact formatting toolbar:**

- [ ] A toolbar element is visible in the DOM when styled mode is active [US-R5]
- [ ] Toolbar is hidden or absent from the DOM when raw mode is active [US-R5]
- [ ] Toolbar contains controls with accessible names (`aria-label` or `title` attribute) for each of: bold, italic, strikethrough, link, bullet list, ordered list, blockquote, inline code, code block — automated test asserts presence of 9 labeled controls [US-R5]
- [ ] No toolbar button for underline exists in the DOM — `rg -i 'underline' src/components/panel/` returns zero matches in toolbar component source (or matches are limited to CSS text-decoration, not a toolbar action) [US-R5]
- [ ] At least one toolbar action (e.g. bold) updates the serialized `text` state — Vitest test asserts Markdown marker (e.g. `**`) present in serialized output after invoking bold [US-R5]
- [ ] Toolbar styling uses `var(--lense-*)` design tokens from `tokens.css` — no hardcoded color hex values in the toolbar component's CSS (verifiable by `rg '#[0-9a-fA-F]{3,8}' <toolbar-css-file>` returning zero matches) [US-R5]

**Documentation:**

- [ ] `docs/manual/editing.md` includes a "Markdown editing" subsection documenting: mode control location and appearance, raw vs styled mode behavior, mode persistence via localStorage [US-R3] [US-R4]
- [ ] `docs/manual/editing.md` includes a "Formatting toolbar" subsection listing all 9 available actions and noting that underline is unsupported (CommonMark limitation) [US-R5]

**Structural:**

- [ ] `docs/architecture/ARCHITECTURE.md` documents the new editor module path(s) and their relationship to `DetailDrawer.tsx` [phase]
- [ ] `AGENTS.md` directory layout and file ownership table list the new editor module(s), toolbar component, and any new CSS files introduced in this phase [phase]

**Auto-added safety criteria:**

- [ ] `POST /api/records` and `PUT /api/records/:id` still return 400 when `text` exceeds server max length (existing `validateText` behavior); `server.test.ts` existing over-length rejection test still passes after editor integration [phase]

### Golden principles (phase-relevant)
- **Clarity over complexity** — one editor integration path; styled mode is the single rich surface (no parallel preview + edit panes)
- **People first** — mode toggle respects both Markdown-native and WYSIWYG preferences; persistence means the app remembers your choice
- **Faithful stewardship** — no unsafe HTML rendering; existing server validation unchanged; editor library is free/open-source with zero API calls
- **Continuous improvement** — editor module is isolated behind a component boundary for future Markdown extensions (e.g. tables, task lists)
