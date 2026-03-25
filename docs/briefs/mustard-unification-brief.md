---
date: 2026-03-22
topic: mustard-unification
status: archived
---

# Intent Brief: Mustard Unification

## What

Evolve mustard-lense into the single "mustard" product by adding a collapsible CRUD panel (structured browse, capture, edit) alongside the existing lense experience. Separate mustard's data into a local-only git repo (`mustard-data`) that both the app and Cursor can access. Improve the lense's retrieval with metadata-filtered vector search. Delete the mustard-capture Cursor skill — the app must be the primary capture tool.

The result is a split-screen app: left panel is the structured CRUD workhorse with type tabs (Todos, People, Ideas, Daily Logs), right panel is the AI-powered lense. The CRUD panel can be collapsed; the lense is always visible. Records are browsed in type-specific lists and edited via a detail drawer (slide-over) that opens on click. New records are created from a sticky "Add" button in the panel header that pre-selects the active tab's type.

## Why

Jaco is a lead engineer and growth coach. His daily workflow centres on three things: preparing for 1:1s (pull up everything about a person), managing commitments (capture and track todos), and tracking coaching journeys over time. Two separate systems (mustard for CRUD, mustard-lense for insights) creates friction — neither is complete enough to be the single tool he reaches for. Mustard has the right data model but rough UX (capture, browse, edit, and overall look all need redesign). Mustard-lense has a better experience but can't write data and surfaces partially correct results. Unifying them means one browser tab, one tool, one habit.

Additionally, mustard's data contains personal information about team members (people notes, coaching context). This data is currently in a private GitHub repo, but shouldn't be on any remote — it should be local-only with git tracking for safety/revert.

## Where

- **mustard-lense/** — the app repo (React + Express + TypeScript). Evolves in place. Public on GitHub. Keeps repo name for now, renamed later.
- **mustard-data/** (new) — local-only git repo under `~/dev/`. Holds all YAML records (migrated from `mustard/data/`). No GitHub remote. Configured via `MUSTARD_DATA_DIR` env var.
- **mustard/** — the old Flask app. Archived after the new CRUD panel can fully replace its browse and capture functionality.
- **.cursor/skills/mustard-capture/** — deleted. The app's capture UI replaces it.

Key modules affected in mustard-lense:
- `src/server/rag/indexer.ts` — reads from configurable data path instead of hardcoded mustard path
- `src/server/app.ts` — new CRUD API routes (browse, capture, edit, lifecycle)
- `src/components/` — new structured view components (todo panel, people panel, etc.)
- `src/App.tsx` — split-screen layout with collapsible CRUD panel
- `src/server/rag/retriever.ts` — metadata-filtered vector search

## Constraints

- **Free GitHub tier.** Branch protection status checks only work on public repos (Learning #19). mustard-lense must stay public. No sensitive data in the app repo.
- **No LLM for retrieval.** Metadata filtering (log_type, person, date range) must be done with keyword/pattern matching on the query, not an LLM call. LLM is only used for synthesis after retrieval.
- **Data shape preserved, validation relaxed.** The YAML record structure (shared fields + type-specific fields) from mustard's `schema/record_contract.yaml` is preserved so existing data works without migration. However, the old validation policies (content-edit-same-day-only, audit-fields-immutable, strict required fields on meta/source) are dropped for the new CRUD. Everything is editable anytime. The app auto-fills `source` and `meta` on create so the user never deals with them. Schema hardening is a future phase once the UX is proven.
- **Build system learnings apply.** Phases max 5 stories. Investigate-first for cross-cutting work. Smoke-test runnable scripts. Non-deterministic input boundaries need degraded-response tests. All from LEARNINGS.md.
- **Capture UX is MLP-critical.** If capture doesn't feel faster and nicer than any alternative (old mustard, Obsidian, a text file), the unification fails. This is the "whoa" moment.

## Key decisions

- **Two repos, one product.** App code (public) and data (local-only) are separate repos connected by an env var. This solves the privacy concern without sacrificing branch protection or git-tracked data safety.
- **Evolve, don't rewrite.** mustard-lense's foundation (React, Express, RAG pipeline, component system, SSE streaming) is solid. Build on it rather than starting fresh.
- **Split-screen layout.** Left: collapsible CRUD panel. Right: always-visible lense. The lense is the primary experience; CRUD is the reliable utility drawer.
- **Type tabs for browse.** CRUD panel uses tabs (Todos, People, Ideas, Daily Logs) — one tab per log_type. Each tab shows a type-specific list view. Cross-cutting queries ("everything from today") are the lense's job, not the CRUD panel's. Tabs are extensible — named views like "Today" can be added later.
- **Detail drawer for edit and create.** Clicking a record opens a slide-over drawer with the full editable form for that type. Creating a new record uses the same drawer, empty, with log_type pre-set from the active tab. The drawer keeps the list visible behind it for context.
- **Sticky "Add" button.** Lives in the CRUD panel header, always visible without scrolling. Contextual: pre-selects the active tab's log_type so the user skips the type-picker step. Type is still changeable in the drawer if needed.
- **Relaxed validation.** All fields editable anytime — no same-day locks, no immutable audit fields. The app auto-fills source and meta on create. Old mustard's validation tiers caused friction (wrong things mandatory, content locked after capture day). Hardening comes later once the UX is proven.
- **Metadata-filtered retrieval.** Parse queries for person names, record types, and date signals. Apply LanceDB filters before vector search. Fewer, more relevant records → faster synthesis → better output.
- **CRUD panel first.** The structured views are what make this a daily driver. Capture and improved retrieval follow once the browse experience proves the layout works.
- **Delete mustard-capture skill.** The app must earn its place as the capture tool. No crutches.

## Open questions

- What does the person hub look like for 1:1 prep? A filtered view in the CRUD panel (People tab filtered to one person), a lense-generated summary, or both?
- How does growth tracking work? Is it derived from people_notes over time, or does it need new fields/record types?
- What's the migration plan for existing data? Copy `mustard/data/` to `mustard-data/`, init a new git repo, done? Or do records need transformation?
- When exactly does old mustard get archived? After CRUD panel ships? After capture ships? After a soak period?

## Next step

→ spec-author: "define a phase" using this brief as input. Start with the CRUD panel phase.
