# Mustard Lense — Architecture

## System topology

```
┌─────────────────────────────────────┐
│         Browser (React SPA)         │
│ localhost:5234 (dev) / :5678 (prod) │
└──────────────┬──────────────────────┘
               │
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
└─────────────────────────────────────┘
               │
               ▼  (future)
┌─────────────────────────────────────┐
│       Mustard Data Store            │
│    localhost:3000 (Flask/YAML)      │
└─────────────────────────────────────┘
```

## Module structure

```
src/
├── App.tsx                    # Landing page — mustard seed parable
├── App.css                    # Landing page styles
├── index.css                  # Global reset styles
├── main.tsx                   # React entry point
├── lib/
│   ├── claude-cli.ts          # CLI invocation module with mode support
│   └── claude-cli.test.ts     # Unit tests (mocked child_process)
└── smoke/
    ├── basic.ts               # On-demand smoke test — basic mode
    └── admin.ts               # On-demand smoke test — admin mode
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

### Current (foundation phase)

1. User interacts with React SPA in browser
2. (Future) SPA sends prompts to a backend layer
3. Backend invokes Claude Code CLI via `invokeClaude()`
4. CLI output streams back via `onData` callback
5. Response rendered in UI

### Future (data interface phase)

The SPA will also communicate with the mustard data store (Flask API on port 3000) for CRUD operations on todos, people notes, daily logs, and ideas. The Claude Code CLI may orchestrate these operations conversationally.

## Hosting

| Environment | Port | Mechanism |
|-------------|------|-----------|
| Development | 5234 | Vite dev server (`npm run dev`) |
| Production | 5678 | macOS launchd plist serving built assets |

## Dependencies on external systems

| System | Purpose | Required |
|--------|---------|----------|
| Claude Code CLI (`claude`) | AI conversation engine | Yes (smoke tests require it; unit tests mock it) |
| Mustard data store | Record storage | No (future phase) |
