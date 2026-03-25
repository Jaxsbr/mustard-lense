# Phase 14 — Record Title Field

**Status: Draft**

Add an optional `title` field to all record types. Display title in list views when present, fall back to truncated text. Editable in detail drawer.

## Stories

### US-X6 — Optional title field across the stack

As Jaco, I want an optional title field on records so that I can give records a short, intentional label that makes the list view scannable without reading truncated prose.

**Acceptance criteria:**
- `MustardRecord` interface has `title: string | null`
- Reader maps `title` from YAML (defaults to `null` if absent)
- Writer persists `title` on create and update when provided
- API passes `title` through in create/update request bodies
- List items prefer `record.title` over `truncate(record.text)` when title is non-empty
- Detail drawer shows a "Title (optional)" text input above the text editor
- No data migration — existing records without `title` continue to work

### US-X7 — Title field validation

As the system, I want to enforce a 120-character limit on the title field server-side, so that titles stay short and scannable.

**Acceptance criteria:**
- Server validates `title` length ≤ 120 on create and update
- Returns 400 if title exceeds 120 characters
- Empty string or null title is accepted (title is optional)

## Done-when (observable)

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

**AGENTS.md sections affected:**
- Detail drawer section (new title field)
- Write API section (title in create/update)
- MustardRecord type description

## Golden principles (phase-relevant)
- **Faithful stewardship** — no data migration; existing records without title work unchanged
