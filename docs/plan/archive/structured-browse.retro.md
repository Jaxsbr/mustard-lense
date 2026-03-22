## Phase retrospective — structured-browse

**Metrics:** 14 tasks, 6 investigate, 0 fail, 0 rework. Rework rate: 0%. Investigate ratio: 42.9%. Health: Healthy.

**Review-sourced failure classes:**
- `schema-code-drift` — first-seen (1 finding: exporting non-component values from CrudPanel.tsx breaks React Fast Refresh — framework contract mismatch)
- `missing-error-path` — pattern (1 finding: no AbortController on tab-switch fetches creates race condition + foundation phase: spawn promise double-settle). Fix proposed.

**Compounding fixes proposed:**
- [spec-author gate] Add rule to `.cursor/skills/spec-author/SKILL.md` done-when rules: any story involving async UI interactions (fetches, subscriptions, event listeners) must include done-when criteria for cancellation/cleanup on unmount or state change, preventing race conditions and resource leaks. Reason: `missing-error-path` in foundation PR review (spawn double-settle) and structured-browse PR review (fetch race on tab switch).
