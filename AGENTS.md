# Mustard Lense

## Purpose
Claude Code integrated interface for the mustard data store, enabling natural conversation for managing and viewing mustard data. Experiments with dynamic UI generation — serving contextual UI based on data and actionable requests. Supports favourite/reusable UI elements that grow the app based on user usage patterns.

## Directory layout

```
mustard-lense/
├── src/
│   ├── App.tsx              # Landing page — mustard seed parable (Matthew 13:31-32)
│   ├── App.css              # Landing page styles
│   ├── index.css            # Global reset
│   ├── main.tsx             # React entry point
│   ├── lib/
│   │   ├── claude-cli.ts    # Claude CLI integration — invokeClaude(), ClaudeResult
│   │   └── claude-cli.test.ts  # Mocked unit tests (vi.mock child_process)
│   └── smoke/
│       ├── basic.ts         # On-demand smoke test — basic mode
│       └── admin.ts         # On-demand smoke test — admin mode
├── docs/
│   ├── architecture/ARCHITECTURE.md
│   ├── plan/               # Build loop state
│   └── product/            # PRD and specs
├── index.html              # SPA shell with viewport meta
├── vite.config.ts          # Dev server port 234
├── tsconfig.json           # Project references root
├── tsconfig.app.json       # App TS config (strict, node types)
├── tsconfig.node.json      # Node TS config
├── eslint.config.js        # ESLint config
└── package.json            # Scripts: dev, build, lint, typecheck, test, smoke:*
```

## File ownership

| Path | Owner | Notes |
|------|-------|-------|
| `src/lib/claude-cli.ts` | CLI module | Exports `invokeClaude`, `ClaudeResult`, `ClaudeMode` |
| `src/lib/claude-cli.test.ts` | Tests | Mocked unit tests — no real CLI invoked |
| `src/smoke/*.ts` | Smoke tests | On-demand, invoke real CLI — NOT run by `npm test` |
| `src/App.tsx` | UI | Landing page |

## CLI modes

- **basic** — default, restricted permissions. Spawns `claude -p <prompt>`.
- **admin** — explicit opt-in, unrestricted. Spawns `claude --dangerously-skip-permissions -p <prompt>`. Never the default.

## Testing

- `npm test` — Vitest unit tests with mocked `child_process.spawn`
- `npm run smoke:basic` / `npm run smoke:admin` — real CLI invocation (requires `claude` installed)
- Smoke tests are excluded from Vitest (in `src/smoke/`, not `*.test.ts`)

## Quality checks

- no-silent-pass
- no-bare-except
- error-path-coverage
- agents-consistency
