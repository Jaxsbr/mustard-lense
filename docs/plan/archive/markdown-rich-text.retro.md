## Phase retrospective — markdown-rich-text

**Metrics:** 9 tasks (1 investigate, 4 implement/test, 1 docs, 3 review), 0 fail, 0 rework. Rework rate: 0%. Investigate ratio: 17% (1/6 build tasks). Health: Warning (low investigate ratio — acceptable for CSS/JS-only phase where investigate-first is recommended but not mandatory).

**Build-log failure classes:**
None — zero failures across 9 tasks. All verify + quality checks passed on every task.

**Review-sourced failure classes:**
- `cross-cutting-break` — pattern (1 finding: manual `editor?.destroy()` useEffect conflicted with TipTap `useEditor` hook's built-in unmount cleanup, risking double-destroy + foundation phase tsconfig Node globals leak). Fix proposed.

**Compounding fixes proposed:**
- [learnings] Add learning #39 to `~/dev/.docs/build-system/LEARNINGS.md`: when integrating third-party React hooks that manage their own lifecycle (editors, animation libraries, form managers), do not add manual cleanup effects — rely on the hook's built-in teardown. Reason: `cross-cutting-break` in foundation (tsconfig leak) and markdown-rich-text (hook double-destroy) — both stem from adding redundant configuration/cleanup that conflicts with a library's built-in behavior.
