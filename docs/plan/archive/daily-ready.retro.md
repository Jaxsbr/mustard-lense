## Phase retrospective — daily-ready

**Metrics:** 8 tasks, 2 investigate, 0 fail, 0 rework. Rework rate: 0%. Investigate ratio: 25%. Health: Healthy (CSS/JS-only phase — investigate-first not mandatory; 0% rework).

**Build-log failure classes:**
None — zero failures across 8 tasks. All verify + quality checks passed on every implementation task.

**Review-sourced failure classes:**
- `schema-code-drift` — pattern (1 finding: `--lense-shadow` renamed to `--lense-color-shadow` in tokens.css but `components.css` still referenced old name, breaking box-shadow on lense cards + structured-browse phase: exporting non-component values from CrudPanel.tsx broke React Fast Refresh). Fix proposed.
- `missing-error-path` — recurring (1 finding: catch-all `app.get('*')` returned index.html for unknown API routes instead of 404 + foundation phase first-seen + structured-browse phase pattern with existing compound fix). The existing compound fix targets async UI cancellation — this is a distinct sub-pattern (server-side route scoping). Fix proposed.

**Compounding fixes proposed:**
- [quality check] Add `token-consumer-check` to verify-gate: when `tokens.css` is modified, grep all `.css` files in `src/` for `var(--lense-` references and verify each referenced token name exists in tokens.css `:root` block. Reason: `schema-code-drift` in structured-browse (framework contract mismatch) and daily-ready (token rename broke consumer). The structured-browse instance was a different shape (export/component boundary) but the root cause is the same: renaming a contract without updating all consumers.
- [spec-author gate] Add rule to `.cursor/skills/spec-author/SKILL.md` done-when rules: any story introducing Express static file serving or catch-all routes must include a done-when criterion verifying that API routes (`/api/*`) are excluded from the catch-all and return proper 404 JSON responses. Reason: `missing-error-path` recurring across 3 phases — the existing async-UI compound fix from structured-browse doesn't cover server-side route scoping.
