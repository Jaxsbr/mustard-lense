## Phase retrospective — capture-edit

**Metrics:** 13 tasks (excl. review), 6 investigate, 0 fail, 0 rework. Rework rate: 0%. Investigate ratio: 46.2%. Health: Healthy.

**Build-log failure classes:**
None — zero failures across 13 tasks. All verify + quality checks passed on every implementation task.

**Review-sourced failure classes:**
- `security-gap` — pattern (2 findings: unvalidated request body spread on POST /api/records and direct cast on PUT /api/records/:id — arbitrary user-controlled fields passed into handler + intelligent-lense phase: prompt injection and raw LLM output leak). Fix proposed.

**Post-review operator feedback (not failure classes — UX refinements):**
- Sort by `capture_date_local` but display `due_date_local` for todos caused apparent sort disorder. Fixed: sort now uses displayed date (`due_date_local ?? capture_date_local`).
- "Status (open first)" sort replaced with status filter dropdown (All/Open/Done/Parked) per operator preference.
- Sort labels renamed from "Newest first"/"Oldest first" to "⬇ Date desc"/"⬆ Date asc".

**Compounding fixes proposed:**
- [spec-author gate] Add rule to `.cursor/skills/spec-author/SKILL.md` done-when rules: any story introducing API endpoints that accept user input (POST/PUT/PATCH bodies, query parameters) must include done-when criteria requiring explicit field allowlisting — no `...spread` or untyped casts from request bodies. Reason: `security-gap` in intelligent-lense PR review (LLM I/O sanitization) and capture-edit PR review (unvalidated request body spread on write endpoints). The intelligent-lense compound fix addressed LLM-specific I/O; this extends the pattern to general API input validation.
