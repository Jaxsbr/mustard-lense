## Phase retrospective — multi-scan-retrieval

**Metrics:** 1 task, 0 investigate, 0 fail, 0 rework. Rework rate: 0%. Investigate ratio: 0%. Health: Healthy.

**Build-log failure classes:**
None — zero failures across 1 task. All verify + quality checks passed.

**Review-sourced failure classes:**
- `security-gap` — pattern (1 finding: person names, themes, and tags from vocabulary string-interpolated directly into LanceDB SQL WHERE clauses without escaping — apostrophes in data values break filter queries. Fixed by escaping single quotes. + intelligent-lense phase: prompt injection/LLM output leak + capture-edit phase: unvalidated request body spread). Fix proposed.

**Compounding fixes proposed:**
- [spec-author gate] Add rule to `.cursor/skills/spec-author/SKILL.md` done-when rules: any story that builds query filters or WHERE clauses from data-derived values (vocabulary, user records, config) must include done-when criteria requiring parameterised or escaped value interpolation — no raw string concatenation into query strings. Reason: `security-gap` in intelligent-lense (LLM I/O), capture-edit (API input validation), and multi-scan-retrieval (data-derived SQL filter interpolation). Existing spec-author compounds cover LLM I/O and API input allowlisting but not data-to-query interpolation.
