## Phase goal

Make mustard-lense always available at `localhost:7777` without manual intervention by adding a macOS LaunchAgent plist template and deployment documentation. The production build and start script already exist (shipped in Phase 6); this phase adds the LaunchAgent configuration that keeps the server running across reboots and crashes, and documents setup/teardown in ARCHITECTURE.md.

### Stories in scope
- US-D6 — Always-on LaunchAgent deployment

### Done-when (observable)

**Plist template:**
- [x] `deploy/com.mustard.lense.plist` exists and passes `plutil -lint deploy/com.mustard.lense.plist` (valid XML plist) [US-D6]
- [x] Plist `Label` key value is `com.mustard.lense` (verifiable by `grep` or `plutil -extract Label raw`) [US-D6]
- [x] Plist `RunAtLoad` key is `true` [US-D6]
- [x] Plist `KeepAlive` key is `true` [US-D6]
- [x] Plist `ProgramArguments` array contains a command that runs the production server — either `npm run start` via a shell, or a direct `node` invocation equivalent to the `start` script [US-D6]
- [x] Plist contains a `WorkingDirectory` key with a template path (e.g. `/Users/<you>/dev/mustard-lense`) that the user customizes [US-D6]
- [x] Plist contains `StandardOutPath` and `StandardErrorPath` keys pointing to log file locations [US-D6]
- [x] Plist `EnvironmentVariables` dict includes `PORT` with value `7777` [US-D6]
- [x] Plist handles PATH resolution so `node`/`npm` are findable — either `EnvironmentVariables` includes a `PATH` key with a documented template value, or `ProgramArguments` uses a login shell (e.g. `/bin/zsh -l -c "..."`) that inherits user PATH [US-D6]

**Documentation:**
- [x] `docs/architecture/ARCHITECTURE.md` contains an always-on deployment section documenting LaunchAgent setup: copy plist to `~/Library/LaunchAgents/`, customize paths, run `launchctl load ~/Library/LaunchAgents/com.mustard.lense.plist` [US-D6]
- [x] `docs/architecture/ARCHITECTURE.md` documents LaunchAgent teardown: `launchctl unload ~/Library/LaunchAgents/com.mustard.lense.plist` and plist removal [US-D6]
- [x] `docs/architecture/ARCHITECTURE.md` explains that LaunchAgent (not LaunchDaemon) is required for user-session access to `MUSTARD_DATA_DIR` and the `claude` CLI [US-D6]

**Structural:**
- [ ] `AGENTS.md` directory layout includes `deploy/` directory with `com.mustard.lense.plist` [phase]
- [ ] `AGENTS.md` file ownership table includes an entry for `deploy/com.mustard.lense.plist` [phase]
- [ ] `npm run build` exits 0 (production build still works) [phase]
- [ ] `npm test` exits 0 with all existing unit tests passing [phase]

### Golden principles (phase-relevant)
- **Faithful stewardship** — the plist template is a deployment artifact that directly affects availability; get the LaunchAgent configuration right (Label, KeepAlive, PATH resolution)
- **Safety and ethics** — LaunchAgent (not LaunchDaemon) respects least privilege; no system-level access needed, user controls installation explicitly
- **Clarity over complexity** — a checked-in template with clear docs, not an auto-install script; the user stays in control of when and how the service activates
