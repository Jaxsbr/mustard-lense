## Phase goal

Update the writer to save new records into `YYYY/MM/` subdirectories within each type folder. No migration of existing flat files.

### Stories in scope
- US-X5 — Month-folder write path for new records

### Done-when (observable)

- [ ] `createRecord()` writes files to `<type_dir>/YYYY/MM/<uuid>.yaml` [US-X5]
- [ ] Month directory is created with `{ recursive: true }` [US-X5]
- [ ] A unit test asserts the created file path includes the correct `YYYY/MM/` subdirectory [US-X5]
- [ ] Existing records in flat directories are still readable via `readRecords()` [US-X5]
- [ ] `npm run typecheck` exits 0 [phase]
- [ ] `npm run lint` exits 0 [phase]
- [ ] `npm test` exits 0 with all tests passing [phase]
- [ ] `npm run build` exits 0 [phase]

### Golden principles (phase-relevant)
- **Faithful stewardship** — derive month from existing `capture_date_local`, don't re-call `new Date()`
