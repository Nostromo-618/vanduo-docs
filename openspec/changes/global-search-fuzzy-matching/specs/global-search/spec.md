## ADDED Requirements

### Requirement: Global search tolerates common typos

The docs site-wide global search (`js/modules/search.js`) SHALL match indexed section titles, categories, and keywords when the user's query contains a small spelling error. Matching SHALL use a vanilla Levenshtein-based fuzzy fallback with length-based edit-distance thresholds. Exact substring matches SHALL receive higher scores than fuzzy matches so correctly spelled queries rank first.

The search index and UI (modal, debounce, keyboard navigation, 15-result limit) SHALL remain unchanged except for scoring logic. No third-party fuzzy search libraries SHALL be added.

#### Scenario: Typo finds Music Player

- **GIVEN** the global search modal is open
- **WHEN** the user types `msic`
- **THEN** a result for Music Player (`docs/music-player`) appears
- **AND** verified by `docs/tests/e2e/search.spec.ts`

#### Scenario: Typo finds section via keyword

- **GIVEN** the global search modal is open
- **WHEN** the user types `phots`
- **THEN** a result for Image Box (`docs/image-box`) appears because the keyword `photo` fuzzy-matches
- **AND** verified by `docs/tests/e2e/search.spec.ts`

#### Scenario: Exact spelling ranks above typo

- **GIVEN** the same indexed entry (for example Music Player)
- **WHEN** scoring `music` versus `msic`
- **THEN** the exact term score is greater than the fuzzy term score
- **AND** verified by `docs/tests/unit/search-match.test.mjs`

#### Scenario: Nonsense query shows no results

- **GIVEN** the global search modal is open
- **WHEN** the user types a string with no reasonable fuzzy match (for example `xyznonexistentsearchtermxyz`)
- **THEN** the empty state "No results found" is shown
- **AND** verified by `docs/tests/e2e/search.spec.ts` and `docs/tests/unit/search-match.test.mjs`

#### Scenario: Very short terms do not fuzzy-match

- **GIVEN** a two-character query term
- **WHEN** it does not substring-match any field
- **THEN** fuzzy matching is not applied (max edit distance 0)
- **AND** verified by `docs/tests/unit/search-match.test.mjs`

### Requirement: Sidebar nav filter tolerates common typos

The docs sidebar nav filter (`js/modules/sidebar.js`, `#doc-sidebar-filter-input`) SHALL use the same `matchTermInText` fuzzy matching as global search when filtering visible nav link titles in the current tab. Matching SHALL be boolean (show/hide links and category headers). Sidebar filter SHALL NOT index keywords or category names beyond what appears in link titles.

#### Scenario: Sidebar typo shows Music Player

- **GIVEN** the user is on a docs tab with Music Player in the sidebar (for example `#docs/components`)
- **WHEN** they type `msic` in `#doc-sidebar-filter-input`
- **THEN** the Music Player nav link remains visible
- **AND** unrelated nav links are hidden
- **AND** verified by `docs/tests/e2e/docs-view.spec.ts`

#### Scenario: Sidebar nonsense query shows no matches

- **GIVEN** the sidebar filter input is focused on a docs tab
- **WHEN** the user types a string with no reasonable fuzzy match (for example `xyznonexistentsearchtermxyz`)
- **THEN** a "No matches" hint is shown
- **AND** nav links are hidden
- **AND** verified by `docs/tests/e2e/docs-view.spec.ts`

#### Scenario: Sidebar title typo matches nav label

- **GIVEN** a nav link titled Image Box
- **WHEN** matching the query `imag` against the title via `matchTermInText`
- **THEN** the match succeeds
- **AND** verified by `docs/tests/unit/search-match.test.mjs`
