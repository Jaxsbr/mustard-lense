## Phase goal

Three focused UX improvements to the todo due date field and list display: auto-populate due date on create, fix the calendar picker icon in dark mode, and highlight today's due dates in the list.

### Stories in scope
- US-X1 — Auto-populate due date on create
- US-X2 — Calendar picker icon dark mode fix
- US-X3 — Today highlight in todo list

### Done-when (observable)

- [x] Opening the drawer in create mode with todo type shows today's date in the due date input [US-X1]
- [x] Opening the drawer in edit mode shows the record's existing due date (not today) [US-X1]
- [x] Switching log type to non-todo and back to todo in create mode resets due date to today [US-X1]
- [x] Clearing the due date field and saving creates a todo with no due date [US-X1]
- [x] The date string uses local time, not UTC [US-X1]
- [x] In dark mode, the calendar picker icon inside `<input type="date">` is clearly visible [US-X2]
- [x] In light mode, the calendar picker icon appearance is unchanged [US-X2]
- [x] A todo with `due_date_local` equal to today's date renders the date in green bold [US-X3]
- [x] A todo with a different due date renders the date in normal styling [US-X3]
- [x] A todo with no due date renders no date span (existing behaviour preserved) [US-X3]
- [x] `npm run typecheck` exits 0 [phase]
- [x] `npm run lint` exits 0 [phase]
- [x] `npm test` exits 0 with all tests passing [phase]
- [x] `npm run build` exits 0 [phase]
- [x] Unit tests cover the auto-populate default and today highlight logic [phase]

### Golden principles (phase-relevant)
- **Faithful stewardship** — use local time consistently for date operations; UTC mismatch would produce wrong defaults and highlights
- **Clarity over complexity** — native `title` attribute, CSS-only dark mode fix, simple date comparison; no over-engineering
