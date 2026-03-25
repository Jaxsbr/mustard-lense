# Mustard Lense — Product Requirements Document

## Vision

Claude Code integrated interface for the mustard data store, enabling natural conversation for managing and viewing mustard data. Experiments with dynamic UI generation — serving contextual UI based on data and actionable requests. Supports favourite/reusable UI elements that grow the app based on user usage patterns.

## Background

The mustard data store is a working system for capturing todos, people notes, daily logs, and ideas via a Flask web app and YAML files on disk. While functional, its current UI has friction points that are difficult to articulate. Mustard-lense will serve as both a better interface and a learning vehicle — insights from building and using it will inform mustard's own PRD evolution, particularly around intelligent/semantic search and insight generation.

## Target users

- **Jaco (primary)** — developer and daily mustard user who wants a conversational, AI-assisted interface for managing and exploring mustard data
- **AI agents (secondary)** — Claude Code and Cursor agents that interact with the mustard data store programmatically

---

## Capability areas

### CLI Integration

Claude Code CLI integration with two permission modes:
- **Basic mode** — standard CLI invocation with permission restrictions for routine tasks
- **Admin mode** — CLI with `--dangerously-skip-permissions` for tasks that require unrestricted access

### Intelligent Lense

Natural language intent input that queries the mustard data store and renders structured, visual responses using template components. No chat UI — the interaction model is intent in, view out. A local RAG pipeline (transformers.js embeddings + LanceDB vector store) retrieves relevant records by semantic similarity, then a synthesis layer (Claude Code CLI, swappable to Anthropic SDK) produces structured JSON matching a defined component schema. The frontend shows real processing stages via SSE and renders pre-built template components (todo lists, timelines, note cards, idea cards, summaries) with animated transitions.

### Structured CRUD

Structured browse, capture, and edit interface for the mustard data store. A collapsible panel alongside the lense provides tab-based navigation across record types with type-specific list views, a detail drawer for individual records, and quick capture. The panel is the reliable utility drawer; the lense is the AI-powered insight engine. Together they form the unified mustard product.

### Dynamic UI (future)

Contextual UI generation based on data shape and user intent. Favourite/reusable UI elements that grow the app based on usage patterns. The template component system from the Intelligent Lense is the foundation this will build on.

---

## Implementation phases

Full specifications (stories, acceptance criteria, done-when checklists) for each phase are in `phases/<name>.md`.

| Phase | Name | Stories | Status | Spec |
|-------|------|---------|--------|------|
| 1 | Foundation | US-L1, US-L2, US-L3, US-L4, US-L5 | Shipped | [phases/foundation.md](phases/foundation.md) |
| 2 | Intelligent Lense | US-L6, US-L7, US-L8, US-L9 | Shipped | [phases/intelligent-lense.md](phases/intelligent-lense.md) |
| 3 | RAG Lense | US-L10, US-L11, US-L12, US-L13 | Shipped | [phases/rag-lense.md](phases/rag-lense.md) |
| 4 | Structured Browse | US-U1, US-U2, US-U3, US-U4 | Shipped | [phases/structured-browse.md](phases/structured-browse.md) |
| 5 | Capture & Edit | US-U5, US-U6, US-U7, US-U8 | Shipped | [phases/capture-edit.md](phases/capture-edit.md) |
| 6 | Daily-Ready Visual Identity | US-D1, US-D2, US-D3 | Shipped | [phases/daily-ready.md](phases/daily-ready.md) |
| 7 | Living Polish | US-D4, US-D5 | Shipped | [phases/living-polish.md](phases/living-polish.md) |
| 8 | Typography & Layout | US-R1, US-R2 | Shipped | [phases/typography-layout.md](phases/typography-layout.md) |
| 9 | Markdown Editor | US-R3, US-R4, US-R5 | Shipped | [phases/markdown-rich-text.md](phases/markdown-rich-text.md) |
| 10 | Always-On | US-D6 | Shipped | [phases/always-on.md](phases/always-on.md) |
| 11 | Todo Due Date UX | US-X1, US-X2, US-X3 | Shipped | [phases/todo-due-date-ux.md](phases/todo-due-date-ux.md) |
| 12 | Markdown Toolbar Icons | US-X4 | Shipped | [phases/markdown-toolbar-icons.md](phases/markdown-toolbar-icons.md) |
| 13 | Month-Folder Organisation | US-X5 | Shipped | [phases/month-folder-organisation.md](phases/month-folder-organisation.md) |

---

## Story ID registry

All story IDs allocated across all phases, for quick reference when assigning new IDs.

| ID range | Capability | Phase(s) |
|----------|-----------|----------|
| US-L1 – US-L5 | CLI Integration / Foundation | 1 |
| US-L6 – US-L9 | Intelligent Lense | 2 |
| US-L10 – US-L13 | RAG Lense | 3 |
| US-U1 – US-U4 | Structured Browse | 4 |
| US-U5 – US-U8 | Capture & Edit | 5 |
| US-D1 – US-D3 | Daily-Ready Visual Identity | 6 |
| US-D4 – US-D5 | Living Polish | 7 |
| US-R1 – US-R2 | Typography & Layout | 8 |
| US-R3 – US-R5 | Markdown Editor | 9 |
| US-D6 | Always-On | 10 |
| US-X1 – US-X3 | Todo Due Date UX | 11 |
| US-X4 | Markdown Toolbar Icons | 12 |
| US-X5 | Month-Folder Organisation | 13 |
