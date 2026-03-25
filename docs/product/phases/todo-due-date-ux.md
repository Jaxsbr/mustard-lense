# Phase 11 — Todo Due Date UX

**Status: Draft**

Three focused UX improvements to the todo due date field and list display: auto-populate due date on create, fix the calendar picker icon in dark mode, and highlight today's due dates in the list.

## Stories

### US-X1 — Auto-populate due date on create

As Jaco, I want the due date field to default to today's date when I create a new todo, so that I skip the most common manual entry step while still being able to change or clear it.

**Acceptance criteria:**
- When the detail drawer opens in create mode with `logType === 'todo'`, the `dueDate` state initialises to today's local date in `YYYY-MM-DD` format
- The date is derived using local time (not UTC) — e.g. `new Date().toLocaleDateString('en-CA')` or equivalent
- In edit mode, the due date shows the record's existing value (no auto-population)
- If the user switches log type away from `todo` and back to `todo` during create, the due date resets to today
- The user can clear the due date field to leave it unset

### US-X2 — Calendar picker icon dark mode fix

As Jaco, I want the calendar picker icon on the date input to be visible in dark mode, so that I can click it without guessing where it is.

**Acceptance criteria:**
- A CSS rule targeting `::-webkit-calendar-picker-indicator` applies `filter: invert(1)` in dark mode
- The rule is scoped to dark mode only — light mode calendar icons are unaffected
- Both explicit dark mode (`[data-theme="dark"]`) and system preference fallback (`@media (prefers-color-scheme: dark)`) are covered

### US-X3 — Today highlight in todo list

As Jaco, I want todo items due today to show their date in green bold text, so that I can instantly spot what's due today when scanning the list.

**Acceptance criteria:**
- In `TodoListItem`, when `record.due_date_local` matches today's local date string, the date `<span>` gets a modifier class (e.g. `list-date--today`)
- The today comparison uses local time consistently (same approach as US-X1)
- The modifier class applies `color: var(--lense-color-success-text)` and `font-weight: 600`
- Only the date text is affected — no changes to list item background, border, or other elements
- Items not due today render their date normally (no class, no styling change)

## Done-when (observable)

**Auto-populate (US-X1):**
- [ ] Opening the drawer in create mode with todo type shows today's date in the due date input [US-X1]
- [ ] Opening the drawer in edit mode shows the record's existing due date (not today) [US-X1]
- [ ] Switching log type to non-todo and back to todo in create mode resets due date to today [US-X1]
- [ ] Clearing the due date field and saving creates a todo with no due date [US-X1]
- [ ] The date string uses local time, not UTC [US-X1]

**Calendar icon (US-X2):**
- [ ] In dark mode, the calendar picker icon inside `<input type="date">` is clearly visible (not near-invisible) [US-X2]
- [ ] In light mode, the calendar picker icon appearance is unchanged [US-X2]

**Today highlight (US-X3):**
- [ ] A todo with `due_date_local` equal to today's date renders the date in green bold [US-X3]
- [ ] A todo with a different due date renders the date in normal styling [US-X3]
- [ ] A todo with no due date renders no date span (existing behaviour preserved) [US-X3]

**Structural:**
- [ ] `npm run typecheck` exits 0 [phase]
- [ ] `npm run lint` exits 0 [phase]
- [ ] `npm test` exits 0 with all tests passing [phase]
- [ ] `npm run build` exits 0 [phase]
- [ ] Unit tests cover the auto-populate default and today highlight logic [phase]

**AGENTS.md sections affected:**
- None — no new files, no directory changes, no ownership changes. Only modifications to existing files.

## Golden principles (phase-relevant)

- **Faithful stewardship** — use local time consistently for date operations; UTC mismatch would produce wrong defaults and highlights
- **Clarity over complexity** — native `title` attribute, CSS-only dark mode fix, simple date comparison; no over-engineering
