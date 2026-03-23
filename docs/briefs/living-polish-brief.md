---
date: 2026-03-23
topic: living-polish
status: draft
---

# Intent Brief: Living Polish

## What
Two stories adding interaction feedback and micro-animations to the CRUD panel, plus delete functionality:

1. **Action celebration animations with delete** (US-D4) — Unique, fun CSS animations for each CRUD action. Create: a celebration effect (burst, flash, or pop) at the panel header tab when a new record saves. Edit: a shimmer or pulse on the refreshed list item. Delete: a farewell animation (tilt, shrink, fade) on the departing item. Includes adding `DELETE /api/records/:id` endpoint, a delete button in the drawer (edit mode only), and a confirmation step before delete (must not use browser `confirm()` dialog — builder picks the pattern).
2. **List item interaction polish** (US-D5) — Hover states with type-appropriate background color, click feedback (scale or flash) before the drawer opens, tab content crossfade (~150–200ms), and drawer backdrop fade in/out.

## Why
The CRUD panel currently has no interaction feedback — saves close silently, list items have no hover states, tabs swap instantly. These micro-interactions make the tool feel alive. The celebration animations transform data management from mechanical into fun — the MLP "whoa" moment. Jaco rejected conventional toasts in favor of playful physical animations: "capturing should be fun."

## Where
- `src/server/app.ts` — add `DELETE /api/records/:id` route
- `src/server/data/writer.ts` — add delete function (find file by ID, remove)
- `src/server/server.test.ts` — unit tests for delete endpoint
- `src/components/panel/DetailDrawer.tsx` / `.css` — delete button (edit mode), confirmation UX, drawer backdrop fade
- `src/components/panel/CrudPanel.tsx` / `.css` — animation triggers on create/edit/delete events, tab crossfade
- `src/components/panel/ListItems.tsx` / `.css` — hover states, click feedback, farewell animation on delete
- `src/components/tokens.css` — type-specific hover color variants (derived from existing `--lense-color-type-*` tokens)

## Constraints
- **CSS-only animations.** No animation libraries (Framer Motion, etc.). All effects via `@keyframes`, transitions, and transforms.
- **Simplified create celebration.** No projectile arc or cross-DOM motion. Use a simpler effect (burst, flash, pop, color pulse) localized to the tab area.
- **No browser `confirm()` for delete.** Confirmation is required but must use an in-app pattern (inline confirm, two-step button, etc.).
- **Depends on Phase 1 (Daily-Ready Visual Identity).** Celebration and hover effects use the type-specific color tokens (`--lense-color-type-*`) introduced in US-D1/D3.
- **Dropped — living focus (breathing glow on input).** Not successful in original mustard.
- **Dropped — reduced motion support.** Unnecessary for this project.

## Key decisions
- [Delete bundled with animations]: Delete is small, only exists to enable the farewell animation. Shipped as one story.
- [CSS-only]: Zero dependency animations. Keeps the bundle small and the implementation simple.
- [Simplified create celebration]: Arc/projectile replaced with localized effect. Easier to implement, easier to maintain.
- [No browser confirm()]: In-app confirmation for delete. Builder picks the specific UX pattern.

## Open questions
- Should the delete endpoint trigger a background reindex (same as create/update)?
- What happens to the drawer after delete — close immediately, or wait for the farewell animation to finish?

## Next step
→ spec-author: "add to PRD" or "define a phase" using this brief as input.
