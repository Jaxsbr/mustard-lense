## Phase goal

Add an optional `title` field to all record types. Display title in list views when present, fall back to truncated text. Editable in detail drawer. Server-side 120-char validation.

### Stories in scope
- US-X6 — Optional title field across the stack
- US-X7 — Title field validation

### Done-when (observable)

- [ ] `MustardRecord` interface includes `title: string | null` [US-X6]
- [ ] `readRecords()` returns `title` from YAML, defaulting to `null` [US-X6]
- [ ] `createRecord()` and `updateRecord()` persist `title` to YAML [US-X6]
- [ ] `POST /api/records` and `PUT /api/records/:id` accept `title` in request body [US-X6]
- [ ] All 4 list item components prefer `title` over `truncate(text)` when title is non-empty [US-X6]
- [ ] Detail drawer shows a "Title (optional)" input above text editor [US-X6]
- [ ] Server returns 400 when title exceeds 120 characters [US-X7]
- [ ] Empty/null title is accepted without error [US-X7]
- [ ] `npm run typecheck` exits 0 [phase]
- [ ] `npm run lint` exits 0 [phase]
- [ ] `npm test` exits 0 with all tests passing [phase]
- [ ] `npm run build` exits 0 [phase]
- [ ] Unit tests cover title display preference and validation [phase]

### Golden principles (phase-relevant)
- **Faithful stewardship** — no data migration; existing records without title work unchanged
