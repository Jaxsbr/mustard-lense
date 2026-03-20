## Phase goal

Stand up the mustard-lense application foundation — a TypeScript React project with build tooling, a Claude Code CLI integration module supporting basic and admin permission modes, comprehensive testing (mocked unit tests plus real on-demand smoke tests per mode), architecture documentation, and a landing page anchored by the mustard seed parable.

### Stories in scope
- US-L1 — Project scaffold with landing page
- US-L2 — Claude Code CLI integration module with mode support
- US-L3 — Unit tests with mocked CLI
- US-L4 — On-demand smoke tests with CLI output visibility
- US-L5 — Architecture and development guidance documentation

### Done-when (observable)
- [x] `npm run dev` starts Vite dev server on port 234 without error [US-L1]
- [x] `npm run build` exits 0 and produces `dist/` directory containing `index.html` [US-L1]
- [x] `npm run lint` exits 0 with zero errors on the clean codebase [US-L1]
- [x] `npm run typecheck` exits 0 with zero type errors [US-L1]
- [x] `index.html` includes `<meta name="viewport" ...>` tag for responsive rendering [US-L1]
- [x] Landing page at `/` contains text from Matthew 13:31-32 about the mustard seed growing from the smallest seed into a tree [US-L1]
- [x] `tsconfig.json` exists with `strict: true` [US-L1]
- [x] `vite.config.ts` exists and configures dev server port 234 [US-L1]
- [x] `src/lib/claude-cli.ts` exports an `invokeClaude` function that accepts `{ mode: 'basic' | 'admin', prompt: string }` [US-L2]
- [x] `invokeClaude` in basic mode spawns `claude` process WITHOUT `--dangerously-skip-permissions` in the argument list [US-L2]
- [x] `invokeClaude` in admin mode spawns `claude` process WITH `--dangerously-skip-permissions` in the argument list [US-L2]
- [x] Module exports a `ClaudeResult` type with fields `stdout: string`, `stderr: string`, `exitCode: number` [US-L2]
- [x] `invokeClaude` accepts an optional `onData` callback for streaming stdout chunks as they arrive [US-L2]
- [x] CLI invocation uses `child_process.spawn` with an argument array (not shell string concatenation) to prevent command injection [US-L2]
- [x] `invokeClaude` validates that `prompt` is a non-empty string before spawning the CLI process [US-L2]
- [x] `invokeClaude` validates that `mode` is strictly `'basic'` or `'admin'` before spawning (rejects unexpected values) [US-L2]
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

### Golden principles (phase-relevant)
- **Faithful stewardship** — quality foundation over speed; strict TypeScript, linting, and tests from day one
- **Safety and ethics** — admin mode (`--dangerously-skip-permissions`) must be explicit, opt-in, and documented; never the default
- **Clarity over complexity** — keep the foundation minimal and well-documented; resist premature abstraction
- **Continuous improvement** — architecture docs and tests established early so future phases compound on a solid base
