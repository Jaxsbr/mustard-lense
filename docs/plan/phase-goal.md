## Phase goal

Connect the React frontend to the Claude Code CLI backend through a lightweight API server, creating an intelligent lense interface. The user types natural language intent into a single input field, the backend routes it to Claude Code (which reads the mustard data store directly), and the frontend renders the response as pre-built template components with animated transitions. No chat UI — input replaces previous results, loading spinner during processing, components animate into view.

### Dependencies
- foundation

### Stories in scope
- US-L6 — API server with intent endpoint and response schema
- US-L7 — Lense input with loading and animated transitions
- US-L8 — Template renderer components for mustard data types
- US-L9 — End-to-end smoke test with real data

### Done-when (observable)
- [x] A server module exists (e.g. `src/server/`) that exports an Express or equivalent HTTP server with a `POST /api/lense` route [US-L6]
- [x] `POST /api/lense` with valid `{ "intent": "open todos" }` body returns HTTP 200 with `Content-Type: application/json` [US-L6]
- [x] A system prompt module exists that references the mustard data store path (`~/dev/mustard/data/`) and enumerates the response schema component types [US-L6]
- [x] The API endpoint calls `invokeClaude` with `mode: 'basic'` (verified by unit test mocking `invokeClaude`) [US-L6]
- [x] A shared response schema module exports TypeScript interfaces for all five component types: `todo-list`, `log-timeline`, `person-notes`, `idea-list`, `summary` [US-L6]
- [x] Each component type interface defines a `type` discriminator field and a `data` object with typed fields (e.g., `todo-list` data includes `items` array with `id`, `text`, `status` fields) [US-L6]
- [x] `npm run dev` starts both the Vite dev server on port 5234 and the API server, with API requests from the frontend proxied or routed correctly [US-L6]
- [x] Unit tests exist for the API endpoint that mock `invokeClaude` and verify: valid request returns parsed JSON, missing intent returns 400, invocation failure returns 500 [US-L6]
- [x] `POST /api/lense` returns 400 when the `intent` field is missing from the request body [US-L6]
- [x] `POST /api/lense` returns 400 when the `intent` field is an empty string [US-L6]
- [x] `POST /api/lense` returns 500 with a structured JSON error body (not a raw stack trace) when `invokeClaude` fails [US-L6]
- [x] The `intent` field is validated for type (`string`) and maximum length before being passed to `invokeClaude` [US-L6]
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
- [ ] `README.md` or `docs/` contains a "Using the Lense" section documenting the lense input, example queries, and component types rendered [US-L7]
- [x] A component registry module exists that accepts a component type string and returns the corresponding React component (or a fallback) [US-L8]
- [x] `todo-list` renderer displays each item's `status` (as a visual indicator), `text`, and `due_date_local` when present [US-L8]
- [x] `log-timeline` renderer displays entries with `capture_date_local`, `theme`, and `text` [US-L8]
- [x] `person-notes` renderer displays notes with `person` name, `capture_date_local`, and `text` [US-L8]
- [x] `idea-list` renderer displays items with `status` badge and `text` [US-L8]
- [x] `summary` renderer displays a `title` and `text` block [US-L8]
- [x] All renderer components accept props typed with the shared schema interfaces from US-L6 (`npm run typecheck` passes) [US-L8]
- [x] Passing an unrecognized component type to the registry returns a fallback component that renders a visible element (not empty/blank) and does not throw a runtime error [US-L8]
- [x] Renderer components use a shared CSS module, CSS variables, or design tokens file for consistent spacing, typography, and color [US-L8]
- [x] All renderer components render mustard data text using React JSX expressions (textContent), not `dangerouslySetInnerHTML` [US-L8]
- [ ] `package.json` defines a `smoke:lense` script that is separate from the `test` script [US-L9]
- [ ] `npm test` does NOT execute the lense smoke test [US-L9]
- [ ] `npm run smoke:lense` sends an HTTP request with a cross-cutting intent (e.g., "what's going on this week") to the API endpoint [US-L9]
- [ ] The smoke test asserts the response parses as valid JSON containing a `components` array with at least one entry [US-L9]
- [ ] The smoke test prints the component types present in the response to stdout [US-L9]
- [ ] `AGENTS.md` reflects new API server modules, response schema, frontend components, and lense interaction introduced in this phase [phase]

### Golden principles (phase-relevant)
- **Faithful stewardship** — quality over speed; the system prompt and response schema are the highest-leverage code in this phase — get them right
- **Safety and ethics** — basic CLI mode only; user intent is passed via argument array, not shell interpolation; no dangerouslySetInnerHTML
- **Clarity over complexity** — template components over dynamic code generation; a known set of component types rather than unbounded flexibility
- **People first** — polished transitions and loading states treat user time and attention with respect; the interface should feel intentional, not bolted-on
- **Continuous improvement** — the response schema and component registry are designed to grow; new component types can be added without restructuring
