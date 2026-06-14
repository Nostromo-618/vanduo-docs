## 1. State

- [x] 1.1 Add `docSectionHeights` (Map) cache and `sectionSizeObserver` slot to `state.js`

## 2. Reservation in doc-navigation

- [x] 2.1 Add `applyReservedSectionHeight` (reserve cached height as `contain-intrinsic-size`)
- [x] 2.2 Add `captureSectionHeight` + `ensureSectionSizeObserver` (ResizeObserver), guard skipped sections via `checkVisibility({ contentVisibilityAuto: true })`
- [x] 2.3 Call `applyReservedSectionHeight` before insertion in `loadSection`; observe each section in `observeSection`
- [x] 2.4 Disconnect `sectionSizeObserver` in `resetDocsSectionRenderState`, keeping the cached heights

## 3. Verification

- [x] 3.1 Frame-by-frame fling probe: tall backfill jump drops from ~1550px to ~one wheel step once the height is cached
- [x] 3.2 `pnpm test` E2E (navigation, docs-view, lazy-loader, morph) pass with no DOM/request-budget regression
- [x] 3.3 Add a Playwright spec locking in tall-section height reservation (`docs-view.spec.ts`)
