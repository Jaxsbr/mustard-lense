---
date: 2026-03-23
topic: daily-ready
phase: 2
status: concept
depends_on: daily-ready-brief.md
---

# Concept: Living Polish

## What
Two stories adding action celebration animations and micro-interactions to the CRUD panel:

1. **Action celebration animations** (US-D4) — Unique, fun animations for each CRUD action. Create: a type-colored square arcs from the drawer to the panel header tab, spinning, shrinking, and fading. Edit: a distinct shimmer/pulse on the refreshed list item. Delete: a farewell animation (tilt, shrink, fade) on the departing item. Includes adding `DELETE /api/records/:id` endpoint, delete button in drawer (edit mode only), and confirmation before delete.
2. **List item interaction polish** (US-D5) — Hover states with type-appropriate background color, click feedback (scale or flash) before drawer opens, tab content crossfade (~150–200ms), and drawer backdrop fade in/out.

## Why
The CRUD panel currently has no interaction feedback — saves close silently, list items have no hover states, tabs swap instantly. These micro-interactions make the tool feel alive. The celebration animations transform data management from mechanical into fun — the MLP "whoa" moment.

## Dependency
Phase 1 (Visual Identity) must ship first. Celebration animations and hover effects use the type-specific color tokens (todo blue, people purple, etc.) introduced in US-D1/D3.

## Notes
- Delete was not in the original graduation brief but is prerequisite for the delete celebration animation. The endpoint is trivial (similar to update — find file, delete, return 200).
- Jaco rejected conventional toasts in favor of playful physical animations — "capturing should be fun."
- Living focus (breathing glow on input) explicitly dropped — not successful in original mustard.
- Reduced motion support explicitly dropped as unnecessary.

## Next step
→ Run idea-shape to promote this concept to a full brief in docs/briefs/.
