## Phase retrospective — living-polish

**Metrics:** 11 tasks (9 build + 2 review), 2 investigate, 0 fail, 0 rework. Rework rate: 0%. Investigate ratio: 22% (2/9 build tasks). Health: Healthy (0% rework; CSS/JS-only phase after initial server work; investigate-first applied correctly to DELETE endpoint).

**Build-log failure classes:**
None — zero failures across 11 tasks. All verify + quality checks passed on every implementation task.

**Review-sourced failure classes:**
- `missing-error-path` — recurring (1 concern: `handleDelete` created AbortController but didn't wire it to component unmount cleanup + structured-browse pattern + daily-ready recurring). The spec-author compound from structured-browse worked — the spec included an explicit AbortController criterion `[US-D4]`. The builder implemented AbortController for the fetch signal but missed the unmount cleanup wiring. Caught and fixed during review. This is a builder execution gap (the spec was correct), not a spec gap. No new compound needed — the existing spec-author rule is effective.
- `e2e-mock-gap` — first-seen (1 bug report: Playwright route mock pattern `**/api/records*` didn't intercept DELETE `/api/records/:id` because glob `*` doesn't cross `/` boundaries. DELETE requests fell through to 404. Fixed by changing to `**/api/records**`). Note: this was caught by operator testing, not by the automated review.

**Compounding fixes proposed:**
- [quality check] Add `e2e-route-coverage` check: when E2E tests use `page.route()` with glob patterns containing `*` (single star), verify the pattern also covers sub-path routes (`:id` parameters). Specifically, `**/api/<resource>*` patterns must use `**` (double star) suffix to match `/api/<resource>/:id` paths. Reason: `e2e-mock-gap` first-seen in living-polish — but this is a `security-gap`-adjacent class (tests passing without exercising the feature). Compound immediately because the pattern silently masks real API integration: E2E tests appear to pass while the mock never intercepts write operations on individual resources.
