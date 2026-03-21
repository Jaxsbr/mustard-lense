# Mustard Lense

## Purpose
Claude Code integrated interface for the mustard data store, enabling natural conversation for managing and viewing mustard data. Experiments with dynamic UI generation — serving contextual UI based on data and actionable requests. Supports favourite/reusable UI elements that grow the app based on user usage patterns.

## Directory layout

```
mustard-lense/
├── src/
│   ├── App.tsx              # Lense page — input, loading, result rendering
│   ├── App.css              # Lense page styles with animations
│   ├── index.css            # Global reset
│   ├── main.tsx             # React entry point
│   ├── components/
│   │   ├── ResultRenderer.tsx    # Component registry — maps type string to renderer
│   │   ├── TodoList.tsx          # todo-list component renderer
│   │   ├── LogTimeline.tsx       # log-timeline component renderer
│   │   ├── PersonNotes.tsx       # person-notes component renderer
│   │   ├── IdeaList.tsx          # idea-list component renderer
│   │   ├── Summary.tsx           # summary component renderer
│   │   ├── FallbackComponent.tsx # Fallback for unknown component types
│   │   ├── components.css        # Shared component styles
│   │   └── tokens.css            # Design tokens (CSS variables)
│   ├── shared/
│   │   └── schema.ts        # Response schema — TypeScript interfaces for component types
│   ├── server/
│   │   ├── app.ts            # Express app with POST /api/lense route
│   │   ├── index.ts          # Server entry point (listen on port 3001)
│   │   ├── prompt.ts         # System prompt construction for Claude
│   │   └── server.test.ts    # API endpoint unit tests (mocked invokeClaude)
│   ├── lib/
│   │   ├── claude-cli.ts     # Claude CLI integration — invokeClaude(), ClaudeResult
│   │   └── claude-cli.test.ts  # Mocked unit tests (vi.mock child_process)
│   └── smoke/
│       ├── basic.ts          # On-demand smoke test — basic mode
│       ├── admin.ts          # On-demand smoke test — admin mode
│       └── lense.ts          # On-demand smoke test — lense E2E
├── e2e/
│   └── lense.spec.ts        # Playwright E2E tests for lense input
├── docs/
│   ├── architecture/ARCHITECTURE.md
│   ├── briefs/              # Phase briefs from spec-author
│   ├── plan/                # Build loop state
│   └── product/             # PRD and specs
├── index.html               # SPA shell with viewport meta
├── vite.config.ts           # Dev server port 5234, Vite proxy /api -> 3001
├── playwright.config.ts     # Playwright E2E config
├── tsconfig.json            # Project references root
├── tsconfig.app.json        # App TS config (strict, node types)
├── tsconfig.node.json       # Node TS config (vite + playwright configs)
├── eslint.config.js         # ESLint config
└── package.json             # Scripts: dev, build, lint, typecheck, test, smoke:*, test:e2e
```

## File ownership

| Path | Owner | Notes |
|------|-------|-------|
| `src/lib/claude-cli.ts` | CLI module | Exports `invokeClaude`, `ClaudeResult`, `ClaudeMode` |
| `src/lib/claude-cli.test.ts` | Tests | Mocked unit tests — no real CLI invoked |
| `src/shared/schema.ts` | Schema | Response schema — 5 component types, shared by server and frontend |
| `src/server/app.ts` | API server | Express app with POST /api/lense — calls invokeClaude in basic mode |
| `src/server/prompt.ts` | Prompt | System prompt referencing `~/dev/mustard/data/` and response schema |
| `src/server/server.test.ts` | Tests | API endpoint tests with mocked invokeClaude |
| `src/components/ResultRenderer.tsx` | Registry | Maps component type string to React renderer |
| `src/components/*.tsx` | Renderers | Template components for each mustard data type |
| `src/App.tsx` | UI | Lense page — input, loading spinner, animated results, error display |
| `src/smoke/*.ts` | Smoke tests | On-demand, invoke real CLI/API — NOT run by `npm test` |
| `e2e/*.spec.ts` | E2E tests | Playwright tests with mocked API — NOT run by `npm test` |

## Lense interaction model

- **Intent in, view out** — no chat UI, no conversation thread. User types natural language, results replace previous.
- **Always-replace** — each query clears the current view, shows loading, renders new results.
- **Template rendering** — Claude returns structured JSON, frontend renders pre-built components (not raw text).
- **Basic mode only** — the lense reads data, doesn't modify it. No admin permissions needed.

## Response schema

The API server instructs Claude to return JSON with a `components` array. Each component has:
- `type` — discriminator: `todo-list`, `log-timeline`, `person-notes`, `idea-list`, `summary`
- `data` — typed object specific to the component type

Defined in `src/shared/schema.ts`, used by both server and frontend.

## CLI modes

- **basic** — default, restricted permissions. Spawns `claude -p <prompt>`.
- **admin** — explicit opt-in, unrestricted. Spawns `claude --dangerously-skip-permissions -p <prompt>`. Never the default.

## Testing

- `npm test` — Vitest unit tests (19 tests: 8 CLI + 11 server) with mocked dependencies
- `npm run test:e2e` — Playwright E2E tests with mocked API
- `npm run smoke:basic` / `npm run smoke:admin` — real CLI invocation
- `npm run smoke:lense` — real E2E through API + Claude + data store
- Smoke tests are excluded from Vitest (in `src/smoke/`, not `*.test.ts`)
- E2E tests are excluded from Vitest (in `e2e/`, configured in vite.config.ts)

## Quality checks

- no-silent-pass
- no-bare-except
- error-path-coverage
- agents-consistency
