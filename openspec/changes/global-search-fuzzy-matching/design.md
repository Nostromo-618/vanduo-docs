## Context

Global search indexes section titles, categories, and keywords from `sections.json` plus a handful of static pages. Matching today is case-insensitive substring only.

## Goals

- Tolerate common one-letter typos without adding fuse.js or other runtime search libraries.
- Preserve exact-match ranking and existing UI behavior (debounce, keyboard nav, 15-result cap).
- Keep matching logic in a testable pure module separate from DOM/modal code.

## Algorithm

Two-tier matching per query term against each indexed field (title, category, keywords):

1. **Exact substring** — same as today (`includes`), with existing score weights.
2. **Fuzzy fallback** — when substring fails, compare the term against words in the field (split on whitespace, hyphens, underscores, slashes) using Levenshtein distance.

### Edit-distance thresholds

| Term length | Max distance |
|---|---|
| 1–2 | 0 (no fuzzy) |
| 3–6 | 1 |
| 7+ | 2 |

Early exit when `|term.length - word.length| > maxDist`.

### Scoring

| Field | Exact | Fuzzy |
|---|---|---|
| Title | +100 (+50 exact title, +25 prefix) | +60 |
| Category | +50 | +30 |
| Keywords | +30 | +20 |

Pages category bonus (+5) unchanged when score > 0.

### Sidebar nav filter

The sidebar filter (`filterSidebarNav` in `sidebar.js`) reuses `matchTermInText` with **boolean** match semantics (no scoring):

- Matches against visible nav link **titles only** (not keywords or category headers).
- Same edit-distance thresholds as global search.
- Example: `msic` shows Music Player; `imag` shows Image Box; `phots` does **not** match Image Box (title has no `photo` word).

## Non-goals

- Fuzzy highlight rendering (`globalSearchHighlight` stays substring-only).
- Full-text / body indexing inside guide HTML.
- Framework `doc-search` component.
- Indexing keywords in the sidebar filter.
- New UI component or modal markup changes.

## Testing

- **Unit:** `docs/tests/unit/search-match.test.mjs` — Levenshtein, thresholds, scoring, typo/nonsense cases, sidebar label cases.
- **E2E (global search):** `docs/tests/e2e/search.spec.ts` — `msic` → Music Player, `phots` → Image Box.
- **E2E (sidebar filter):** `docs/tests/e2e/docs-view.spec.ts` — `msic` → Music Player visible, nonsense → no matches.

## Risks

- Short fuzzy terms (3 chars) could produce occasional false positives; mitigated by word-level matching and lower fuzzy scores.
- Fuzzy hits may not receive `<mark>` highlight in result titles.
