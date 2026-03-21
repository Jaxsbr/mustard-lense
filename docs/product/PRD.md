# Mustard Lense — Product Requirements Document

## Vision

Claude Code integrated interface for the mustard data store, enabling natural conversation for managing and viewing mustard data. Experiments with dynamic UI generation — serving contextual UI based on data and actionable requests. Supports favourite/reusable UI elements that grow the app based on user usage patterns.

## Background

The mustard data store is a working system for capturing todos, people notes, daily logs, and ideas via a Flask web app and YAML files on disk. While functional, its current UI has friction points that are difficult to articulate. Mustard-lense will serve as both a better interface and a learning vehicle — insights from building and using it will inform mustard's own PRD evolution, particularly around intelligent/semantic search and insight generation.

## Target users

- **Jaco (primary)** — developer and daily mustard user who wants a conversational, AI-assisted interface for managing and exploring mustard data
- **AI agents (secondary)** — Claude Code and Cursor agents that interact with the mustard data store programmatically

---

## Capability areas

### CLI Integration

Claude Code CLI integration with two permission modes:
- **Basic mode** — standard CLI invocation with permission restrictions for routine tasks
- **Admin mode** — CLI with `--dangerously-skip-permissions` for tasks that require unrestricted access

### Intelligent Lense

Natural language intent input that queries the mustard data store through Claude Code and renders structured, visual responses using template components. No chat UI — the interaction model is intent in, view out. Claude Code reads the data store directly (YAML on disk) and returns structured JSON matching a defined component schema. The frontend renders pre-built template components (todo lists, timelines, note cards, idea cards, summaries) with animated transitions.

### Data Interface (future)

Write operations for mustard data store — capture, edit, lifecycle management. The Intelligent Lense provides read-only access; this capability area covers mutation.

### Dynamic UI (future)

Contextual UI generation based on data shape and user intent. Favourite/reusable UI elements that grow the app based on usage patterns. The template component system from the Intelligent Lense is the foundation this will build on.

---

## User stories

### US-L1 — Project scaffold with landing page

As a developer, I want a TypeScript React project with lint, type-check, and build commands plus a landing page, so that the codebase has a reliable foundation and a visible starting point.

**Acceptance criteria**:
- `npm run dev` starts dev server on port 5234
- `npm run build` produces a production-ready bundle
- `npm run lint` runs ESLint with zero errors on the clean codebase
- `npm run typecheck` runs TypeScript compiler check with zero errors
- Landing page renders at root URL with a Bible verse about the mustard seed starting small and growing large (Matthew 13:31-32)
- Landing page is visually clean, centered, and responsive

**User guidance:**
- Discovery: Navigate to `http://localhost:5234` (dev) or `http://localhost:5678` (production)
- Manual section: new page: "Getting Started"
- Key steps: 1. Run `npm install` to install dependencies. 2. Run `npm run dev` to start the dev server on port 5234. 3. Open `http://localhost:5234` to see the landing page with the mustard seed verse.

**Design rationale:** Vite + React + TypeScript gives fast dev feedback and type safety that will support future dynamic UI generation experiments.

---

### US-L2 — Claude Code CLI integration module with mode support

As the application, I want a typed module that invokes the Claude Code CLI in either basic or admin mode, so that features can route tasks to the appropriate permission level.

**Acceptance criteria**:
- Module exports a function accepting a mode parameter (`basic` | `admin`) and a prompt string
- In `basic` mode, invokes `claude` CLI without `--dangerously-skip-permissions`
- In `admin` mode, invokes `claude` CLI with `--dangerously-skip-permissions`
- Returns a typed result with stdout, stderr, and exit code
- Supports a streaming/callback mechanism for output as it arrives

**User guidance:** N/A — internal module.

**Design rationale:** Wrapping the CLI in a typed module with mode support centralizes permission control and makes the invocation boundary mockable for unit tests.

---

### US-L3 — Unit tests with mocked CLI

As a developer, I want unit tests that verify the CLI module using mocks, so that tests run fast without requiring the real Claude Code CLI.

**Acceptance criteria**:
- `npm test` runs unit tests via Vitest
- Tests mock the child process layer (no real CLI invocation)
- Tests verify basic mode omits `--dangerously-skip-permissions` flag
- Tests verify admin mode includes `--dangerously-skip-permissions` flag
- Tests verify the typed result shape (stdout, stderr, exit code)
- Tests cover error cases (non-zero exit, spawn failure)

**User guidance:** N/A — internal developer tooling.

**Design rationale:** Mocking at the process boundary lets tests verify flag construction and result parsing without non-deterministic real invocations.

---

### US-L4 — On-demand smoke tests with CLI output visibility

As a developer, I want on-demand smoke tests that invoke the real Claude Code CLI in each mode and display output, so that I can verify real integration works.

**Acceptance criteria**:
- `npm run smoke:basic` invokes the CLI in basic mode
- `npm run smoke:admin` invokes the CLI in admin mode
- Each test prompts the CLI and asserts non-empty output with exit code 0
- Both mode tests confirm successful CLI integration (non-empty stdout, zero exit code)
- CLI output is streamed to the terminal during the test run
- Smoke tests are NOT triggered by `npm test`

**User guidance:**
- Discovery: Run `npm run smoke:basic` or `npm run smoke:admin` from the project terminal
- Manual section: new page: "Testing Guide"
- Key steps: 1. Ensure the `claude` CLI is installed and available in PATH. 2. Run `npm run smoke:basic` to test basic mode — observe CLI output streamed to terminal. 3. Run `npm run smoke:admin` to test admin mode with bypass permissions.

**Design rationale:** Separate npm scripts per mode keep smoke tests explicit and prevent accidental admin-mode invocations. Streaming output gives real-time visibility into what the CLI is doing.

**Technical limitation (discovered):** Claude Code CLI does not self-report its permission mode in non-interactive (`-p`) output. The mode indicators ("bypass permissions on" / "? for shortcuts") are rendered only in the interactive TUI, not in piped stdout/stderr. Smoke tests therefore assert successful integration (non-empty output, zero exit code) rather than permission-mode detection. Correct flag construction per mode is verified by the mocked unit tests (US-L3).

---

### US-L5 — Architecture and development guidance documentation

As a developer (human or AI), I want architecture documentation and development guidance, so that contributors understand the system design, CLI modes, and conventions.

**Acceptance criteria**:
- `docs/architecture/ARCHITECTURE.md` describes system topology, module structure, and data flow
- `docs/architecture/ARCHITECTURE.md` documents the two CLI modes and their security implications
- `README.md` includes project purpose, setup instructions, and all available npm commands
- `AGENTS.md` is updated with file ownership map and directory layout

**User guidance:** N/A — developer documentation.

**Design rationale:** N/A — straightforward documentation.

---

### US-L6 — API server with intent endpoint and response schema

As the application, I want an API server that accepts natural language intent, routes it to Claude Code with a system prompt instructing it to read the mustard data store and return structured JSON, so that the frontend can render intelligent, data-driven views.

**Acceptance criteria**:
- Server exposes a POST endpoint that accepts a JSON body with an `intent` string field
- The endpoint constructs a system prompt that instructs Claude Code to: read the mustard data store at `~/dev/mustard/data/`, interpret the user's intent, and return JSON matching the response schema
- The endpoint invokes `invokeClaude` in basic mode with the constructed prompt
- The response schema defines component types: `todo-list`, `log-timeline`, `person-notes`, `idea-list`, `summary`
- Each component type has a typed data shape (TypeScript interface) usable by both server and frontend
- The endpoint parses Claude's output as JSON and returns it to the client
- The endpoint returns appropriate HTTP error codes for invalid input (400) and processing failures (500)
- `npm run dev` starts both the Vite dev server and the API server
- The `intent` field is validated for type and maximum length before processing

**User guidance:** N/A — internal API endpoint consumed by the frontend.

**Design rationale:** Co-locating the system prompt and response schema with the API server centralizes the contract between Claude and the frontend. Basic mode is sufficient since reading files doesn't require admin permissions.

---

### US-L7 — Lense input with loading and animated transitions

As a user, I want a single input field where I type what I want to see, with a loading indicator while processing and smooth animated transitions when results appear, so that the interaction feels responsive and intentional despite backend latency.

**Acceptance criteria**:
- A text input field is prominently displayed on the main page
- Pressing Enter or clicking a submit affordance sends the intent to the API endpoint (US-L6)
- A loading spinner/indicator is shown while the API processes the request
- The input is visually distinguished during the loading state
- When the response arrives, result components animate into view (not instant appear)
- On a new query, the current view animates out before the loading state begins (always-replace)
- The input field clears when a new query is submitted
- Error states are displayed gracefully when the API returns an error
- The landing page mustard seed verse is the default/empty state before any query

**User guidance:**
- Discovery: Navigate to `http://localhost:5234` — the lense input is the primary interface element
- Manual section: new page: "Using the Lense"
- Key steps: 1. Type a natural language query into the lense input (e.g., "what's on my plate this week"). 2. Press Enter and watch the loading indicator while Claude processes your intent. 3. View the rendered results — data cards, lists, and summaries drawn from your mustard data.

**Design rationale:** The always-replace model keeps the interface clean and avoids drifting toward a chat thread. Animated transitions make the latency feel intentional rather than sluggish — the "whoa, this is nice" moment.

---

### US-L8 — Template renderer components for mustard data types

As a user, I want structured, visually clean components that render my mustard data (todos, logs, people notes, ideas, summaries), so that query results are immediately scannable and useful rather than raw text.

**Acceptance criteria**:
- A component registry maps each component type string to a React component
- `todo-list` component renders items with status indicator, text, and due date (when present)
- `log-timeline` component renders daily log entries chronologically with date and theme
- `person-notes` component renders notes about a person with capture date and text
- `idea-list` component renders ideas with status badge and text
- `summary` component renders a title and text block for cross-cutting synthesis
- All components accept typed props matching the response schema interfaces (US-L6)
- Components follow a consistent visual style (spacing, typography, color palette)
- An unrecognized component type renders a graceful fallback (not a crash or blank space)

**User guidance:**
- Discovery: Components render automatically when you query the lense — no direct interaction needed
- Manual section: existing page: "Using the Lense"
- Key steps: 1. Query the lense with an intent like "open todos" or "notes about Nisal." 2. View the rendered components — todo lists show status and due dates, timelines show chronological logs, summaries provide cross-cutting insights.

**Design rationale:** Template components over raw LLM text ensures consistent visual quality and enables future interactive affordances (checkboxes, filters) that free-form text can't support. The fallback for unknown types prevents schema evolution from breaking the UI.

---

### US-L9 — End-to-end smoke test with real data

As a developer, I want an on-demand smoke test that sends a real intent through the full stack (API server, Claude Code, mustard data store, JSON response), so that I can verify the integration works end-to-end.

**Acceptance criteria**:
- `npm run smoke:lense` runs an on-demand smoke test separate from `npm test`
- The test sends a cross-cutting intent to the API endpoint
- The test asserts the response is valid JSON matching the response schema structure
- The test asserts at least one component is present in the response
- The test output shows the component types returned and a summary of the data
- The test requires the real `claude` CLI and the real mustard data store at `~/dev/mustard/data/`

**User guidance:**
- Discovery: Run `npm run smoke:lense` from the project terminal
- Manual section: existing page: "Testing Guide"
- Key steps: 1. Ensure the `claude` CLI is installed and the mustard data store exists at `~/dev/mustard/data/`. 2. Run `npm run smoke:lense` to send a real query through the full stack. 3. Observe the response — component types and data summary printed to terminal.

**Design rationale:** An API-level smoke test verifies the most fragile part of the system (the system prompt producing valid JSON from real data) without requiring a browser. Separate from `npm test` to avoid dependence on external systems.

---

## Implementation phases

| Phase | Name | Stories | Status |
|-------|------|---------|--------|
| 1 | Foundation | US-L1, US-L2, US-L3, US-L4, US-L5 | Shipped |
| 2 | Intelligent Lense | US-L6, US-L7, US-L8, US-L9 | Planned |

### Phase 1 — Foundation

Stand up the mustard-lense application foundation — a TypeScript React project with build tooling, a Claude Code CLI integration module supporting basic and admin permission modes, comprehensive testing (mocked unit tests plus real on-demand smoke tests per mode), architecture documentation, and a landing page anchored by the mustard seed parable.

**Done-when (observable):**

- [ ] `npm run dev` starts Vite dev server on port 5234 without error [US-L1]
- [ ] `npm run build` exits 0 and produces `dist/` directory containing `index.html` [US-L1]
- [ ] `npm run lint` exits 0 with zero errors on the clean codebase [US-L1]
- [ ] `npm run typecheck` exits 0 with zero type errors [US-L1]
- [ ] `index.html` includes `<meta name="viewport" ...>` tag for responsive rendering [US-L1]
- [ ] Landing page at `/` contains text from Matthew 13:31-32 about the mustard seed growing from the smallest seed into a tree [US-L1]
- [ ] `tsconfig.json` exists with `strict: true` [US-L1]
- [ ] `vite.config.ts` exists and configures dev server port 5234 [US-L1]
- [ ] `src/lib/claude-cli.ts` exports an `invokeClaude` function that accepts `{ mode: 'basic' | 'admin', prompt: string }` [US-L2]
- [ ] `invokeClaude` in basic mode spawns `claude` process WITHOUT `--dangerously-skip-permissions` in the argument list [US-L2]
- [ ] `invokeClaude` in admin mode spawns `claude` process WITH `--dangerously-skip-permissions` in the argument list [US-L2]
- [ ] Module exports a `ClaudeResult` type with fields `stdout: string`, `stderr: string`, `exitCode: number` [US-L2]
- [ ] `invokeClaude` accepts an optional `onData` callback for streaming stdout chunks as they arrive [US-L2]
- [ ] CLI invocation uses `child_process.spawn` with an argument array (not shell string concatenation) to prevent command injection [US-L2]
- [ ] `npm test` exits 0 and runs Vitest test suite [US-L3]
- [ ] Unit tests for the CLI module exist in `src/lib/claude-cli.test.ts` [US-L3]
- [ ] Tests mock `child_process.spawn` — no real `claude` CLI process is spawned during `npm test` [US-L3]
- [ ] Test asserts basic mode invocation does not include `--dangerously-skip-permissions` in spawn arguments [US-L3]
- [ ] Test asserts admin mode invocation includes `--dangerously-skip-permissions` in spawn arguments [US-L3]
- [ ] Test asserts return value matches `ClaudeResult` shape (`stdout`, `stderr`, `exitCode` present) [US-L3]
- [ ] Tests cover error scenarios: non-zero exit code and spawn failure (e.g., `claude` not found) [US-L3]
- [ ] `package.json` defines `smoke:basic` script that is separate from `test` script [US-L4]
- [ ] `package.json` defines `smoke:admin` script that is separate from `test` script [US-L4]
- [ ] `npm run smoke:basic` invokes the real `claude` CLI in basic mode and asserts non-empty stdout with exit code 0 [US-L4]
- [ ] `npm run smoke:admin` invokes the real `claude` CLI in admin mode and asserts non-empty stdout with exit code 0 [US-L4]
- [ ] CLI output is piped to `process.stdout` so the developer sees real-time output during smoke test execution [US-L4]
- [ ] `npm test` does NOT execute smoke test files (smoke tests excluded from Vitest config or in a separate directory) [US-L4]
- [ ] `docs/architecture/ARCHITECTURE.md` exists and describes system topology, module structure, and data flow [US-L5]
- [ ] `docs/architecture/ARCHITECTURE.md` documents basic and admin CLI modes including security implications of `--dangerously-skip-permissions` [US-L5]
- [ ] `README.md` exists with project purpose, setup instructions, and lists all npm commands (`dev`, `build`, `lint`, `typecheck`, `test`, `smoke:basic`, `smoke:admin`) [US-L5]
- [ ] `AGENTS.md` includes file ownership map and directory layout reflecting the codebase structure [US-L5]
- [ ] `AGENTS.md` reflects new modules, directories, and CLI modes introduced in this phase [phase]
- [ ] `invokeClaude` validates that `prompt` is a non-empty string before spawning the CLI process [US-L2]
- [ ] `invokeClaude` validates that `mode` is strictly `'basic'` or `'admin'` before spawning (rejects unexpected values) [US-L2]

**Hosting:**
- Dev: `npm run dev` on port 5234
- Production: macOS plist serving built app on port 5678

**Golden principles (phase-relevant):**
- **Faithful stewardship** — quality foundation over speed; strict TypeScript, linting, and tests from day one
- **Safety and ethics** — admin mode (`--dangerously-skip-permissions`) must be explicit, opt-in, and documented; never the default
- **Clarity over complexity** — keep the foundation minimal and well-documented; resist premature abstraction
- **Continuous improvement** — architecture docs and tests established early so future phases compound on a solid base

### Phase 2 — Intelligent Lense

Connect the React frontend to the Claude Code CLI backend through a lightweight API server, creating an intelligent lense interface. The user types natural language intent into a single input field, the backend routes it to Claude Code (which reads the mustard data store directly), and the frontend renders the response as pre-built template components with animated transitions. No chat UI — input replaces previous results, loading spinner during processing, components animate into view.

**Done-when (observable):**

- [ ] A server module exists (e.g. `src/server/`) that exports an Express or equivalent HTTP server with a `POST /api/lense` route [US-L6]
- [ ] `POST /api/lense` with valid `{ "intent": "open todos" }` body returns HTTP 200 with `Content-Type: application/json` [US-L6]
- [ ] A system prompt module exists that references the mustard data store path (`~/dev/mustard/data/`) and enumerates the response schema component types [US-L6]
- [ ] The API endpoint calls `invokeClaude` with `mode: 'basic'` (verified by unit test mocking `invokeClaude`) [US-L6]
- [ ] A shared response schema module exports TypeScript interfaces for all five component types: `todo-list`, `log-timeline`, `person-notes`, `idea-list`, `summary` [US-L6]
- [ ] Each component type interface defines a `type` discriminator field and a `data` object with typed fields (e.g., `todo-list` data includes `items` array with `id`, `text`, `status` fields) [US-L6]
- [ ] `npm run dev` starts both the Vite dev server on port 5234 and the API server, with API requests from the frontend proxied or routed correctly [US-L6]
- [ ] Unit tests exist for the API endpoint that mock `invokeClaude` and verify: valid request returns parsed JSON, missing intent returns 400, invocation failure returns 500 [US-L6]
- [ ] Root URL (`/`) renders a visible text input element that serves as the lense input [US-L7]
- [ ] Submitting the input (Enter key or submit affordance) triggers a `POST` request to `/api/lense` with the input value as `intent` [US-L7]
- [ ] A loading indicator element (spinner or equivalent) is present in the DOM while the API request is in flight [US-L7]
- [ ] The input element has a visually distinct loading state (e.g., `disabled` attribute or CSS class change) while the request is in flight [US-L7]
- [ ] Result components are rendered inside an animation wrapper that applies CSS `transition` or `animation` on mount (verifiable by presence of animation/transition CSS properties or class) [US-L7]
- [ ] When a new query is submitted, existing result components are removed from the DOM before new results render (always-replace) [US-L7]
- [ ] The input value resets to empty string after a query is submitted [US-L7]
- [ ] When the API returns an error, an error message is rendered in the DOM (not a browser alert or console-only error) [US-L7]
- [ ] Before any query is submitted, the page displays the Matthew 13:31-32 mustard seed verse as the default empty state [US-L7]
- [ ] Playwright test exists that: types a query, asserts loading indicator appears, and asserts at least one result component renders after loading completes [US-L7]
- [ ] A component registry module exists that accepts a component type string and returns the corresponding React component (or a fallback) [US-L8]
- [ ] `todo-list` renderer displays each item's `status` (as a visual indicator), `text`, and `due_date_local` when present [US-L8]
- [ ] `log-timeline` renderer displays entries with `capture_date_local`, `theme`, and `text` [US-L8]
- [ ] `person-notes` renderer displays notes with `person` name, `capture_date_local`, and `text` [US-L8]
- [ ] `idea-list` renderer displays items with `status` badge and `text` [US-L8]
- [ ] `summary` renderer displays a `title` and `text` block [US-L8]
- [ ] All renderer components accept props typed with the shared schema interfaces from US-L6 (`npm run typecheck` passes) [US-L8]
- [ ] Passing an unrecognized component type to the registry returns a fallback component that renders a visible element (not empty/blank) and does not throw a runtime error [US-L8]
- [ ] Renderer components use a shared CSS module, CSS variables, or design tokens file for consistent spacing, typography, and color [US-L8]
- [ ] `package.json` defines a `smoke:lense` script that is separate from the `test` script [US-L9]
- [ ] `npm test` does NOT execute the lense smoke test [US-L9]
- [ ] `npm run smoke:lense` sends an HTTP request with a cross-cutting intent (e.g., "what's going on this week") to the API endpoint [US-L9]
- [ ] The smoke test asserts the response parses as valid JSON containing a `components` array with at least one entry [US-L9]
- [ ] The smoke test prints the component types present in the response to stdout [US-L9]
- [ ] `POST /api/lense` returns 400 when the `intent` field is missing from the request body [US-L6]
- [ ] `POST /api/lense` returns 400 when the `intent` field is an empty string [US-L6]
- [ ] `POST /api/lense` returns 500 with a structured JSON error body (not a raw stack trace) when `invokeClaude` fails [US-L6]
- [ ] The `intent` field is validated for type (`string`) and maximum length before being passed to `invokeClaude` [US-L6]
- [ ] All renderer components render mustard data text using React JSX expressions (textContent), not `dangerouslySetInnerHTML` [US-L8]
- [ ] `AGENTS.md` reflects new API server modules, response schema, frontend components, and lense interaction introduced in this phase [phase]
- [ ] `README.md` or `docs/` contains a "Using the Lense" section documenting the lense input, example queries, and component types rendered [US-L7]

**Hosting:**
- Dev: `npm run dev` on port 5234 (Vite + API server)
- Production: macOS plist serving built app on port 5678

**Golden principles (phase-relevant):**
- **Faithful stewardship** — quality over speed; the system prompt and response schema are the highest-leverage code in this phase — get them right
- **Safety and ethics** — basic CLI mode only; user intent is passed via argument array, not shell interpolation; no dangerouslySetInnerHTML
- **Clarity over complexity** — template components over dynamic code generation; a known set of component types rather than unbounded flexibility
- **People first** — polished transitions and loading states treat user time and attention with respect; the interface should feel intentional, not bolted-on
- **Continuous improvement** — the response schema and component registry are designed to grow; new component types can be added without restructuring
