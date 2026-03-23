## Phase goal

Add interaction feedback and micro-animations to the CRUD panel, plus delete functionality. Three cohesive celebration animations (create burst, edit shimmer, delete farewell) transform data management from mechanical into fun. List item hover states, click feedback, tab crossfade, and drawer backdrop fade make every micro-interaction feel intentional. A DELETE endpoint and in-app delete UI complete the CRUD quartet.

### Dependencies
- daily-ready (archived)

### Stories in scope
- US-D4 — Action celebration animations with delete
- US-D5 — List item interaction polish

### Done-when (observable)

**US-D4 — Delete API:**
- [x] `DELETE /api/records/:id` with a valid existing record ID returns HTTP 200 with JSON containing `{ "id": "<uuid>" }` [US-D4]
- [x] `DELETE /api/records/:id` returns HTTP 404 with structured JSON error when the record ID is not found [US-D4]
- [x] `DELETE /api/records/:id` returns HTTP 400 with structured JSON error when `:id` is not a valid UUID format [US-D4]
- [x] `DELETE /api/records/:id` removes the YAML file from disk — file no longer exists after successful response [US-D4]
- [x] `DELETE /api/records/:id` triggers background reindex after successful delete (verifiable by server log output indicating reindex started) [US-D4]
- [x] `DELETE /api/records/:id` returns HTTP 500 with structured JSON error body (not raw stack trace) when file removal fails [US-D4]
- [x] `DELETE /api/records/:id` uses ID-to-filepath mapping from the data reader — no user-provided values interpolated into file paths via string concatenation [US-D4]
- [x] `src/server/data/writer.ts` exports a `deleteRecord` function (or equivalent) that removes a YAML file by ID [US-D4]
- [x] Unit tests exist for `DELETE /api/records/:id`: success (200), not found (404), invalid UUID format (400) — in `src/server/server.test.ts` [US-D4]

**US-D4 — Delete UI:**
- [x] A delete button element is present in the detail drawer DOM when the drawer is in edit mode [US-D4]
- [x] The delete button is NOT present in the detail drawer DOM when the drawer is in create mode [US-D4]
- [x] Clicking the delete button shows an in-app confirmation element in the DOM — `window.confirm` is not called (verifiable by absence of `window.confirm` or `confirm(` calls in drawer component source) [US-D4]
- [x] After confirmed delete: the drawer closes, the deleted record is removed from the list, and the tab count decrements by 1 [US-D4]
- [x] The delete fetch uses AbortController or equivalent cleanup — if the drawer component unmounts during a pending delete request, the fetch is cancelled [US-D4]
- [x] Drawer component source does not call `window.confirm` or bare `confirm(` — confirmation is handled by a React element in the DOM (verifiable by `rg 'window\.confirm\|[^a-zA-Z]confirm(' src/components/panel/DetailDrawer.tsx` returning zero matches) [US-D4]
- [x] `DELETE /api/records/` (no ID) returns a JSON response with appropriate HTTP status (not HTML from the SPA catch-all) [US-D4]

**US-D4 — Celebration animations:**
- [x] A CSS `@keyframes` animation plays on or near the active tab header area when `POST /api/records` succeeds (create celebration) — verifiable by presence of animation class or `animationName` computed style on the tab element after create [US-D4]
- [x] A CSS `@keyframes` animation plays on the updated list item when `PUT /api/records/:id` succeeds (edit celebration) — verifiable by presence of animation class or `animationName` computed style on the list item after edit [US-D4]
- [x] A CSS `@keyframes` animation plays on the departing list item before it is removed from the DOM on delete (farewell animation) — verifiable by presence of animation class on the item during removal [US-D4]
- [x] All three animations use only CSS `@keyframes`, `transition`, and/or `transform` — no JavaScript animation library packages in `package.json` dependencies (no `framer-motion`, `gsap`, `react-spring`, `animejs`, or equivalent) [US-D4]
- [x] Playwright E2E test verifies: delete button visible in edit-mode drawer, delete button absent in create-mode drawer, confirmation element appears on delete button click (mocked DELETE API) [US-D4]

**US-D5 — List item interaction polish:**
- [x] List items (`.list-item` or equivalent selector) change background color on CSS `:hover` — the hover color is type-appropriate (derived from `--lense-color-type-*` tokens, not a single generic hover color) [US-D5]
- [x] `tokens.css` `:root` block defines hover color variants for each type: `--lense-color-type-todo-hover`, `--lense-color-type-people-hover`, `--lense-color-type-daily-hover`, `--lense-color-type-idea-hover` (or equivalent naming pattern) [US-D5]
- [x] `tokens.css` `[data-theme="dark"]` block defines dark-mode values for all four type hover color tokens [US-D5]
- [x] List items have a click feedback effect — a CSS `transition` or `@keyframes` animation (scale, flash, or equivalent) plays on click before the drawer opens (verifiable by presence of transition/animation CSS on the element during click interaction) [US-D5]
- [x] Tab content transitions with a CSS crossfade effect when switching tabs — a `transition` or `@keyframes` animation with duration between 100ms and 300ms is applied to the tab content container (verifiable by computed `transition` or `animation` CSS property on the content element) [US-D5]
- [x] Drawer backdrop (`.detail-drawer-backdrop` or equivalent) has a CSS `transition` on `opacity` — it fades in when the drawer opens and fades out when the drawer closes (not instant appear/disappear) [US-D5]
- [x] Hover colors render correctly in dark mode — with `data-theme="dark"` set, list item hover backgrounds use the dark-mode hover token values [US-D5]
- [x] All effects use CSS `transition`, `@keyframes`, and/or `transform` only — no JS animation library imports in component source files [US-D5]
- [x] Playwright E2E test verifies: list item has hover-related CSS properties (e.g., `transition` on `background-color`), tab content container has `transition` or `animation` CSS property [US-D5]

**Phase-level:**
- [x] `AGENTS.md` reflects: new `DELETE /api/records/:id` endpoint, `deleteRecord` export in writer module, celebration animations behavior, type-specific hover tokens in `tokens.css` [phase]
- [x] User guide "Editing Records" page (`docs/manual/editing.md`) documents the delete button, confirmation step, and celebration animation behavior [US-D4]
- [x] User guide "App Layout" page (`docs/manual/layout.md`) documents list item hover states, click feedback, and tab crossfade transitions [US-D5]

### Golden principles (phase-relevant)
- **People first** — celebration animations transform mechanical data management into something fun; hover states provide instant visual feedback that respects the user's attention
- **Faithful stewardship** — CSS-only animations keep the bundle unchanged; delete completes the CRUD quartet using existing patterns (UUID validation, ID-to-filepath mapping, background reindex)
- **Clarity over complexity** — all effects use standard CSS (`@keyframes`, `transition`, `transform`); no animation libraries; in-app confirmation instead of browser `confirm()`
- **Continuous improvement** — type-specific hover tokens compound on the token system from daily-ready; interaction polish raises the quality floor for all future components
