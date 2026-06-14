## Why

Docs sections render with `content-visibility: auto` and a single small
`contain-intrinsic-size` fallback (`1px 600px`). Most sections are near that
height, but stacked demo pages (e.g. Parallax ≈ 2000px, Morph ≈ 2200px) are far
taller. When the infinite-scroll machinery backfills such a section above the
viewport, it is skipped at the 600px fallback and only grows to its true height
as it renders. During a slow scroll `pinScrollAnchor` hides this, but during a
fast trackpad fling the section jumps ~its full height (~1500px) in a single
frame — the "scroll hiccup" reported around the Parallax demo (which sits below
the tall Morph section, so scrolling up from it backfills Morph).

## What Changes

- Measure each section's real rendered height and cache it by section id.
- Reserve that height as the section's `contain-intrinsic-size` **before** it is
  inserted, so its content-visibility box is right-sized from the first frame and
  the backfill/skip transitions no longer lurch.
- The minimal-DOM and request-budget contract is unchanged: no extra sections are
  loaded, no extra network requests are made. The first encounter with a
  never-measured tall section can still hiccup once; every subsequent backfill
  (including after navigating away and back) is smooth.

## Capabilities

### New Capabilities
- `docs-section-loading`: how the docs SPA lazy-loads, backfills, and reserves
  layout space for documentation sections during scroll.

### Modified Capabilities
<!-- none: no existing spec covered section loading -->

## Impact

- `js/modules/state.js`: adds `docSectionHeights` cache and `sectionSizeObserver`.
- `js/modules/doc-navigation.js`: reserves cached height before insertion,
  captures height via `ResizeObserver`, disconnects on reset (cache retained).
- No framework `dist/` changes; no `sync:framework` needed.
- Verified with `docs/tests/e2e` (navigation, docs-view, lazy-loader, morph).
