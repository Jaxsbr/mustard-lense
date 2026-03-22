# Editing Records

## Detail drawer

Click any record in the CRUD panel list to open the detail drawer. The drawer slides in from the right side, keeping the list visible behind it for context.

### Editing a record

1. Click a record in any tab — the detail drawer slides in from the right.
2. Edit the fields you want to change (text, status, due date, etc.).
3. Click **Save** to persist changes — the drawer closes and the list updates.

The `log_type` and `id` fields are displayed but not editable in edit mode.

### Type-specific fields

| Type | Fields |
|------|--------|
| Todo | Text (textarea), Status (open/done/parked), Due date |
| People Note | Text (textarea), Person |
| Idea | Text (textarea), Status (open/done/parked) |
| Daily Log | Text (textarea), Theme |

### Closing the drawer

- Click the **Close** button (✕) in the drawer header
- Click outside the drawer (on the backdrop)

Neither action saves changes.

## Adding a new record

1. Click the **+** button in the panel header — the detail drawer opens with an empty form, type pre-set to the active tab.
2. Type your note, idea, or todo in the text field (auto-focused).
3. Optionally change the record type via the dropdown.
4. Click **Save** — the record is created and appears in the list.

The **Save** button is disabled until you enter text.

### Auto-filled fields

When creating a record, the following fields are filled automatically:
- **ID** — a unique identifier (UUID)
- **Capture date** — today's date
- **Source** — "mustard-app"
- **Meta** — empty tags array
