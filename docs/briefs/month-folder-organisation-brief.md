---
date: 2026-03-25
topic: month-folder-organisation
status: specced
---

# Intent Brief: Month-Folder Organisation for New Records

## What
Update the mustard-lense writer to save new records into `YYYY/MM/` subdirectories within each type folder (e.g. `daily_logs/2026/03/<uuid>.yaml`). This matches the folder structure that mustard-data already uses for some records and keeps the data store consistently organised by month. No migration of existing flat files is required — only new records created via mustard-lense must follow the new path pattern.

## Why
mustard-data contains records in both flat type dirs and `YYYY/MM/` month dirs, which creates inconsistency. As the data grows, flat directories become harder to navigate and maintain. Aligning the writer to the month-folder convention ensures future records are organised and the overall data store is predictable.

## Where
- `src/server/data/writer.ts` — `createRecord()`: derive `YYYY/MM` from `capture_date_local` and use it as the subdirectory when constructing `filePath`
- `src/server/data/reader.ts` — verify `findYamlFiles()` already recurses into subdirectories (if not, update to do so)
- `writer.test.ts` (if it exists) — add a test asserting the created file lands in the correct month subdirectory

## Constraints
- Do not migrate or move existing flat YAML files — read-side already handles recursion via `findYamlFiles`.
- The `capture_date_local` field (ISO `YYYY-MM-DD`) is already set at creation time — derive month from it, do not re-call `new Date()`.
- No breaking change to the API contract (request/response shape stays the same).
- Month dir must be created with `{ recursive: true }` to handle missing year or month dirs safely.

## Key decisions
- Scope to new records only: Existing flat files continue to be read and updated in place (no migration).
- Source of truth for date: `capture_date_local` already on the record — parse `YYYY-MM` from it.

## Open questions
- Does `findYamlFiles` in `reader.ts` already recurse deeply enough to find `daily_logs/2026/03/<uuid>.yaml`? Verify before writing tests.

## Next step
→ spec-author: "define a phase" using this brief as input.
