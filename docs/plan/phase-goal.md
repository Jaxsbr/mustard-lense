## Phase goal

Increase baseline legibility across the CRUD panel and detail drawer by raising the font scale in design tokens and applying it consistently. Widen the detail drawer and restructure it so the text textarea fills all remaining vertical space instead of relying on a short fixed `rows={5}` height.

### Dependencies
- living-polish (archived)

### Stories in scope
- US-R1 — Typography scale increase
- US-R2 — Detail drawer layout improvement

### Done-when (observable)

**US-R1 — Typography scale increase:**
- [ ] `tokens.css` `:root` defines `--lense-font-size-sm` with a value >= `0.875rem` (currently `0.85rem`) [US-R1]
- [ ] `tokens.css` `:root` defines `--lense-font-size-base` with a value >= `1rem` [US-R1]
- [ ] `tokens.css` `:root` defines `--lense-font-size-lg` with a value >= `1.25rem` [US-R1]
- [ ] Tab labels (`.crud-panel-tab` or equivalent) use a font-size token (`--lense-font-size-*`) — no hardcoded px/rem values in the tab CSS rule [US-R1]
- [ ] List item primary text uses a font-size token — no hardcoded px/rem for the main text line in `ListItems.css` [US-R1]
- [ ] Sort/limit controls (`ListControls.css`) use font-size tokens — no hardcoded px/rem for control labels or dropdowns [US-R1]
- [ ] Detail drawer labels and input text use font-size tokens — no hardcoded px/rem in `DetailDrawer.css` for `.drawer-label`, `.drawer-input`, `.drawer-textarea` [US-R1]
- [ ] `npm run typecheck && npm run lint && npm test` passes with zero errors [US-R1]

**US-R2 — Detail drawer layout improvement:**
- [ ] Detail drawer width is >= 500px (currently 400px) in `DetailDrawer.css` — verifiable by reading the `.detail-drawer` width value [US-R2]
- [ ] Detail drawer `max-width` uses a responsive approach (e.g., `min()`, `clamp()`, or media query) so it doesn't overflow on viewports < 600px [US-R2]
- [ ] The drawer body uses a flex-column layout where the text textarea region grows to fill remaining vertical space (`flex: 1` or `flex-grow: 1` on the textarea wrapper or textarea itself) [US-R2]
- [ ] The textarea element does NOT rely solely on `rows={5}` as its height constraint — either `rows` is removed/increased or the textarea has CSS that overrides the rows-based height (e.g., `height: 100%`, `flex: 1`, `min-height` significantly larger than 5 rows) [US-R2]
- [ ] On a viewport width of 500px, the drawer does not overflow horizontally — `max-width` constraint keeps it within bounds [US-R2]
- [ ] `npm run typecheck && npm run lint && npm test` passes with zero errors [US-R2]

**Phase-level:**
- [ ] `AGENTS.md` reflects: updated font-size token values, drawer width change, drawer flex layout [phase]
- [ ] No new JavaScript animation libraries added to `package.json` [phase]

### Golden principles (phase-relevant)
- **Token-first** — meaningful size changes flow through `tokens.css`, not scattered magic numbers
- **Faithful stewardship** — CSS-only changes, no new dependencies, existing patterns preserved
- **Clarity over complexity** — standard CSS flexbox for drawer layout; responsive width via `min()`/`clamp()`
