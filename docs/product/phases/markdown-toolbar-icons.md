# Phase 12 — Markdown Toolbar Icons

**Status: Draft**

Replace text-label buttons in the markdown editor's `EditorToolbar` with compact inline SVG icons, adding `title` attributes for native tooltips and maintaining the existing active/inactive visual states.

## Stories

### US-X4 — Icon-based formatting toolbar

As Jaco, I want the markdown toolbar to use recognisable icons instead of text labels, so that the toolbar is compact, scannable, and feels like a standard rich-text editor.

**Acceptance criteria:**
- All 9 toolbar buttons display inline SVG icons instead of text labels
- Each button has a `title` attribute matching the action name (e.g. "Bold", "Italic") for native browser tooltips
- Each button retains its existing `aria-label` for accessibility
- The active state (accent background/border) remains visually distinct on icon buttons
- No new npm dependencies added for icons
- Icon size is 16×16px, toolbar button height ~32px

## Done-when (observable)

- [ ] All 9 toolbar buttons render SVG icons, not text labels [US-X4]
- [ ] Each toolbar button has a `title` attribute with the action name [US-X4]
- [ ] Each toolbar button retains its `aria-label` [US-X4]
- [ ] Active state styling is visually distinct on icon buttons [US-X4]
- [ ] No new dependencies in `package.json` [US-X4]
- [ ] `npm run typecheck` exits 0 [phase]
- [ ] `npm run lint` exits 0 [phase]
- [ ] `npm test` exits 0 with all tests passing [phase]
- [ ] `npm run build` exits 0 [phase]

**AGENTS.md sections affected:**
- None — modifications only to existing files.

## Golden principles (phase-relevant)
- **Clarity over complexity** — inline SVGs, no icon library dependency, native `title` tooltips
