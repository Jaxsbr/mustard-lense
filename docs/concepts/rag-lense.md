# Concept: RAG-accelerated Lense

**Status:** Idea — not yet specced
**Date:** 2026-03-21

## Problem

The intelligent lense sends the user's intent to Claude CLI, which reads all
80+ mustard YAML files via Read/Glob tool calls before generating a response.
Benchmarking shows CLI cold start is ~7 seconds, but total response time is
~50 seconds because tool-use round trips dominate. The current architecture
cannot meet a sub-20-second target.

## Proposed approach

Replace the CLI's file-reading tool use with a local RAG pipeline:

1. **Index:** Vectorise all mustard YAML records into a local vector store.
   Each record (todo, daily log, people note, idea) is a natural chunk.
2. **Retrieve:** On each user intent, embed the intent and retrieve the top-k
   most relevant records via similarity search.
3. **Generate:** Pass only the retrieved records inline in the CLI prompt.
   The CLI no longer needs Read/Glob tools — all data is already in context.
   It only reasons and produces the structured JSON response.

## Expected timing

| Step                     | Estimated |
|--------------------------|-----------|
| Embed intent (local)     | < 100 ms  |
| Vector search (local)    | < 50 ms   |
| CLI cold start           | ~7 s      |
| Reasoning over 5 records | ~3–5 s    |
| **Total**                | **~10–13 s** |

## Key decisions (not yet made)

- **Vector store:** LanceDB vs ChromaDB vs SQLite-vec. All local, free.
- **Embedding model:** Local (e.g. `all-MiniLM-L6-v2` via transformers.js)
  vs cheap API (OpenAI ada). Local preferred for zero recurring cost.
- **k value:** Start with 5. May need tuning based on query breadth.
- **Index refresh:** On server start? On file-system watch? Manual trigger?
- **CLI choice:** Claude CLI vs Cursor CLI — similar cold start (~7–9 s),
  Cursor CLI has better structured output (`--output-format json`).

## Why keep the CLI

Semantic search finds the right data, but the LLM synthesises — it decides
which component types to use, generates summaries across records, and formats
the structured JSON the renderers expect. Pure semantic search returns
"5 matching records" but not "a person-notes view with a weekly summary."

## Proof-of-concept results (2026-03-21)

Hardcoded 5 real mustard records (1 todo, 2 people notes, 1 daily log, 1 idea)
directly in the system prompt. Removed all tool permissions (no Read/Glob).
Measured with diagnostic timing on the server.

### Baseline (current architecture — CLI reads files via tool calls)

```
spawn→first-byte: 49459ms | first-byte→done: 833ms | total: 50292ms
```

### CLI cold start only (minimal "hello" prompt, no data)

| CLI        | Total   |
|------------|---------|
| Claude CLI | ~6.7 s  |
| Cursor CLI | ~8.7 s  |

### RAG-simulated (5 records inline, no tool use)

**Focused query** (e.g. "show me Siyang's notes"):

```
spawn→first-byte: 6814ms | first-byte→done: 925ms | total: 7739ms
```

**Synthesis query** (e.g. "synthesize an idea using all my data"):

```
spawn→first-byte: 23549ms | first-byte→done: 781ms | total: 24330ms
```

### Interpretation

- Tool-use elimination accounts for the majority of the improvement (50s → 8s).
- CLI cold start is ~7s regardless of approach — a fixed floor.
- **Reasoning complexity scales the time**, not data volume. The same 5 records
  take ~8s for formatting/filtering but ~24s for cross-record synthesis.
- Focused queries (the common case) are well within the sub-20s target.
- Synthesis queries are borderline at ~24s — acceptable for occasional use
  but the loading animation should communicate progress for longer waits.

### Implications for spec

- The RAG approach is validated. Vector store retrieval replaces tool use.
- Spec should include a **loading animation improvement** for synthesis-class
  queries (progress indication beyond a static spinner, e.g. streaming
  partial results or stage-based messages like "reading records…", "thinking…").
- Pre-computed summaries (weekly, per-person) at index time could reduce
  synthesis latency by front-loading some of the cross-referencing work.
