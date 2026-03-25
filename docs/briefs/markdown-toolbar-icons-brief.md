---
date: 2026-03-25
topic: markdown-toolbar-icons
status: specced
---

# Intent Brief: Icon-Based Markdown Toolbar with Tooltips

## What
Replace the current text-label buttons in the markdown editor's `EditorToolbar` with a compact, unified icon bar. Each action gets a recognisable icon (SVG or unicode), a visible tooltip on hover (native `title` attribute or CSS tooltip), and a clear active/inactive visual state. The bar should feel like a standard rich-text toolbar — compact, scannable, and unobtrusive.

## Why
The current toolbar renders full text labels ("Bold", "Italic", "Strikethrough"…) which makes it wide, wordy, and visually noisy. Users familiar with any text editor expect icon-based formatting bars. A compact icon bar reduces visual weight, aligns with the app's polished design language, and makes the editor feel professional and delightful to use.

## Where
- `src/components/panel/MarkdownEditor.tsx` — `EditorToolbar` component: replace text button labels with icon elements; add `title` attributes for tooltip text
- `src/components/panel/MarkdownEditor.css` — toolbar layout: ensure icons are evenly spaced, correct size, and the active state is visually distinct; add hover styles
- No changes to the action logic — only the visual representation of the toolbar buttons changes

## Constraints
- Prefer inline SVG icons or unicode symbols over an icon library dependency (keep bundle lean).
- Tooltips must be accessible: use `aria-label` (already present) plus `title` for native tooltip; do not rely on CSS-only tooltips that break screen readers.
- Icon set should cover the current 9 actions: Bold, Italic, Strikethrough, Link, Bullet list, Ordered list, Blockquote, Inline code, Code block.
- Active state must remain clearly distinguishable (currently via a CSS class — keep that pattern).
- The Raw / Styled mode toggle above the toolbar is separate and should not be visually merged with the icon bar.
- Underline is visible in the reference screenshot but is not currently wired to a TipTap action — do not add it unless TipTap's `StarterKit` supports it out of the box without extra config.

## Key decisions
- No new npm dependency for icons: use inline SVG paths for the standard actions (Bold = **B**, Italic = *I*, etc. are well-known paths) or unicode where appropriate.
- Tooltip implementation: `title` attribute (native browser tooltip) is sufficient for v1; CSS tooltip layer is an optional enhancement, not required.
- Icon sizing: 16px × 16px icons, toolbar height ~32px, consistent with the existing drawer form density.

## Open questions
- Should the toolbar be sticky (always visible) when the editor content is long enough to scroll? Out of scope for this phase — address if raised during build.
- Underline: explicitly excluded. TipTap's `StarterKit` does not include it and adding `@tiptap/extension-underline` is not warranted for this phase.

## Next step
→ spec-author: "define a phase" using this brief as input.
