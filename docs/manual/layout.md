# App Layout

Mustard uses a split-screen layout with two regions: the CRUD panel on the left and the lense on the right.

## Split-screen overview

- **CRUD panel (left)** — structured browse interface with type tabs for navigating your mustard records. Tabs: Todos, People, Ideas, Daily Logs. Each tab shows a compact list view tailored to that record type.
- **Lense (right)** — AI-powered intent input. Type a natural language query, and the lense retrieves relevant records, synthesises a response, and renders structured results. Always visible regardless of panel state.

## Theme toggle (dark mode)

A theme toggle button is visible next to the "Mustard" heading. Click it to switch between light and dark mode.

- **Light mode** — warm gold palette with off-white background. The default when no preference is set and the OS is in light mode.
- **Dark mode** — dark backgrounds with adjusted accent and type colors for comfortable use at any time of day.
- **System preference** — if you haven't explicitly toggled the theme, the app follows your operating system's light/dark setting automatically.
- **Persistence** — your theme choice is saved in localStorage (key: `mustard-theme`). On page load, the saved theme is applied immediately — no flash of the wrong theme.

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

### Interaction feedback

- **Hover states** — hovering over a list item highlights it with a type-appropriate background color (blue tint for Todos, purple for People, orange for Daily Logs, green for Ideas). Works in both light and dark mode.
- **Click feedback** — clicking a list item triggers a brief scale animation before the detail drawer opens.
- **Tab crossfade** — switching between tabs fades the new content in smoothly (~180ms) instead of an instant swap.
- **Drawer backdrop** — the semi-transparent backdrop fades in when the drawer opens.

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
