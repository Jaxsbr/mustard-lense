---
date: 2026-03-25
topic: synthesis-keyword-context
origin: multi-scan-retrieval-brief
status: raw
---

# Concept: Synthesiser Prompt Enrichment with Retrieval Context

## Idea
When multi-scan retrieval detects keywords and runs filtered scans, pass that retrieval context to Claude alongside the records. Instead of just "here are the most relevant records", the prompt would say "I searched your people notes for 'sway', your todos, and ran a general search. Here are the results." This lets Claude explain its reasoning, acknowledge data gaps, or note which categories had no relevant results.

## Why it matters
Today Claude receives records with no context about how they were selected. When a user asks "is my job in trouble" and the system surfaces 10 records from keyword-guided scans, Claude doesn't know that the system specifically searched todos and daily logs for work-related content. With retrieval context, Claude can say "I looked at your recent todos and daily logs — nothing suggests your job is at risk" rather than just presenting records without explanation.

This is especially valuable for negative results — when the data doesn't support the user's concern, Claude can explicitly say so, which is more helpful than silence or a vague summary.

## Possible shape
Add a `retrievalContext` block to the synthesis prompt:

```
<retrieval-context>
Scans performed:
1. People notes for person "sway" — 3 records found
2. Todos (all) — 5 records found
3. General search (unfiltered) — 5 records found
Total unique records after deduplication: 10
</retrieval-context>
```

Claude can use this to:
- Reference which data categories it looked at
- Note when a category returned zero results
- Explain why certain records were included

## Constraints to keep in mind
- Must not leak internal implementation details to the user (no "LanceDB WHERE clause" language).
- Must not increase prompt size significantly — keep it to a few lines.
- Should be phrased in user-facing language ("your people notes", "your todos") not system language.

## Status
Raw concept. Depends on multi-scan retrieval being shipped first. Low effort to add once the scan planner exists — just pass scan metadata through to the synthesiser.
