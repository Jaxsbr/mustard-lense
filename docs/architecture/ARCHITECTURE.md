# Mustard Lense — Architecture

## System topology

```
┌─────────────────────────────────────┐
│         Browser (React SPA)         │
│ localhost:5234 (dev) / :5678 (prod) │
│                                     │
│  ┌──────────┐  ┌─────────────────┐  │
│  │  Lense   │  │    Template     │  │
│  │  Input   │──│   Renderers     │  │
│  └──────────┘  └─────────────────┘  │
└──────────────┬──────────────────────┘
               │ POST /api/lense
               ▼
┌─────────────────────────────────────┐
│         API Server (Express)        │
│  (planned for intelligent-lense)    │
│                                     │
│  ┌──────────┐  ┌─────────────────┐  │
│  │  System   │  │   Response      │  │
│  │  Prompt   │  │   Schema        │  │
│  └──────────┘  └─────────────────┘  │
└──────────────┬──────────────────────┘
               │ invokeClaude(basic)
               ▼
┌─────────────────────────────────────┐
│       Claude Code CLI Module        │
│         src/lib/claude-cli.ts       │
│  ┌───────────┐  ┌────────────────┐  │
│  │ basic mode│  │  admin mode    │  │
│  │ (default) │  │ (--dangerously │  │
│  │           │  │  -skip-perms)  │  │
│  └───────────┘  └────────────────┘  │
└──────────────┬──────────────────────┘
               │ child_process.spawn
               ▼
┌─────────────────────────────────────┐
│         Claude Code CLI             │
│         (system binary)             │
└──────────────┬──────────────────────┘
               │ reads YAML files
               ▼
┌─────────────────────────────────────┐
│       Mustard Data Store            │
│    ~/dev/mustard/data/ (YAML)       │
│  todos/ daily_logs/ people_notes/   │
│  ideas/                             │
└─────────────────────────────────────┘
```

## Module structure

```
src/
├── App.tsx                    # Lense page — input, loading, result rendering
├── App.css                    # App styles
├── index.css                  # Global reset styles
├── main.tsx                   # React entry point
├── components/                # (planned for intelligent-lense phase)
│   ├── LenseInput.tsx         # Intent input field with submit/loading states
│   ├── ResultRenderer.tsx     # Component registry — maps type string to renderer
│   ├── TodoList.tsx           # todo-list component renderer
│   ├── LogTimeline.tsx        # log-timeline component renderer
│   ├── PersonNotes.tsx        # person-notes component renderer
│   ├── IdeaList.tsx           # idea-list component renderer
│   └── Summary.tsx            # summary component renderer
├── shared/                    # (planned for intelligent-lense phase)
│   └── schema.ts             # Response schema — TypeScript interfaces for component types
├── server/                    # (planned for intelligent-lense phase)
│   ├── index.ts               # Express API server entry point
│   ├── prompt.ts              # System prompt construction
│   └── server.test.ts         # API endpoint unit tests (mocked invokeClaude)
├── lib/
│   ├── claude-cli.ts          # CLI invocation module with mode support
│   └── claude-cli.test.ts     # Unit tests (mocked child_process)
└── smoke/
    ├── basic.ts               # On-demand smoke test — basic mode
    ├── admin.ts               # On-demand smoke test — admin mode
    └── lense.ts               # On-demand smoke test — lense E2E (planned)
```

## CLI modes

### Basic mode (default)

Standard Claude Code CLI invocation with permission restrictions. Used for routine tasks where the CLI operates within its normal safety guardrails.

**Invocation:** `claude [args]` — no special flags.

### Admin mode (explicit opt-in)

Claude Code CLI with `--dangerously-skip-permissions`. Used for tasks that require unrestricted filesystem, network, or system access.

**Invocation:** `claude --dangerously-skip-permissions [args]`

**Security implications:**
- Admin mode bypasses all CLI permission prompts — the agent can read/write any file, run any command, and make network requests without confirmation.
- Must never be the default. Every admin-mode invocation must be an explicit, conscious choice.
- The module validates the `mode` parameter strictly — only `'basic'` or `'admin'` are accepted.
- CLI invocation uses `child_process.spawn` with argument arrays (never shell string concatenation) to prevent command injection.

## Data flow

### Lense query flow (planned for intelligent-lense phase)

1. User types natural language intent into the lense input and presses Enter
2. Frontend sends `POST /api/lense` with `{ "intent": "..." }` to the API server
3. API server constructs a full prompt: system prompt (data store path, response schema, component types) + user intent
4. API server calls `invokeClaude({ mode: 'basic', prompt })` — basic mode, no admin permissions needed
5. Claude Code CLI reads YAML files from `~/dev/mustard/data/` (todos, daily_logs, people_notes, ideas)
6. Claude returns structured JSON matching the response schema: `{ "components": [{ "type": "todo-list", "data": {...} }, ...] }`
7. API server parses JSON from stdout and returns it to the frontend
8. Frontend maps each component to a template renderer (component registry) and animates them into view

### Response schema contract

Claude returns a JSON object with a `components` array. Each component has:
- `type` — discriminator string matching a known component type (`todo-list`, `log-timeline`, `person-notes`, `idea-list`, `summary`)
- `data` — typed object with fields specific to the component type

The shared schema module (`src/shared/schema.ts`, planned) defines TypeScript interfaces for each component type, used by both server validation and frontend rendering.

### Future (data write phase)

The lense currently supports read-only queries. Future phases will add write operations (capture, edit, lifecycle management) through the same intent model, using admin CLI mode where needed.

## Hosting

| Environment | Port | Mechanism |
|-------------|------|-----------|
| Development | 5234 | Vite dev server (`npm run dev`) |
| Production | 5678 | macOS launchd plist serving built assets |

## Dependencies on external systems

| System | Purpose | Required |
|--------|---------|----------|
| Claude Code CLI (`claude`) | AI conversation engine | Yes (smoke tests require it; unit tests mock it) |
| Mustard data store (`~/dev/mustard/data/`) | Record storage (YAML files) | Yes for lense queries (Claude Code reads directly); unit tests mock `invokeClaude` |
| Express (or equivalent) | API server for lense endpoint | Yes (planned for intelligent-lense phase) |
| Playwright | E2E browser testing for lense UI | Yes (planned for intelligent-lense phase) |
