## Phase retrospective — foundation

**Metrics:** 15 tasks, 9 investigate, 0 fail, 0 rework. Rework rate: 0%. Investigate ratio: 60%. Health: Healthy.

**Review-sourced failure classes:**
- `silent-test-pass` — first-seen (1 finding: smoke tests pipe to stdout without programmatic assertion despite done-when requiring "verified via string contains check")
- `missing-asset` — first-seen (1 finding: index.html references /favicon.svg that was never added — 404 on every page load)
- `cross-cutting-break` — first-seen (1 finding: adding "node" to tsconfig.app.json types leaks Node globals to browser-only components like App.tsx)
- `missing-error-path` — first-seen (1 finding: spawn promise registers both close and error handlers without a settled guard — can settle twice)

**Compounding fixes proposed:**
None — all failure classes are first-seen with no prior occurrences. No data-loss or security-gap classes requiring immediate compounding.
