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

### Data Interface (future)

Conversational and visual interface for mustard data store operations — capture, browse, edit, lifecycle management.

### Dynamic UI (future)

Contextual UI generation based on data shape and user intent. Favourite/reusable UI elements that grow the app based on usage patterns.

---

## User stories

### US-L1 — Project scaffold with landing page

As a developer, I want a TypeScript React project with lint, type-check, and build commands plus a landing page, so that the codebase has a reliable foundation and a visible starting point.

**Acceptance criteria**:
- `npm run dev` starts dev server on port 234
- `npm run build` produces a production-ready bundle
- `npm run lint` runs ESLint with zero errors on the clean codebase
- `npm run typecheck` runs TypeScript compiler check with zero errors
- Landing page renders at root URL with a Bible verse about the mustard seed starting small and growing large (Matthew 13:31-32)
- Landing page is visually clean, centered, and responsive

**User guidance:**
- Discovery: Navigate to `http://localhost:234` (dev) or `http://localhost:567` (production)
- Manual section: new page: "Getting Started"
- Key steps: 1. Run `npm install` to install dependencies. 2. Run `npm run dev` to start the dev server on port 234. 3. Open `http://localhost:234` to see the landing page with the mustard seed verse.

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
- Each test prompts the CLI to report its restriction/permission mode
- Basic mode test asserts output contains an indication of standard/restricted mode
- Admin mode test asserts output contains an indication of unrestricted/trust mode
- CLI output is streamed to the terminal during the test run
- Smoke tests are NOT triggered by `npm test`

**User guidance:**
- Discovery: Run `npm run smoke:basic` or `npm run smoke:admin` from the project terminal
- Manual section: new page: "Testing Guide"
- Key steps: 1. Ensure the `claude` CLI is installed and available in PATH. 2. Run `npm run smoke:basic` to test basic mode — observe CLI output streamed to terminal. 3. Run `npm run smoke:admin` to test admin mode with bypass permissions.

**Design rationale:** Separate npm scripts per mode keep smoke tests explicit and prevent accidental admin-mode invocations. Streaming output gives real-time visibility into what the CLI is doing.

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

## Implementation phases

| Phase | Name | Stories | Status |
|-------|------|---------|--------|
| 1 | Foundation | US-L1, US-L2, US-L3, US-L4, US-L5 | Planned |

### Phase 1 — Foundation

Stand up the mustard-lense application foundation — a TypeScript React project with build tooling, a Claude Code CLI integration module supporting basic and admin permission modes, comprehensive testing (mocked unit tests plus real on-demand smoke tests per mode), architecture documentation, and a landing page anchored by the mustard seed parable.

**Done-when (observable):**

- [ ] `npm run dev` starts Vite dev server on port 234 without error [US-L1]
- [ ] `npm run build` exits 0 and produces `dist/` directory containing `index.html` [US-L1]
- [ ] `npm run lint` exits 0 with zero errors on the clean codebase [US-L1]
- [ ] `npm run typecheck` exits 0 with zero type errors [US-L1]
- [ ] `index.html` includes `<meta name="viewport" ...>` tag for responsive rendering [US-L1]
- [ ] Landing page at `/` contains text from Matthew 13:31-32 about the mustard seed growing from the smallest seed into a tree [US-L1]
- [ ] `tsconfig.json` exists with `strict: true` [US-L1]
- [ ] `vite.config.ts` exists and configures dev server port 234 [US-L1]
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
- [ ] `npm run smoke:basic` invokes the real `claude` CLI in basic mode with a prompt asking it to report its permission/restriction mode [US-L4]
- [ ] `npm run smoke:admin` invokes the real `claude` CLI in admin mode with a prompt asking it to report its permission/restriction mode [US-L4]
- [ ] `smoke:basic` test output contains indication of restricted/standard mode (verified via string contains check) [US-L4]
- [ ] `smoke:admin` test output contains indication of unrestricted/trust/bypass mode (verified via string contains check) [US-L4]
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
- Dev: `npm run dev` on port 234
- Production: macOS plist serving built app on port 567

**Golden principles (phase-relevant):**
- **Faithful stewardship** — quality foundation over speed; strict TypeScript, linting, and tests from day one
- **Safety and ethics** — admin mode (`--dangerously-skip-permissions`) must be explicit, opt-in, and documented; never the default
- **Clarity over complexity** — keep the foundation minimal and well-documented; resist premature abstraction
- **Continuous improvement** — architecture docs and tests established early so future phases compound on a solid base
