## Phase goal

Port the original mustard app's warm visual identity into the React app and add dark mode. Replace the cool blue-grey palette with warm gold, type-specific colors, and success/error tokens at the design-token level. Add dark mode with system preference detection, toggle, and localStorage persistence. Give each record type its own color identity in the CRUD panel. Update production port to 7777 so mustard-lense replaces the legacy mustard app on the same port.

### Dependencies
- structured-browse (archived)

### Stories in scope
- US-D1 — Warm gold design token port
- US-D2 — Dark mode
- US-D3 — Type-specific CRUD panel colors

### Done-when (observable)
- [x] `tokens.css` `:root` declares `--lense-color-accent` with value `#c8982c` (warm gold, replacing `#4f6d7a`) [US-D1]
- [x] `tokens.css` `:root` declares `--lense-color-accent-light` with a warm-tinted value derived from `#c8982c` (not the previous cool `#e8f0f3`) [US-D1]
- [x] `tokens.css` `:root` declares `--lense-color-bg` with value `#faf9f6` (warm off-white, replacing `#ffffff`) [US-D1]
- [x] `tokens.css` `:root` declares `--lense-color-bg-subtle` with a warm-tinted value (replacing `#f9fafb`) [US-D1]
- [x] `tokens.css` `:root` declares `--lense-color-type-todo: #4a7fc4` [US-D1]
- [x] `tokens.css` `:root` declares `--lense-color-type-people: #7b5ea7` [US-D1]
- [x] `tokens.css` `:root` declares `--lense-color-type-daily: #e07850` [US-D1]
- [x] `tokens.css` `:root` declares `--lense-color-type-idea: #2d9574` [US-D1]
- [x] `tokens.css` `:root` declares `--lense-color-success-bg` and `--lense-color-success-text` tokens [US-D1]
- [x] `tokens.css` `:root` declares `--lense-color-error-bg` and `--lense-color-error-text` tokens [US-D1]
- [x] Zero matches for literal `#4f6d7a` in any file under `src/` (`rg '#4f6d7a' src/` returns no results) [US-D1]
- [x] All color values in `App.css` reference `var(--lense-*)` tokens — no hardcoded hex color values remain outside `@keyframes` blocks (verifiable by `rg '#[0-9a-fA-F]{3,8}' src/App.css` returning only `@keyframes` context or zero matches) [US-D1]
- [x] `npm run build` exits 0 [US-D1]
- [x] `npm run typecheck` exits 0 [US-D1]
- [ ] `tokens.css` contains a `[data-theme="dark"]` selector block that overrides all `--lense-color-*` variables with dark-adapted values [US-D2]
- [ ] `tokens.css` contains a `@media (prefers-color-scheme: dark)` block using `html:not([data-theme="light"])` selector as system-preference fallback [US-D2]
- [ ] The `[data-theme="dark"]` block defines adjusted values for at minimum: `--lense-color-bg`, `--lense-color-bg-subtle`, `--lense-color-text`, `--lense-color-text-muted`, `--lense-color-border`, `--lense-color-accent`, `--lense-color-accent-light`, `--lense-color-shadow`, all four `--lense-color-type-*` tokens, `--lense-color-success-bg`, `--lense-color-success-text`, `--lense-color-error-bg`, `--lense-color-error-text`, `--lense-color-status-open`, `--lense-color-status-done`, `--lense-color-status-parked` [US-D2]
- [ ] A theme toggle `<button>` element exists in the app DOM with an accessible label (e.g., `aria-label` containing "theme") [US-D2]
- [ ] Clicking the theme toggle sets the `data-theme` attribute on the `<html>` element to `"dark"` or `"light"` [US-D2]
- [ ] Theme preference is stored in `localStorage` under key `mustard-theme` — `localStorage.getItem('mustard-theme')` returns the selected value after toggle interaction [US-D2]
- [ ] `index.html` contains an inline `<script>` block (before the React bundle `<script>`) that reads `mustard-theme` from `localStorage` and sets `data-theme` on `document.documentElement` — prevents flash of wrong theme on page load [US-D2]
- [ ] Dark mode covers all surfaces: lense cards (`.lense-card`), CRUD panel (`.crud-panel`), detail drawer (`.detail-drawer`), list items (`.list-item`), tabs (`.crud-panel-tab`), list controls (`.list-controls-select`), blockquote/verse, error display (`.lense-error`), and stage indicators (`.lense-spinner`, `.lense-stage-text`) all derive colors from `var(--lense-*)` tokens — no hardcoded hex colors that bypass dark mode in `components.css`, `CrudPanel.css`, `DetailDrawer.css`, `ListItems.css`, `ListControls.css`, or `App.css` [US-D2]
- [ ] Playwright E2E test verifies: theme toggle button exists in DOM, clicking toggle changes `data-theme` attribute value on `document.documentElement` [US-D2]
- [ ] User guide "App Layout" page (`docs/manual/layout.md`) documents the theme toggle and dark mode behavior (system preference, manual override, persistence) [US-D2]
- [ ] Active tab's bottom border (`border-bottom-color`) uses the type-specific color token — e.g., Todos tab active uses `--lense-color-type-todo` (`#4a7fc4`), People tab active uses `--lense-color-type-people` (`#7b5ea7`), etc. — not a single `--lense-color-accent` for all tabs (verifiable by Playwright computed style or CSS class-per-type pattern in `CrudPanel.css`) [US-D3]
- [ ] Active tab count badge (`.crud-panel-tab--active .crud-panel-tab-count`) background uses a tinted variant of the type-specific color (not the generic `--lense-color-accent-light`) [US-D3]
- [ ] List items in the CRUD panel have a visible type-colored left indicator — a left border, accent stripe, or equivalent element using the type-specific color token (verifiable by inspecting `.list-item` computed styles or a CSS class per type in `ListItems.css`) [US-D3]
- [ ] Type-specific colors render correctly in dark mode — `[data-theme="dark"]` values for `--lense-color-type-*` tokens are applied (verifiable by setting `data-theme="dark"` and checking computed styles) [US-D3]
- [ ] Playwright E2E test verifies: active Todos tab has a border color matching `--lense-color-type-todo`, switching to People tab changes border color to match `--lense-color-type-people` [US-D3]
- [ ] Express server (`src/server/index.ts` or `src/server/app.ts`) serves Vite production build static files from `dist/` when not in dev mode, so the full app (API + frontend) runs on a single port [phase] (enables port 7777 replacement of legacy mustard)
- [ ] `ARCHITECTURE.md` production port entry updated from 5678 to 7777 [phase]
- [ ] `package.json` defines a `start` script (or equivalent) that builds and starts the production server [phase]
- [ ] `AGENTS.md` reflects: new design tokens (`--lense-color-type-*`, `--lense-color-success-*`, `--lense-color-error-*`), dark mode CSS architecture (`[data-theme]` + `prefers-color-scheme`), theme toggle UI element, production port 7777, and dark mode behavior [phase]
- [ ] `npm test` exits 0 with all existing unit tests passing [phase]
- [ ] `npm run test:e2e` exits 0 with all E2E tests passing (existing + new dark mode and type color tests) [phase]

### Golden principles (phase-relevant)
- **People first** — warm gold creates emotional familiarity ("this is MY tool"); dark mode respects comfort at any time of day; type-specific colors provide instant recognition
- **Faithful stewardship** — token-level change minimizes per-file edits and maximizes consistency; the original mustard's proven dark mode pattern is adapted, not reinvented
- **Clarity over complexity** — CSS custom properties absorb the palette shift; no JavaScript color manipulation; `[data-theme]` + `prefers-color-scheme` is a well-understood pattern
- **Continuous improvement** — the token system compounds: future components automatically inherit the warm palette and dark mode; production port 7777 positions mustard-lense as the daily driver
