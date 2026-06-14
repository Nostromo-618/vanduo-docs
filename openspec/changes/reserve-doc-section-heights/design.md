## Context

The docs SPA keeps only a few sections in the DOM at once (infinite scroll with
top/bottom boundary sentinels). Sections carry `content-visibility: auto` with
`#dynamic-content > section { contain-intrinsic-size: 1px 600px }` so off-screen
sections skip rendering. `pinScrollAnchor` keeps the reading position stable when
a section is backfilled above the viewport.

Investigation (Playwright, frame-by-frame): at moderate scroll speed the backfill
is visually smooth (≤ ~50px/frame). At a fast fling (≥ ~300px/frame) the reference
element jumps ~1550px in a single frame — equal to the tall backfilled section
growing from its 600px reservation to its real height. Reserving the real height
(static probe) eliminated the jump (max Δ ≈ one wheel step, 0 jumps > 750px).
Cumulative-layout-shift was a misleading metric here: most of its value is
`pinScrollAnchor`'s own compensation, not a perceived jump.

## Goals / Non-Goals

**Goals:**
- Eliminate the fast-fling scroll jump caused by under-reserved tall sections.
- Preserve the minimal-DOM / load-on-scroll contract and its E2E budget tests.

**Non-Goals:**
- Pre-loading neighbor sections on landing (breaks the minimal-DOM contract).
- Removing `content-visibility` (it benefits the common, near-fallback sections).
- Closing the very-first-encounter gap for a never-measured section.

## Decisions

- **Cache real heights, key by section id** (`docSectionHeights`). Heights stay
  valid across section teardown, so the map is not cleared on reset — only the
  observer is disconnected.
- **Reserve before insertion.** `applyReservedSectionHeight` runs before
  `replaceChild` and before `initVanduoScope`/`initSectionDemos` force the first
  layout; applying it afterward is too late to prevent the first-render jump.
- **Keep heights fresh with a `ResizeObserver`** (`captureSectionHeight`), guarded
  by `checkVisibility({ contentVisibilityAuto: true })` so a skipped section does
  not overwrite the cache with its own reserved size.
- **Use a fixed `1px <h>px` reservation** (matches the validated probe). The
  browser's last-remembered-size still smooths in-session repeats; the explicit
  value is what fixes a freshly-inserted (no-memory) backfill.

## Risks / Trade-offs

- First encounter with a never-measured tall section still hiccups once; accepted.
- A viewport resize can leave a skipped section's reservation briefly stale until
  it next renders and the `ResizeObserver` corrects it — no worse than today's
  fixed 600px and self-healing.
- `checkVisibility`/`contentVisibilityAuto` is widely supported; where absent the
  guard is skipped and the section is simply measured whenever the observer fires.
