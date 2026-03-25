---
date: 2026-03-25
topic: record-title-field
status: specced
---

# Intent Brief: Optional Title Field for All Record Types

## What
Introduce an optional `title` field to all mustard record types (todo, idea, daily_log, people_note). In the CRUD panel list view, when a record has a non-empty `title`, display that title instead of the current truncated-text fallback. When `title` is absent or empty, preserve the existing behaviour (first ~80 chars of `text`). The title field should also be surfaced as an editable input in the detail drawer.

## Why
The list view currently truncates `text`, which is often mid-sentence prose. Users scanning past records cannot quickly identify what a record is about. A short, intentional title makes the list scannable and reduces the effort of finding a specific record later. Making it optional means existing records continue to display correctly with no data migration.

## Where
- `src/shared/record.ts` — add `title: string | null` to `MustardRecord`
- `src/server/data/writer.ts` — `CreateRecordInput` and `UpdateRecordInput`: add optional `title`; `createRecord` / `updateRecord`: persist `title` to YAML when provided
- `src/server/data/reader.ts` — map `title` from YAML into `MustardRecord` (default to `null` if absent)
- `src/components/panel/ListItems.tsx` — update all `*ListItem` components to prefer `record.title` over `truncate(record.text)` when title is present
- `src/components/panel/DetailDrawer.tsx` — add a `title` input field above the main text editor in the form; label "Title (optional)"
- `src/components/panel/types.ts` — ensure `PanelRecord` type alias picks up the new field
- Server API handlers (`src/server/app.ts`) — pass `title` through in create/update request bodies

## Constraints
- `title` is optional in both input and storage — never required, never default to a generated value.
- No data migration: existing YAML files without `title` continue to work; reader must default to `null`.
- The fallback behaviour in `ListItems` must be preserved exactly: if `title` is null or empty string, show `truncate(record.text)`.
- Keep the title input short (single-line text input, not a textarea).

## Key decisions
- Fallback rule: `title?.trim() ? title : truncate(text)` — empty string behaves like absent.
- Field position in drawer: title appears above text/markdown editor, since it labels the record.
- No display of title inside the editor or detail view body — it is a metadata label, not content.

## Open questions
- Should the lense (RAG / AI responses) be updated to surface `title` in its rendered components (e.g. IdeaList, LogTimeline)? Start with CRUD panel only and revisit.
- Is there a character limit to enforce on `title`? Suggest 120 chars server-side validation.

## Next step
→ spec-author: "define a phase" using this brief as input.
