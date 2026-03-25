## Phase goal

Replace text-label buttons in the markdown editor's EditorToolbar with compact inline SVG icons, adding title attributes for native tooltips and maintaining the existing active/inactive visual states.

### Stories in scope
- US-X4 — Icon-based formatting toolbar

### Done-when (observable)

- [ ] All 9 toolbar buttons render SVG icons, not text labels [US-X4]
- [ ] Each toolbar button has a `title` attribute with the action name [US-X4]
- [ ] Each toolbar button retains its `aria-label` [US-X4]
- [ ] Active state styling is visually distinct on icon buttons [US-X4]
- [ ] No new dependencies in `package.json` [US-X4]
- [ ] `npm run typecheck` exits 0 [phase]
- [ ] `npm run lint` exits 0 [phase]
- [ ] `npm test` exits 0 with all tests passing [phase]
- [ ] `npm run build` exits 0 [phase]

### Golden principles (phase-relevant)
- **Clarity over complexity** — inline SVGs, no icon library dependency, native `title` tooltips
