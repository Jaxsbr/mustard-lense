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

### Deleting a record

1. Click a record to open the detail drawer in edit mode.
2. Click **Delete** at the bottom-left of the drawer.
3. A confirmation prompt appears — click **Yes, delete** to confirm, or **Cancel** to go back.
4. On confirm, the record plays a farewell animation (tilt, shrink, fade) and is removed from the list. The tab count decrements.

The delete button is only visible in edit mode — it does not appear when creating a new record.

## Markdown editing

The text field in the detail drawer supports two editing modes:

### Mode control

A **Raw** / **Styled** toggle appears above the text area. Click to switch between modes:

- **Raw mode** — a plain textarea where you type Markdown source directly (e.g. `**bold**`, `- list item`). This is the default.
- **Styled mode** — a rich editor where formatting renders inline as you type (Notion-like). Bold text appears bold, lists appear as actual lists, etc.

Your preferred mode is saved in your browser (`localStorage` key `mustard-text-mode`). The next time you open the drawer, your last-used mode is restored automatically.

Switching modes preserves your text — nothing is lost when toggling. Both modes save to the same plain Markdown string, so your data is always portable.

### Formatting toolbar

When styled mode is active, a compact toolbar appears above the editor with 9 formatting actions:

| Action | What it does |
|--------|-------------|
| **Bold** | Wraps selected text in `**...**` |
| **Italic** | Wraps selected text in `*...*` |
| **Strikethrough** | Wraps selected text in `~~...~~` |
| **Link** | Prompts for a URL and creates `[text](url)` |
| **Bullet list** | Converts lines to `- item` list |
| **Ordered list** | Converts lines to `1. item` list |
| **Blockquote** | Prefixes lines with `> ` |
| **Inline code** | Wraps selection in backticks |
| **Code block** | Wraps selection in triple backtick fences |

**Note:** Underline is intentionally unsupported — it is not part of the CommonMark Markdown standard, and including it would complicate plain-text storage.

The toolbar is hidden in raw mode.

### Closing the drawer

- Click the **Close** button (✕) in the drawer header
- Click outside the drawer (on the backdrop). The backdrop fades in when the drawer opens.

Neither action saves changes.

## Celebration animations

The app celebrates your actions with subtle CSS animations:

- **Create** — a burst/pop animation plays on the active tab header when a new record saves.
- **Edit** — a shimmer animation highlights the updated list item after saving.
- **Delete** — a farewell animation (tilt, shrink, fade) plays on the departing item before it disappears.

All three animations are cohesive and happen automatically — no action needed.

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
