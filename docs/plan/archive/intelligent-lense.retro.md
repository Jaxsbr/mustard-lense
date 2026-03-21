## Phase retrospective — intelligent-lense

**Metrics:** 16 tasks, 6 investigate, 0 fail, 0 rework. Rework rate: 0%. Investigate ratio: 37.5%. Health: Warning (investigate ratio below 40%).

**Review-sourced failure classes:**
- `security-gap` — first-seen, immediate compound (2 findings: prompt injection via undelimited user intent in system prompt; raw LLM response leaked to client on JSON parse failure). Fix proposed.

**Compounding fixes proposed:**
- [spec-author gate] Add rule to `.cursor/skills/spec-author/SKILL.md`: any story involving LLM-generated output must include done-when criteria for (1) input delimitation against prompt injection, and (2) output sanitization preventing raw LLM content from reaching clients. Reason: `security-gap` in intelligent-lense PR review — immediate compound per security exception.
