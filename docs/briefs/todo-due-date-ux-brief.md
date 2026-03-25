---
date: 2026-03-25
topic: todo-due-date-ux
status: specced
---

# Intent Brief: Todo Due Date UX Improvements

## What
Three small, focused improvements to the due date field and todo list display:

1. **Auto-populate due date on create** — when opening the drawer to create a new todo, initialise the due date field to today's date in local time (`YYYY-MM-DD`). The user can clear or change it; this is a default, not a lock.
2. **Calendar picker icon contrast fix** — the native browser calendar button inside the `<input type="date">` is near-invisible in dark mode. Apply a CSS override via `::-webkit-calendar-picker-indicator` to make the icon use the same colour as the input text (or a clearly visible light tone), consistent with the rest of the form.
3. **Today highlight in the todo list** — in the CRUD panel todo list, any item whose `due_date_local` matches today's local date should render its date text in green and bold, making it immediately visible at a glance when scanning the list.

## Why
Right now, a user creating a todo must manually type or pick today's date — the most common due date — every single time. Defaulting to today eliminates that friction for the majority case while keeping the field editable. The dark calendar icon is a dark-mode bug: the control looks broken and clicking it is a guess. The today highlight addresses the opposite problem: once todos exist, finding what's due today requires reading every date in the list — a green bold date makes today's items pop instantly without any extra navigation. All three fixes make the todo creation and review flow faster and more trustworthy.

## Where
- `src/components/panel/DetailDrawer.tsx` — `DrawerForm`: change `dueDate` initial state from `''` to today's `YYYY-MM-DD` string when `mode === 'create'` and `logType === 'todo'` (or when `logType` is switched to `'todo'` from another type in create mode)
- `src/components/panel/DetailDrawer.css` — add `::-webkit-calendar-picker-indicator` rule scoped to dark mode (`@media (prefers-color-scheme: dark)` or via the `.dark` class used in the app) to set `filter: invert(1)` or `color: var(--color-text)` so the icon is clearly visible
- `src/components/panel/ListItems.tsx` — `TodoListItem`: compare `record.due_date_local` to today's local date string; when they match, apply a modifier class to the date `<span>`
- `src/components/panel/ListItems.css` — add `.list-date--today` modifier: `color: var(--color-success, #4caf50); font-weight: 600;` (use a design token if one exists in `tokens.css`, otherwise define `--color-success`)
- `src/components/panel/tokens.css` — add `--color-success` token if not already present

## Constraints
- The auto-date default must use local time, not UTC — use `new Date()` with `toLocaleDateString('en-CA')` (returns `YYYY-MM-DD` in local time) or equivalent, not `toISOString().slice(0,10)` which is UTC and can be a day behind.
- The default only applies to **create mode**, not edit mode — existing records should show whatever due date was already saved.
- If the user switches the log type selector away from `'todo'` and back during create, the due date should re-initialise to today (reset with the rest of the todo fields), not retain a stale value.
- The calendar icon fix must not affect other `<input type="date">` elements in light mode — scope the CSS override to dark mode only.
- `::-webkit-calendar-picker-indicator` is a Chrome/Safari vendor prefix; it is sufficient for the target environment (macOS desktop app). No polyfill needed.
- Today comparison in `ListItems.tsx` must use local time consistently — same `toLocaleDateString('en-CA')` approach as the drawer default.
- The today highlight applies only to the date text — do not change the list item background or border to avoid visual clutter.

## Key decisions
- Use `filter: invert(1)` on the calendar indicator in dark mode — simplest approach, no design token dependency, well-supported on WebKit.
- Today's date default is a convenience default, not a constraint: the user can clear the field to leave the due date unset.
- Today highlight is date-text only (green + bold), not a row-level highlight — keeps the list clean and consistent with existing row design.

## Open questions
- None identified — scope is small and well-bounded.

## Next step
→ spec-author: "define a phase" using this brief as input.
