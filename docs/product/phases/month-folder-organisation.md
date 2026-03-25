# Phase 13 — Month-Folder Organisation

**Status: Draft**

Update the writer to save new records into `YYYY/MM/` subdirectories within each type folder. No migration of existing flat files.

## Stories

### US-X5 — Month-folder write path for new records

As Jaco, I want new records created via mustard-lense to be saved into `YYYY/MM/` subdirectories (e.g. `daily_logs/2026/03/<uuid>.yaml`), so that the data store stays consistently organised as it grows.

**Acceptance criteria:**
- `createRecord()` derives `YYYY/MM` from `capture_date_local` and uses it in the file path
- The month subdirectory is created with `{ recursive: true }`
- `findYamlFiles()` already recurses — verify it reads from the new paths (no reader changes expected)
- Existing flat files continue to be read and updated in place (no migration)
- No API contract changes

## Done-when (observable)

- [ ] `createRecord()` writes files to `<type_dir>/YYYY/MM/<uuid>.yaml` [US-X5]
- [ ] Month directory is created with `{ recursive: true }` [US-X5]
- [ ] A unit test asserts the created file path includes the correct `YYYY/MM/` subdirectory [US-X5]
- [ ] Existing records in flat directories are still readable via `readRecords()` [US-X5]
- [ ] `npm run typecheck` exits 0 [phase]
- [ ] `npm run lint` exits 0 [phase]
- [ ] `npm test` exits 0 with all tests passing [phase]
- [ ] `npm run build` exits 0 [phase]

**AGENTS.md sections affected:**
- None — internal implementation change, no new files or ownership changes.

## Golden principles (phase-relevant)
- **Faithful stewardship** — derive month from existing `capture_date_local`, don't re-call `new Date()`
