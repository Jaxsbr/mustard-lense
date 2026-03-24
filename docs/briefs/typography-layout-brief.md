---
date: 2026-03-24
topic: typography-layout
status: draft
---

# Intent Brief: Typography & layout (mustard-lense)

## What

Increase **baseline legibility** across the **CRUD panel** (tabs, sort/limit controls, list rows) and the **detail drawer** (labels, inputs, body text) by raising the **font scale in design tokens** and applying it consistently—so primary text is no longer uncomfortably small.

Improve **detail drawer layout**: **widen** the slide-over (currently **400px**, `max-width: 80vw`) so long lines and editing are less cramped. Restructure the drawer body so the main **`text` textarea** uses **all remaining vertical space** between the header/metadata fields and the footer (flex column + flex-grow on the text region). Remove reliance on a **short fixed height** and the **`rows={5}`** default as the primary height constraint; optional manual resize may remain, but the **default** should already use the available height.

**Out of scope for this brief:** Markdown, WYSIWYG, formatting toolbars, or edit/view modes — captured separately as `docs/concepts/markdown-rich-text-phase-2.md`.

## Why

The operator struggles to read list text and log detail/edit surfaces; the main note area feels vertically and horizontally cramped. Addressing type and layout first improves daily use without depending on a later rich-text stack.

## Where

- `src/components/tokens.css` — font-size tokens (`--lense-font-size-*`), any new panel/drawer-specific size tokens if needed.
- `docs/design.md` — typography section aligned with token changes.
- `src/components/panel/CrudPanel.css`, `ListItems.css`, `ListControls.css`, `DetailDrawer.css` — consume tokens; adjust only where sizing is set.
- `src/components/panel/DetailDrawer.tsx` — structure around the text field (wrapper for flex), remove fixed `rows` as sole height driver.
- Tests: extend `CrudPanel.test.tsx` and/or Playwright as needed for layout assertions.

## Constraints

- **Token-first** — Meaningful size changes flow through `tokens.css` and `docs/design.md`, not scattered magic numbers.
- **No Markdown** in this phase — plain `<textarea>` remains; no new markdown dependencies.
- **API unchanged** — Same `text` field and validation.

## Key decisions

- Ship **typography + drawer layout** before any Markdown editor phase.
- Wider drawer should still respect small viewports (`max-width` / `min()` / `clamp()` as appropriate).

## Open questions

- Exact target width (e.g. 520–600px vs % of viewport) — resolve during implementation with one measurable rule in CSS.

## Next step

→ spec-author: define phase **typography-layout** with stories US-R1 / US-R2 (or equivalent IDs).

## Related

- Supersedes the combined readability intent in the former single brief; Markdown follow-up: `docs/concepts/markdown-rich-text-phase-2.md`.
