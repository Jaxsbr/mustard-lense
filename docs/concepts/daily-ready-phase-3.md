---
date: 2026-03-23
topic: daily-ready
phase: 3
status: concept
depends_on: daily-ready-phase-2.md
---

# Concept: Always-On

## What
Single story (US-D6) combining production build and macOS LaunchAgent. `npm run build` produces frontend bundle + compiled server. `npm run start` serves everything from a single Node process on port 7777. A plist template in the repo (`deploy/com.mustard.lense.plist`) configures RunAtLoad + KeepAlive. Setup and teardown documented in ARCHITECTURE.md.

## Why
mustard-lense must be always available at `http://localhost:7777` without manual intervention. This replaces the legacy mustard Flask app on the same port — Jaco's muscle memory and bookmarks transfer directly.

## Dependency
Phases 1 and 2 should ship first so the production build includes visual identity and animations. No code dependency — could technically ship independently, but the product should be visually complete before going always-on.

## Notes
- Port 7777 chosen to match legacy mustard.
- Documentation goes in ARCHITECTURE.md only — no separate manual page.
- LaunchAgent (not LaunchDaemon) runs in user session for access to MUSTARD_DATA_DIR and claude CLI.
- Plist template lives in repo, not auto-installed.
- PORT env var configurable, defaults to 7777.

## Next step
→ Run idea-shape to promote this concept to a full brief in docs/briefs/.
