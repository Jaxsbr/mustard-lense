---
date: 2026-03-23
topic: daily-ready
status: draft
---

# Intent Brief: Daily-Ready Visual Identity

## What
Port the original mustard app's warm visual identity into the React app and add dark mode. Three stories:

1. **Warm gold design token port** — Replace the cool blue-grey palette (`#4f6d7a`) with the original's warm gold (`#c8982c`), type-specific colors (todo `#4a7fc4`, people `#7b5ea7`, daily `#e07850`, idea `#2d9574`), warm background (`#faf9f6`), and success/error colors. Token-level change in `tokens.css` — all components pick up the new palette automatically.
2. **Dark mode** — Port the `[data-theme="dark"]` + `@media (prefers-color-scheme: dark)` dual pattern from the original. Theme toggle button, localStorage persistence, no flash on load.
3. **Type-specific CRUD panel colors** — Use new type color tokens to give each tab and list item its own color identity: active tab border, count badge, and list item indicators use type-appropriate colors. Works in both light and dark modes.

## Why
mustard-lense is functionally sufficient (5 phases shipped) but visually clinical. The cool blue-grey palette feels like a prototype, not a daily-driver. The original's warm gold creates emotional familiarity — "this is MY tool." Dark mode is essential for comfort at any time of day. Type-specific colors bring instant recognition (proven in the original).

## Where
- `src/components/tokens.css` — primary token definitions
- `src/components/components.css`, `src/App.css` — lense component and layout styles
- `src/components/panel/*.css` — CRUD panel, drawer, list item, and control styles
- `~/dev/mustard/app/static/style.css` — reference source (read-only)

## Constraints
- **Visual port, not copy-paste.** Each element reshaped to fit the React token system.
- **No runtime dependency on original mustard.** One-time adaptation.
- **Token-level change preferred.** `--lense-*` CSS variables absorb the palette shift.
- **Dark mode must cover all surfaces.** Lense cards, panel, drawer, list items, tabs, controls, blockquote/verse.

## Key decisions
- [Port 7777 for production]: Replaces legacy mustard on the same port.
- [Visual audit at spec time]: Elements vetted in spec, not during build.
- [Story ID prefix US-D]: "Daily-ready" capability area.
- [Token-first approach]: Update `tokens.css` variables; components using `var(--lense-*)` shift automatically.
- [Dark mode pattern from original]: `[data-theme="dark"]` + `prefers-color-scheme` dual approach, proven in original.
- [Dropped — reduced motion]: Jaco determined this is unnecessary for the project.
- [Dropped — living focus animation]: Not successful in the original mustard.

## Open questions
None — all resolved during spec-author conversation.

## Next step
→ spec-author: stories US-D1, US-D2, US-D3 are drafted and approved. Proceed to done-when criteria.
