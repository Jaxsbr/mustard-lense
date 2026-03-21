# Mustard Lense

Claude Code integrated interface for the mustard data store. Enables natural conversation for managing and viewing mustard data, with experiments in dynamic UI generation.

## Setup

```bash
npm install
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server + API server (port 5234) |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm test` | Run Vitest unit tests |
| `npm run smoke:basic` | Smoke test — invoke Claude CLI in basic (restricted) mode |
| `npm run smoke:admin` | Smoke test — invoke Claude CLI in admin (unrestricted) mode |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run preview` | Preview production build |

## Using the Lense

The lense is the primary interface — a single text input where you describe what you want to see from your mustard data store.

1. Run `npm run dev` to start both the frontend and API server.
2. Open `http://localhost:5234`.
3. Type a natural language query into the input field. Examples:
   - "what's on my plate this week"
   - "notes about Nisal"
   - "open todos and recent ideas"
   - "what happened yesterday"
4. Press Enter. A loading spinner appears while Claude reads your mustard data.
5. Results render as visual components — todo lists, timelines, note cards, idea lists, and summaries.

Each new query replaces the previous results. The mustard seed verse is shown when no query has been submitted.

### Component types

| Type | Renders |
|------|---------|
| `todo-list` | Items with status indicator, text, and optional due date |
| `log-timeline` | Daily log entries with date, theme, and text |
| `person-notes` | Notes about a person with name, date, and text |
| `idea-list` | Ideas with status badge and text |
| `summary` | Title and text block for cross-cutting synthesis |

### Prerequisites

- The `claude` CLI must be installed and available in PATH.
- The mustard data store must exist at `~/dev/mustard/data/`.

## Architecture

See [docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md) for system topology, module structure, CLI modes, and security considerations.
