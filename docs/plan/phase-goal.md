## Phase goal

Replace text-label buttons in the markdown editor's EditorToolbar with compact inline SVG icons, adding title attributes for native tooltips and maintaining the existing active/inactive visual states.

### Stories in scope
- US-X4 — Icon-based formatting toolbar

### Done-when (observable)

- [x] All 9 toolbar buttons render SVG icons, not text labels [US-X4]
- [x] Each toolbar button has a `title` attribute with the action name [US-X4]
- [x] Each toolbar button retains its `aria-label` [US-X4]
- [x] Active state styling is visually distinct on icon buttons [US-X4]
- [x] No new dependencies in `package.json` [US-X4]
- [x] `npm run typecheck` exits 0 [phase]
- [x] `npm run lint` exits 0 [phase]
- [x] `npm test` exits 0 with all tests passing [phase]
- [x] `npm run build` exits 0 [phase]

### Golden principles (phase-relevant)
- **Clarity over complexity** — inline SVGs, no icon library dependency, native `title` tooltips
