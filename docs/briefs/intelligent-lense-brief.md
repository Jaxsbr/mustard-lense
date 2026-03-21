---
date: 2026-03-21
topic: intelligent-lense
status: draft
---

# Intent Brief: Intelligent Lense

## What

A single input field on the mustard-lense page where you type natural language intent — "what's on my plate this week", "anything about Nisal lately", "open todos and recent ideas" — and the page renders a structured, visual response using pre-built UI components. No chat bubbles, no conversation thread, no visible LLM. Just intent in, useful view out.

The backend routes the intent to Claude Code (via the existing `invokeClaude` module), which reads the mustard data store directly from disk, interprets the query, and returns structured JSON matching a defined component schema. The frontend receives this JSON and renders the appropriate template components — todo lists, timelines, note cards, summary panels — composed to fit the response.

## Why

The mustard data store holds valuable cross-cutting data (todos, people notes, daily logs, ideas) but has no way to query across types or get a synthesized view. Opening individual YAML files is tedious; the existing Flask web app shows one type at a time. The lense makes cross-cutting queries natural and turns scattered data into focused, visual answers — something you'd actually reach for daily before a meeting, at the start of a day, or when context-switching between projects.

## Where

- **New: API server** — a lightweight Node.js server layer (Express or Vite middleware) exposing an endpoint that accepts intent, wraps it with a system prompt, calls `invokeClaude`, and returns structured JSON to the frontend.
- **Existing: `src/lib/claude-cli.ts`** — the invocation layer, used by the API server in basic mode.
- **New: Frontend components** — lense input component (replaces or augments the landing page), and a set of template renderer components (todo list, daily log timeline, people note card, idea card, summary/insight panel).
- **New: Response schema** — a JSON contract defining the component types Claude can return and their data shapes, so the frontend knows how to render any response.
- **Adjacent (read-only): `~/dev/mustard/data/`** — the mustard data store. Claude Code reads these YAML files directly. Mustard-lense does not modify them in this phase.

## Constraints

- **No chat UI** — no message bubbles, no visible conversation history, no typing indicators. The interaction model is input → view, not input → reply.
- **Template-based rendering** — Claude returns JSON matching a known set of component types. The frontend has pre-built components for each. No raw LLM text displayed to the user.
- **Read-only against mustard data** — this phase queries data, it does not create or modify records.
- **Basic CLI mode only** — reading files doesn't require admin permissions.
- **Mustard data store is not modified** — no changes to the mustard project's files, schemas, or Flask app.
- **Streaming not required for V1** — a loading state while Claude processes is acceptable; streaming can be added later.
- **Polished transitions** — the latency between intent and render is noticeable (CLI spawn + LLM processing). The UX must treat this as a first-class concern: show a spinner/loading indicator during processing, and animate components into view when the response arrives. No content should simply pop in — it should feel intentional and smooth.
- **Always replace** — each new query clears the prompt and the current view, then renders the new response. No accumulated views, no conversation stacking. The current view animates out before the new one animates in. If the user wants to refine, they re-describe in the next query.

## Key decisions

- **Claude Code as data reader**: Rather than building a separate data access layer, Claude Code reads the YAML files directly via file system access. This leverages existing capability and avoids duplicating data parsing logic. The trade-off is latency (CLI spawn + LLM processing), which is acceptable for this use case.
- **Template components over raw text**: Claude returns structured JSON, not prose. This ensures the UI is always well-formatted and allows the frontend to add interactive affordances (checkboxes, date formatting, grouping) that raw text can't provide.
- **Cross-cutting as the first use case**: Rather than starting with single-type queries (which the Flask app already handles), the lense leads with its unique value — synthesizing across data types.

## Open questions

- Should the lense remember recent queries for quick re-access, or start fresh every time?
- What's the right fallback when Claude returns JSON that doesn't match known component types?

## Next step

→ spec-author: "define a phase" using this brief as input.
