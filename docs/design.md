# Mustard Lense — Design System & Spec

Single source of truth for all UI design decisions. This document governs intent, tokens, components, behavior, and verification. AI agents and humans must reference this file for any UI work.

> **Soul sentence:** Mustard Lense should feel like a warm, quiet room where your thoughts become clearer just by writing them down — structured on the left, reflective on the right, calm at rest, and quietly alive in motion.

---

## Product Thesis

Mustard Lense is a calm, personal thinking tool — not a generic admin panel or flashy AI demo.

**Core emotional target:**

- warm, not clinical
- thoughtful, not busy
- responsive, not twitchy
- quietly delightful, not decorative

The app earns affection by combining two modes in one surface:

- **Structured control** on the left: browse, sort, filter, create, edit, delete.
- **Generative synthesis** on the right: ask in natural language and receive rendered insight.

The CRUD panel grounds the user in concrete records. The lense turns those records into meaning. The split should feel complementary, not competitive.

---

## Experience Principles

### 1. Warmth over SaaS neutrality

The visual system preserves mustard's warm gold identity and off-white surfaces. The interface must feel lived-in and human, not like a grey enterprise console.

### 2. Calm clarity first

Every screen should be understandable at a glance:

- strong information hierarchy
- low visual noise
- generous whitespace
- minimal competing accents

### 3. Motion should confirm, not entertain

Animation exists to answer "what just happened?" and "where did that go?" No motion should feel ornamental or slow the user down.

### 4. AI should feel embodied

The lense is not just a text box. The loading sequence, stage log, elapsed timer, and rendered cards should make the system feel like it is working through the user's data in a legible way. The lense should feel like it *knows your data* — surfacing connections, naming patterns, and speaking in a register that reflects your own language back to you.

### 5. Browsing should feel tactile

Hover tint, active states, type color coding, and micro-feedback should make the left panel feel alive without becoming noisy.

### 6. Token-first consistency

UI work must flow from shared tokens and component rules, not one-off values. New UI should inherit the existing system unless the system itself is being deliberately expanded.

---

## Primary User Outcomes

The design should help users feel the following within the first minute:

1. "This is my data, not a generic tool."
2. "I can both browse and ask."
3. "The app shows progress instead of leaving me guessing."
4. "Small actions feel satisfying."

And by the hundredth session:

5. "This tool knows my thinking over time."
6. "I discover things I forgot I captured."

---

## Screen Anatomy

### App Shell

The default layout is a two-region horizontal split:

- **Left:** CRUD panel — `width: 40%; min-width: 280px; max-width: 480px`
- **Right:** Lense workspace — `flex: 1; max-width: 700px; margin: 4rem auto`
- **Container:** `.app-layout` — `display: flex; height: 100vh`

Each panel scrolls independently (`overflow-y: auto`).

### Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| `> 767px` | Both panels visible, CRUD at 40% width |
| `<= 767px` | CRUD panel collapses to hidden; lense becomes full-width dominant experience |

When collapsed:

- A toggle button (hamburger/panel icon) remains fixed and accessible
- Tapping the toggle slides the CRUD panel in as an overlay from the left
- The CRUD panel overlay uses the drawer backdrop treatment (`rgba(0,0,0,0.2)`)
- The lense remains partially visible beneath the overlay

### Z-Index Scale

| Token | Value | Use |
|---|---|---|
| `--lense-z-base` | `0` | Default content layer |
| `--lense-z-panel` | `10` | CRUD panel (mobile overlay) |
| `--lense-z-backdrop` | `100` | Drawer/panel backdrop |
| `--lense-z-drawer` | `110` | Detail drawer |
| `--lense-z-toast` | `200` | Notifications (future) |

### Lense Region

The lense region is the emotional center of the product. Its composition:

1. Title + theme toggle
2. Single intent input
3. Processing feedback (stages, elapsed time)
4. Rendered results or empty state

The layout should feel vertically calm and centered, with enough top margin to avoid a cramped "dashboard" feeling. The lense side should feel subtly different from the CRUD side — a slightly warmer resting temperature, more generous spacing, and a rhythm that says "reflect here."

### CRUD Region

The CRUD panel is a compact control surface, not a second full application. It should feel efficient, scannable, and slightly denser than the lense side.

Composition:

1. Header row with toggle, title, add action
2. Type tabs
3. Lightweight controls (sort, filter, "show all")
4. Compact list views
5. Drawer overlay for detail editing

---

## Typography

System-native and fast. The canonical font stack is:

```
system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
```

### Type Scale

| Role | Token | Size | Weight | Line Height |
|---|---|---|---|---|
| h1 | `--lense-font-size-xl` | `2rem` | `700` | `1.2` |
| title | `--lense-font-size-lg` | `1.25rem` | `600` | `1.3` |
| body | `--lense-font-size-base` | `1rem` | `400` | `1.6` |
| label | `--lense-font-size-sm` | `0.85rem` | `600` | `1.4` |
| caption | `--lense-font-size-xs` | `0.75rem` | `400` | `1.4` |

### Typography Tokens

| Token | Value |
|---|---|
| `--lense-font-family` | `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` |
| `--lense-font-size-xs` | `0.75rem` |
| `--lense-font-size-sm` | `0.85rem` |
| `--lense-font-size-base` | `1rem` |
| `--lense-font-size-lg` | `1.25rem` |
| `--lense-font-size-xl` | `2rem` |
| `--lense-font-weight-regular` | `400` |
| `--lense-font-weight-semibold` | `600` |
| `--lense-font-weight-bold` | `700` |

### Typography Rules

- Font smoothing: `-webkit-font-smoothing: antialiased`
- Tabular nums for elapsed timers: `font-variant-numeric: tabular-nums`
- Prefer semibold and bold for structural hierarchy
- Avoid light (300) or thin (100) weights
- Keep long-form text at comfortable line height (1.6)

---

## Color System

The palette communicates warmth, type recognition, and semantic clarity.

### Core Palette

| Token | Light | Dark | Use |
|---|---|---|---|
| `--lense-color-text` | `#2d2d2d` | `#e5e5e5` | Headings, body text |
| `--lense-color-text-muted` | `#6b6b6b` | `#9ca3af` | Labels, captions, secondary |
| `--lense-color-bg` | `#faf9f6` | `#1a1a1e` | Page/card backgrounds |
| `--lense-color-bg-subtle` | `#f5f4f0` | `#242428` | Alternating/hover backgrounds |
| `--lense-color-border` | `#e5e3de` | `#3a3a3e` | Dividers, input borders |
| `--lense-color-accent` | `#c8982c` | `#dab04d` | CTAs, active states, brand identity |
| `--lense-color-accent-light` | `#f8f0db` | `#332d1a` | Accent backgrounds, badges |
| `--lense-color-input-border` | `#d5d3ce` | `#4a4a4e` | Form input borders |

**Palette intent:**

- **Background** (`--lense-color-bg`): soft paper-like base, never stark white. In dark mode, deep and warm — not blue-black.
- **Gold accent** (`--lense-color-accent`): the identity color. Used for primary actions, active lense emphasis, summary card framing, and the spiritual empty-state border.
- **Muted text**: calm supporting information that still passes contrast requirements.
- **Borders and surfaces**: enough structure to separate components without heavy chrome.

### Record Type Colors

Each record type gets a stable color identity used for left-border indicators, active tabs, hover states, and badges.

| Token | Light | Dark | Type |
|---|---|---|---|
| `--lense-color-type-todo` | `#4a7fc4` | `#6a9fd4` | Todo |
| `--lense-color-type-people` | `#7b5ea7` | `#9b7ec7` | People |
| `--lense-color-type-daily` | `#e07850` | `#e89878` | Daily Log |
| `--lense-color-type-idea` | `#2d9574` | `#4db594` | Idea |
| `--lense-color-type-todo-hover` | `rgba(74, 127, 196, 0.08)` | `rgba(106, 159, 212, 0.12)` | Todo hover |
| `--lense-color-type-people-hover` | `rgba(123, 94, 167, 0.08)` | `rgba(155, 126, 199, 0.12)` | People hover |
| `--lense-color-type-daily-hover` | `rgba(224, 120, 80, 0.08)` | `rgba(232, 152, 120, 0.12)` | Daily hover |
| `--lense-color-type-idea-hover` | `rgba(45, 149, 116, 0.08)` | `rgba(77, 181, 148, 0.12)` | Idea hover |

Type colors belong primarily to: active tab treatment, left-edge list indicators, hover tint families, and count badge accents. They should not overwhelm the interface or turn the panel into a rainbow.

### Status Colors

| Token | Light | Dark | Use |
|---|---|---|---|
| `--lense-color-status-open` | `#d97706` | `#f59e0b` | Open/active items |
| `--lense-color-status-done` | `#059669` | `#34d399` | Completed items |
| `--lense-color-status-parked` | `#6b7280` | `#9ca3af` | Parked/deferred |

### Semantic Colors

| Token | Light | Dark | Use |
|---|---|---|---|
| `--lense-color-success-bg` | `#e8f5e6` | `#1a2e1a` | Success backgrounds |
| `--lense-color-success-text` | `#2e6b28` | `#4ade80` | Success text |
| `--lense-color-error-bg` | `#fde8e8` | `#2e1a1a` | Error backgrounds |
| `--lense-color-error-text` | `#9b2c2c` | `#f87171` | Error text, delete actions |
| `--lense-color-elapsed` | `#9ca3af` | `#6b7280` | Timer text |
| `--lense-color-verse-border` | `#c8982c` | `#dab04d` | Empty-state border |
| `--lense-color-verse-bg` | `#fdf8e8` | `#2a2518` | Empty-state background |
| `--lense-color-verse-footer` | `#6b6b6b` | `#9ca3af` | Empty-state caption |

### Color Rules

- Semantic meaning must win over decoration
- Status colors remain distinct from type colors
- Do not rely on color alone when semantic meaning matters — pair with icons, text, or position

---

## Spacing Scale

4px base unit. All spacing uses `--lense-spacing-*` tokens.

| Token | Value | px |
|---|---|---|
| `--lense-spacing-xs` | `0.25rem` | 4 |
| `--lense-spacing-sm` | `0.5rem` | 8 |
| `--lense-spacing-md` | `1rem` | 16 |
| `--lense-spacing-lg` | `1.5rem` | 24 |
| `--lense-spacing-xl` | `2rem` | 32 |

**Spacing feel:**

- CRUD panel: compact but breathable
- Lense cards: more generous
- Controls: tight and efficient
- Empty/loading states: enough space to feel intentional, not sparse by accident

---

## Elevation

| Level | Token | Value | Use |
|---|---|---|---|
| 0 | — | `none` | Flat elements |
| 1 | `--lense-shadow` | `0 1px 3px rgba(0,0,0,0.08)` (light) / `0 1px 3px rgba(0,0,0,0.3)` (dark) | Cards |
| 2 | `--lense-shadow-drawer` | `-2px 0 12px rgba(0,0,0,0.15)` (light) / `-2px 0 12px rgba(0,0,0,0.3)` (dark) | Drawers, overlays |

`--lense-shadow` switches between light/dark automatically via the theme system (defined in both `[data-theme="dark"]` and the `prefers-color-scheme` media query).

The app should feel layered, not shadow-heavy.

---

## Border Radius

| Token | Value | Use |
|---|---|---|
| `--lense-radius` | `8px` | Cards, inputs, buttons, drawers |
| `--lense-radius-sm` | `4px` | Badges, theme pills |
| `--lense-radius-pill` | `10px` | Tab count badges (pill shape) |
| `--lense-radius-circle` | `50%` | Status dots |

Rounded corners should feel soft and modern, not playful.

---

## Transition Tokens

| Token | Value | Use |
|---|---|---|
| `--lense-transition-fast` | `0.15s ease` | Color, opacity, hover states |
| `--lense-transition-normal` | `0.2s ease` | General state changes |
| `--lense-transition-layout` | `0.3s ease` | Panel width, drawer slide, layout shifts |

---

## Theme System

Three-tier dark mode support:

1. **Explicit toggle** — `[data-theme="dark"]` / `[data-theme="light"]` on `<html>`
2. **System preference fallback** — `@media (prefers-color-scheme: dark)` with `html:not([data-theme="light"])`
3. **Persistence** — stored in `localStorage` key `mustard-theme`, read before React hydration via inline `<script>` in `index.html` to prevent flash

Theme toggle displays: sun icon for light, crescent icon for dark.

### Dark Mode as Evening Mode

Dark mode is not a checkbox obligation — it is where many users will spend their reflective hours. The dark palette should feel warm and enveloping, not cold or stark:

- Background is deep warm-neutral (`#1a1a1e`), not blue-black
- The gold accent shifts slightly warmer (`#dab04d`) to maintain vibrancy against dark surfaces
- Elevation shadows are deeper to maintain perceptible card separation
- The empty-state verse background (`#2a2518`) should feel like amber warmth, not a dark void

All color tokens must be defined in both `[data-theme="dark"]` and the `prefers-color-scheme` media query.

---

## Component Rules

### 1. App Header

The `Mustard` wordmark acts as a simple anchor, not a brand-heavy hero.

- Keep the heading visually quiet but clearly dominant over surrounding controls
- The theme toggle should feel secondary and utility-oriented
- The header must never feel like a toolbar packed with controls

### 2. Theme Toggle

A mode control, not a decorative icon button.

- Small bordered ghost button
- Same token/radius system as other secondary controls
- Hover state: `--lense-color-bg-subtle`
- State change should feel immediate
- Theme choice must persist and apply before hydration to avoid flash

### 3. Lense Input

The main invitation to interact with the product. It should feel like asking a trusted assistant, not filling a form.

- Full width inside the readable lense column
- Border: `2px solid --lense-color-input-border` (stronger than CRUD inputs)
- Focus: `border-color: --lense-color-accent`, no outline
- Loading state: `opacity: 0.6; cursor: not-allowed` — visibly disabled without disappearing
- Radius: `--lense-radius`

### 4. Processing State

The loading experience is core product UX, not a temporary placeholder.

- Show stage progression clearly
- Completed stages dim into history (`--lense-color-text-muted`)
- Current stage carries accent emphasis (`--lense-color-accent`)
- Spinner: `0.8s linear` rotation, restrained and lightweight
- Elapsed time: visible in `--lense-color-elapsed`, tabular-nums, low-emphasis
- Stage text enters with `stageFadeIn` animation (0.3s ease-out)

**Purpose:** Reduce uncertainty during slower AI responses. Make the system feel transparent and grounded.

### 5. Result Cards (`.lense-card`)

The lense's answer surface. They should feel like thoughtfully composed notes, not generic widgets.

- Background: `--lense-color-bg`
- Border: `1px solid --lense-color-border`
- Radius: `--lense-radius`
- Padding: `--lense-spacing-lg`
- Shadow: `--lense-shadow`
- Enter with `fadeSlideIn` animation (0.4s ease-out, staggered 80ms per card, max 10 items staggered — subsequent items appear at the 10th item's delay)
- **Summary card variant** (`--summary`): `--lense-color-accent-light` background, `--lense-color-accent` border — distinguishes synthesis from raw records
- **Fallback card**: should read as degraded but still intentional — use muted text and a "could not render" message

### 6. CRUD Panel Header

Balance control density with clarity.

- Toggle button stays leftmost and always available
- Title occupies the visual center
- Add button (`.crud-panel-add`): `--lense-color-accent` background, white text — the only primary-accent control in the header
- Avoid introducing more header actions unless absolutely necessary

### 7. Tabs (`.crud-panel-tab`)

Primary orientation tool in the browse surface. They should communicate "content family," not "navigation chrome."

- Inactive: `--lense-color-text-muted`, transparent bottom border
- Active: type-color text + `2px solid` bottom border, `font-weight: 600`
- Count badges: `color-mix(in srgb, type-color 15%, transparent)` background (active only)
- Transition: `tab-crossfade` (0.18s ease-in-out) — quick, not slide-heavy

**Browser note:** `color-mix()` requires Safari 16.2+, Chrome 111+. See browser support section.

### 8. List Controls

Controls above lists should stay small and utility-oriented.

- Controls must not compete visually with the records
- Selects should feel lightweight and aligned to the panel density
- "Show all" is a text action, not a prominent button

### 9. List Items (`.list-item`)

The most frequently scanned surface in the CRUD panel. The list should feel tactile and organized, not table-like.

- Left border indicator: `3px solid` type-color
- Type-specific hover backgrounds at 8% opacity (12% dark)
- Click feedback: `transform: scale(0.98)` on `:active`
- Text overflow: `ellipsis` with `nowrap`
- Minimum height: `44px` (touch target)

**Per type layout:**

- **Todos:** status indicator first, text second, due date last
- **People notes:** person name first, date available for anchoring
- **Ideas:** status badge plus text
- **Daily logs:** date first, optional theme chip, then text

### 10. Detail Drawer (`.detail-drawer`)

The focused editing surface. It should feel like a side sheet, not a modal takeover.

- Slide from right: `transform: translateX(100%)` to `translateX(0)`, `--lense-transition-layout`
- Width: `400px; max-width: 80vw`
- Backdrop: `rgba(0,0,0,0.2)` with `backdrop-fade-in` (0.2s ease-out)
- Shadow: `--lense-shadow-drawer`
- Form fields: simple, low-friction, using standard input tokens
- Footer: destructive (`.drawer-delete`) and confirmatory (`.drawer-save`) actions clearly distinct

**Behavior:**

- Edit mode shows immutable metadata fields (created date, type)
- Create mode prioritizes fast entry — minimal required fields
- Delete confirmation remains in-app and inline: replace the delete button with a confirm/cancel pair, red-tinted row

**Keyboard:**

- `Escape` closes the drawer
- Focus is trapped inside while open (tab cycling)
- On close, focus returns to the trigger element

### 11. Buttons

Three button families:

| Family | Style | Use |
|---|---|---|
| **Primary** | `--lense-color-accent` bg, white text, hover `opacity: 0.85–0.9` | Sparingly — save, add, submit |
| **Ghost** | Transparent bg, `1px solid --lense-color-border`, hover `--lense-color-bg-subtle` | Close, toggle, secondary |
| **Danger** | `1px solid --lense-color-error-text`, text `--lense-color-error-text`, hover `--lense-color-error-bg` | Delete, destructive |

- Disabled: `opacity: 0.5; cursor: not-allowed`
- Primary buttons should not appear in large numbers on one screen
- Radius: `--lense-radius`

### 12. Inputs

- Border: `1px solid --lense-color-input-border` (standard) / `2px` (lense input)
- Focus: `border-color: --lense-color-accent; box-shadow: 0 0 0 2px rgba(200, 152, 44, 0.2)` — visible ring, not just color change
- Loading state: `opacity: 0.6; cursor: not-allowed`
- Radius: `--lense-radius`
- Selects, textareas: same border/focus tokens as text inputs

### 13. Empty State

The mustard seed verse is part of the app's identity. It should feel reflective and grounded, not gimmicky.

- Border: `1px solid --lense-color-verse-border`
- Background: `--lense-color-verse-bg`
- Footer caption: `--lense-color-verse-footer`
- Generous spacing, readable typography
- Visually quieter than result cards
- This state should create a small "pause" moment before the first query

**Per-type CRUD empty state:** When a type tab has zero records, show a centered muted message ("No todos yet") with the type color as a subtle accent, and the add button as the primary call to action.

---

## Error & Edge Case States

### Lense Errors

| State | Treatment |
|---|---|
| API timeout / network failure | Replace processing state with an error card: `--lense-color-error-bg` background, `--lense-color-error-text` heading, concise message, and a "Try again" ghost button |
| Empty results | A muted card with helpful guidance: "No matching records found. Try broadening your question." |
| Partial failure | Show successfully rendered cards; append a muted fallback card for the failed portion |

### CRUD Errors

| State | Treatment |
|---|---|
| Save failure | Inline error text below the failing field in `--lense-color-error-text`; the save button remains enabled for retry |
| Delete failure | Toast-style inline message at the drawer footer in error colors |
| Load failure | Centered error message in the list area with a "Retry" ghost button |
| Validation | Field-level error borders (`--lense-color-error-text`) and helper text |

---

## Motion Language

Motion stays in the fast, soft range. Purpose: confirm state changes, reduce uncertainty, add quiet delight.

### Named Animations

| Name | Duration | Easing | Use |
|---|---|---|---|
| `spin` | `0.8s` | `linear` | Loading spinner |
| `stageFadeIn` | `0.3s` | `ease-out` | Processing stage text |
| `fadeSlideIn` | `0.4s` | `ease-out` | Result items (staggered 80ms, max 10) |
| `tab-crossfade` | `0.18s` | `ease-in-out` | Tab content switch |
| `tab-celebrate` | `0.5s` | `ease-out` | Tab badge pulse on record create |
| `item-shimmer` | `0.8s` | `ease-out` | Shimmer on record edit |
| `item-farewell` | `0.5s` | `ease-in` | Tilt + shrink + fade on delete |
| `backdrop-fade-in` | `0.2s` | `ease-out` | Drawer backdrop |

### CRUD Choreography

When a record is created:

1. New list item enters with a subtle slide-in and highlight
2. The relevant tab badge pulses with `tab-celebrate` (0.5s)
3. If the lense is active, it acknowledges the new data is available

When a record is deleted:

1. The item plays `item-farewell` (tilt + shrink + fade, 0.5s)
2. Remaining items reflow smoothly
3. The tab count updates after the farewell completes

### Motion Rules

- Prefer `opacity` and `transform` — GPU-composited, no layout thrash
- Avoid bounce-heavy or springy personalities
- Never make the user wait for an animation to finish before understanding the outcome
- `prefers-reduced-motion: reduce` — set all animation durations to `0.01s` and all transitions to `0.01s` (near-instant, preserving layout shifts without motion)

---

## Accessibility

Target: **WCAG 2.1 AA** compliance.

### Contrast

- All text/background combinations must meet 4.5:1 contrast ratio (normal text) or 3:1 (large text, 18px+ or 14px bold+)
- Verified for both light and dark themes
- Do not rely on color alone — pair with icons, text labels, or positional cues

### Focus

- All interactive elements use `:focus-visible` (not `:focus`) to avoid mouse-click rings
- Focus style: `outline: 2px solid --lense-color-accent; outline-offset: 2px`
- Applied consistently to: buttons, tabs, list rows, selects, inputs, drawer actions

### Touch Targets

- Minimum interactive target size: `44 x 44px` (per WCAG 2.5.8)
- Even in the compact CRUD panel, hit areas must meet this minimum

### Keyboard Navigation

- Tab order follows visual order (left panel top-to-bottom, then right panel)
- Drawer: `Escape` closes, focus trapped inside, focus returns to trigger on close
- Tabs: arrow keys move between tabs when focused
- Lists: items are focusable and activated with `Enter` or `Space`

### Reduced Motion

- `@media (prefers-reduced-motion: reduce)` sets all animations and transitions to near-instant (`0.01s`)

---

## Class Naming Convention

BEM-inspired with namespace scoping:

| Namespace | Scope |
|---|---|
| `.lense-*` | Main app + result components |
| `.crud-panel-*` | CRUD panel |
| `.list-*` | List items |
| `.drawer-*` | Detail drawer |

**Modifiers:** double-dash (`--collapsed`, `--active`, `--loading`, `--todo`, `--people`, `--summary`).

---

## Implementation Rules

### Token system

- All colors, spacing, typography sizes, shadows, radii, and transitions come from `src/components/tokens.css`
- If a new visual value is reused or semantically important, promote it to a token before broad use
- Light and dark mode variants must be defined together in both `[data-theme="dark"]` and the `prefers-color-scheme` media query

### Styling architecture

- Vanilla CSS + `--lense-*` custom properties
- Scoped class namespaces: `.lense-*`, `.crud-panel-*`, `.list-*`, `.drawer-*`
- Prefer class-based styling over inline styles

### Do

- Build new UI on top of shared card, list, button, and token patterns
- Keep the lense side visually calmer than the CRUD side
- Use type colors as accents, not as dominant backgrounds
- Preserve the readable single-column lense layout

### Don't

- Don't introduce Tailwind, CSS-in-JS, or ad-hoc styling systems
- Don't add raw colors or one-off shadows directly into components
- Don't use animation libraries for routine interaction feedback
- Don't let the CRUD panel become more visually dominant than the lense
- Don't use inline styles for colors or fonts
- Don't hardcode light-mode-only values — every color must have a dark variant

### Browser Support

Target: last two versions of Chrome, Firefox, Safari, and Edge. `color-mix()` requires Safari 16.2+, Chrome 111+ — no fallback needed given the support target.

---

## Current Drift To Correct

The current implementation is strong, but this section calls out known drift for future improvement:

### 1. Inline style usage should be reduced

Observed: status coloring in result components, inline pointer cursor on CRUD list wrappers.
**Target:** Move repeatable visual decisions into token-backed classes.

### 2. Focus treatment is present but not yet design-complete

Current inputs use `:focus`. The system should standardize `:focus-visible` with the accent outline treatment across all interactive elements.

### 3. Some hardcoded values should be normalized

Observed: direct white text values, hardcoded shadow values, one-off radius values. Repeatable patterns should be tokenized using the radius, shadow, and transition tokens defined above.

---

## Verification Checklist

Future UI work should be reviewed against these questions:

| # | Question | Testable check |
|---|---|---|
| 1 | Does it preserve the warm, calm character? | Uses only tokens from `tokens.css`; no raw hex values |
| 2 | Does it use existing tokens before inventing new ones? | Zero new CSS custom properties unless deliberately extending the system |
| 3 | Is the lense still the emotional center? | Lense region has more generous spacing and calmer density than CRUD |
| 4 | Do motion and feedback clarify state changes? | Each state transition has a named animation or transition token |
| 5 | Are both themes handled? | Every new color defined in light, dark, and `prefers-color-scheme` |
| 6 | Is accessibility maintained? | All interactive elements have `:focus-visible` ring; contrast >= 4.5:1; targets >= 44px |
| 7 | Does it feel like Mustard? | Uses the gold accent intentionally; warm neutrals; no cold greys |

---

## File Mapping

This spec primarily governs:

- `src/App.tsx` — shell layout, theme toggle
- `src/App.css` — app-level layout styles
- `src/components/tokens.css` — canonical token definitions
- `src/components/components.css` — shared component styles
- `src/components/*.tsx` — lense components (input, processing, results, empty state)
- `src/components/panel/*.tsx` — CRUD panel components (header, tabs, list, drawer)
- `src/components/panel/*.css` — CRUD panel styles
- `index.html` — theme bootstrap script (pre-hydration)
