## Why

Docs global search uses strict substring matching (`includes()`). A single-character typo — for example `msic` instead of `music`, or `phots` instead of `photo` — returns no results even when the intended section is obvious. This feels brittle for a site-wide Cmd+K search.

## What Changes

- Add a pure vanilla fuzzy-matching module (`search-match.mjs`) using Levenshtein distance with length-based thresholds.
- Wire fuzzy scoring into existing `globalSearch()` in `search.js` without changing the modal UI or adding third-party libraries.
- Reuse the same matching module in the docs sidebar nav filter (`sidebar.js`) for consistent typo tolerance when filtering the current tab.
- Exact substring matches keep higher scores so correctly spelled queries still rank first.
- Unit tests (Node `node:test`) and Playwright E2E tests for typo scenarios.
- OpenSpec for the new `global-search` capability.

## Capabilities

### New Capabilities

- `global-search`: fuzzy typo-tolerant matching for the docs site-wide search modal, hero dropdown, and sidebar nav filter.

### Modified Capabilities

<!-- none -->

## Impact

- `js/modules/search-match.mjs`: new pure matching/scoring module.
- `js/modules/search.js`: `globalSearch()` delegates scoring to the module.
- `js/modules/sidebar.js`: `filterSidebarNav()` uses `matchTermInText` for title-only boolean filtering.
- `tests/unit/search-match.test.mjs`: unit coverage (including sidebar label cases).
- `tests/e2e/search.spec.ts`: global search typo E2E scenarios.
- `tests/e2e/docs-view.spec.ts`: sidebar filter typo E2E scenarios.
- No framework `dist/` changes; no `sync:framework` needed.
- Docs-only; no changelog column entry required.
