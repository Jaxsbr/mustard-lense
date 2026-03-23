---
date: 2026-03-24
topic: markdown-rich-text
phase: 2
status: concept
depends_on: typography-layout-brief.md
---

# Concept: Markdown editing & formatting toolbar

## What

After typography and drawer layout ship, add **Markdown** authoring for the main record `text` field: a **mode control** (raw Markdown vs styled, editable rendered view—not a read-only preview), a **compact formatting toolbar** (bold, italic, underline, strikethrough, link, lists, blockquote, inline code, code block), and **Notion-like** feel where styled content stays editable. Storage remains plain text in the existing `text` field unless a later story changes persistence.

## Why

Structured notes and scan-friendly rendering reduce friction for long-form logs and ideas; depends on comfortable type and drawer width from the typography-layout phase.

## Dependency

**Requires:** `docs/briefs/typography-layout-brief.md` (phase complete) so the editor sits in a legible, full-height, wide-enough drawer.

## Notes

- Toolbar ↔ CommonMark: underline is not standard—implementation phase should choose HTML, omit, or an extension.
- Library choice (TipTap, Lexical, textarea + split preview, etc.) is out of scope for this concept file.
- Apply to **all** record types that use the shared `text` field unless a future brief narrows scope.

## Next step

→ Run **idea-shape** to promote this concept to a full brief, then **spec-author** for a dedicated build phase.
