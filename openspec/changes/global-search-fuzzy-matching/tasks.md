## 1. Matching module

- [x] 1.1 Add `js/modules/search-match.mjs` with `levenshtein`, `maxEditDistance`, `matchTermInText`, `scoreTermAgainstFields`, `scoreSearchEntry`

## 2. Wire into global search

- [x] 2.1 Import `scoreSearchEntry` in `js/modules/search.js`
- [x] 2.2 Replace inline `includes` scoring in `globalSearch()` with module scoring

## 3. Tests

- [x] 3.1 Add `tests/unit/search-match.test.mjs` and `pnpm test:unit` script
- [x] 3.2 Add typo E2E cases to `tests/e2e/search.spec.ts` (`msic`, `phots`)

## 4. OpenSpec

- [x] 4.1 Add `openspec/changes/global-search-fuzzy-matching/` with proposal, design, tasks, and `specs/global-search/spec.md`

## 5. Verification

- [x] 5.1 `pnpm test:unit` passes
- [x] 5.2 `pnpm test -- tests/e2e/search.spec.ts` passes

## 6. Sidebar nav filter

- [x] 6.1 Import `matchTermInText` in `js/modules/sidebar.js`
- [x] 6.2 Replace `includes()` checks in `filterSidebarNav()` with fuzzy matching
- [x] 6.3 Add sidebar label cases to `tests/unit/search-match.test.mjs`
- [x] 6.4 Add sidebar typo E2E cases to `tests/e2e/docs-view.spec.ts`

## 7. Sidebar verification

- [x] 7.1 `pnpm test:unit` passes (sidebar label cases)
- [x] 7.2 `pnpm test -- tests/e2e/docs-view.spec.ts --grep "Sidebar filter"` passes (sidebar filter cases)
