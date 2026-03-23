# Phase: typography-layout

**Status:** Shipped on `main` at `2e021db` (*feat: typography scale and drawer layout improvements*). PR **#8** merged; retrospective: `docs/plan/archive/typography-layout.retro.md`.

---

## Phase goal

Increase baseline legibility across the CRUD panel and detail drawer by raising the font scale in design tokens and applying it consistently. Widen the detail drawer and restructure it so the text textarea fills all remaining vertical space instead of relying on a short fixed `rows={5}` height.

### Dependencies
- living-polish (archived)

### Stories in scope
- US-R1 — Typography scale increase
- US-R2 — Detail drawer layout improvement

### Done-when (observable)

**US-R1 — Typography scale increase:**
- [x] `tokens.css` `:root` defines `--lense-font-size-sm` with a value >= `0.875rem` [US-R1]
- [x] `tokens.css` `:root` defines `--lense-font-size-base` with a value >= `1rem` [US-R1]
- [x] `tokens.css` `:root` defines `--lense-font-size-lg` with a value >= `1.25rem` [US-R1]
- [x] Tab labels (`.crud-panel-tab` or equivalent) use a font-size token (`--lense-font-size-*`) — no hardcoded px/rem values in the tab CSS rule [US-R1]
- [x] List item primary text uses a font-size token — no hardcoded px/rem for the main text line in `ListItems.css` [US-R1]
- [x] Sort/limit controls (`ListControls.css`) use font-size tokens — no hardcoded px/rem for control labels or dropdowns [US-R1]
- [x] Detail drawer labels and input text use font-size tokens — no hardcoded px/rem in `DetailDrawer.css` for `.drawer-label`, `.drawer-input`, `.drawer-textarea` [US-R1]
- [x] `npm run typecheck && npm run lint && npm test` passes with zero errors [US-R1]

**US-R2 — Detail drawer layout improvement:**
- [x] Detail drawer width is >= 500px in `DetailDrawer.css` — verifiable by reading the `.detail-drawer` width rule (implemented as `min(520px, 90vw)`) [US-R2]
- [x] Detail drawer uses a responsive width so it does not overflow narrow viewports (e.g. `min()`, `clamp()`, or `vw` cap) [US-R2]
- [x] The drawer body uses a flex-column layout where the text textarea region grows to fill remaining vertical space (`flex: 1` or `flex-grow: 1` on the textarea wrapper or textarea itself) [US-R2]
- [x] The textarea element does NOT rely solely on `rows={5}` as its height constraint — `rows` removed or CSS overrides rows-based height [US-R2]
- [x] On a viewport width of 500px, the drawer does not overflow horizontally — width rule keeps it within bounds [US-R2]
- [x] `npm run typecheck && npm run lint && npm test` passes with zero errors [US-R2]

**Phase-level:**
- [x] `AGENTS.md` reflects: updated font-size token values, drawer width change, drawer flex layout [phase]
- [x] No new JavaScript animation libraries added to `package.json` [phase]

### Golden principles (phase-relevant)
- **Token-first** — meaningful size changes flow through `tokens.css`, not scattered magic numbers
- **Faithful stewardship** — CSS-only changes, no new dependencies, existing patterns preserved
- **Clarity over complexity** — standard CSS flexbox for drawer layout; responsive width via `min()`/`clamp()`

---

## Regenerated verification steps (operator)

Use this after `git fetch` / `git pull` to confirm the tree matches the shipped phase.

1. **Sync:** `git checkout main && git pull origin main`
2. **Quality gate:** `npm run typecheck && npm run lint && npm test && npm run build`
3. **Tokens:** In `src/components/tokens.css`, confirm `--lense-font-size-sm` ≥ `0.875rem`, `--lense-font-size-base` ≥ `1rem`, `--lense-font-size-lg` ≥ `1.25rem`
4. **Drawer width:** In `src/components/panel/DetailDrawer.css`, `.detail-drawer` uses a width ≥ 500px (e.g. `min(520px, 90vw)`)
5. **Textarea layout:** Same file — `.drawer-field--text` and `.drawer-textarea` use flex so the main text area grows; `DetailDrawer.tsx` has no `rows={5}` on the text `<textarea>`
6. **Manual smoke:** `npm run dev` → open any record → drawer should be wider than the old 400px cap and the text area should use vertical space in the drawer body

---

## Next steps (follow-on work)

- **Markdown / rich text** (depends on this phase): concept `docs/concepts/markdown-rich-text-phase-2.md` — spec-author + build-loop when you are ready to add raw vs styled editing and a toolbar.
