# App Layout

Mustard uses a split-screen layout with two regions: the CRUD panel on the left and the lense on the right.

## Split-screen overview

- **CRUD panel (left)** — structured browse interface with type tabs for navigating your mustard records. Tabs: Todos, People, Ideas, Daily Logs. Each tab shows a compact list view tailored to that record type.
- **Lense (right)** — AI-powered intent input. Type a natural language query, and the lense retrieves relevant records, synthesises a response, and renders structured results. Always visible regardless of panel state.

## Panel toggle

Click the toggle button in the panel header to collapse or expand the CRUD panel.

- **Expanded** — panel occupies ~40% of the viewport width, showing tabs and record lists.
- **Collapsed** — panel shrinks to a narrow toggle strip, and the lense fills the full width.
- **Responsive** — on viewports below 768px, the panel auto-collapses to give the lense maximum space.

## Type tabs

The CRUD panel header contains four tabs:

| Tab | Record type | Key fields shown |
|-----|-------------|------------------|
| Todos | `todo` | Status icon, text (truncated), due date |
| People | `people_note` | Person name (bold), text (truncated), capture date |
| Ideas | `idea` | Status badge, text (truncated) |
| Daily Logs | `daily_log` | Capture date, theme, text (truncated) |

The Todos tab is active by default. Each tab shows a count badge with the number of records. Switching tabs fetches records from the API and displays them in the panel body.

## List views

Each tab renders a compact list view designed for quick scanning:

- Text fields are truncated to ~80 characters with an ellipsis.
- Key identifying fields (person name, status, due date) are shown prominently.
- Empty tabs display a friendly message instead of a blank panel.

## Sort and limit controls

Above the record list, a controls bar provides sorting and limiting options:

### Sort options

- **Newest first** (default) — records sorted by capture date, most recent at the top.
- **Oldest first** — records sorted by capture date, oldest at the top.

### Status filter (Todos only)

The Todos tab has a status filter dropdown next to the sort dropdown:

- **All** (default) — show all todos regardless of status.
- **Open** — show only open todos.
- **Done** — show only completed todos.
- **Parked** — show only parked todos.

The filter is applied before sorting and limiting, so you can combine e.g. "Open" filter with "Oldest first" sort to see your oldest open todos.

### Record limit

- A **Show** dropdown sets how many records are visible at once (default: 25).
- When more records exist than the limit, a **Show all** link appears below the list.

### Per-tab persistence

Sort, filter, and limit preferences are saved per tab in your browser's localStorage. For example, if you filter Todos to "Open" and sort People by newest, each tab remembers its own settings. Preferences persist across page reloads.

Storage keys: `mustard-sort-{type}`, `mustard-filter-{type}`, `mustard-limit-{type}`.
