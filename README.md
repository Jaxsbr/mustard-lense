# Mustard Lense

Claude Code integrated interface for the mustard data store. Enables natural conversation for managing and viewing mustard data, with experiments in dynamic UI generation.

## Setup

```bash
npm install
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server on port 5234 |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm test` | Run Vitest unit tests |
| `npm run smoke:basic` | Smoke test — invoke Claude CLI in basic (restricted) mode |
| `npm run smoke:admin` | Smoke test — invoke Claude CLI in admin (unrestricted) mode |
| `npm run preview` | Preview production build |

## Architecture

See [docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md) for system topology, module structure, CLI modes, and security considerations.
