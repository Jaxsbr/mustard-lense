---
date: 2026-03-25
topic: fuzzy-keyword-mapping
origin: multi-scan-retrieval-brief
status: raw
---

# Concept: Fuzzy Keyword-to-Topic Mapping

## Idea
Map vague or associative query terms to record categories without requiring explicit dictionary entries. For example, "job" and "trouble" have no direct match in the static dictionary or dynamic vocabulary, but they carry semantic weight that could guide filtered retrieval toward todos, people notes, and daily logs.

## Why it matters
The multi-scan retrieval brief solves the "known keyword" case well (person names, explicit type words, known tags). But many real queries use indirect language — "is my job in trouble", "am I making progress", "what should I worry about" — where no token matches any dictionary entry. These queries fall back to unfiltered search, which is the same as today's single-scan behaviour.

## Possible approaches
1. **Embedding similarity against a keyword ontology** — maintain a small set of "concept embeddings" (e.g., embed "work tasks deadlines" as a proxy for the todo category). At query time, embed the full query and compare against concept embeddings to determine which categories are semantically closest. Fast (dot product comparison against ~10 concept vectors), but requires careful tuning of concept definitions.
2. **Lightweight LLM extraction at query time** — send the query to a fast, cheap model (e.g., Haiku) with a structured prompt: "Given this query, which of these categories are relevant: todo, people_note, daily_log, idea? Return up to 3." Adds ~200ms latency and a small cost per query, but handles arbitrary language.
3. **Index-time keyword expansion** — when building the index, use an LLM to generate "related terms" for each record and store them as additional metadata. At query time, the static dictionary grows to include these expanded terms. One-time cost at index time, zero cost at query time, but the expanded vocabulary could be noisy.
4. **User-defined aliases** — let Jaco define custom mappings (e.g., "job" → todo, people_note) in a config file. Manual but precise, and the user controls what associations the system makes.

## Constraints to keep in mind
- Must not add significant latency to the query path (the lense should feel instant).
- Must not add recurring cost that violates the nonprofit stewardship principle.
- False positives (wrong category) are less harmful than false negatives (missing records) — better to surface extra context than miss it.

## Status
Raw concept. Needs idea-shaping before spec. The multi-scan retrieval brief handles the 80% case (explicit keywords); this concept addresses the remaining 20%.
