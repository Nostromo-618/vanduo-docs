## ADDED Requirements

### Requirement: Sections reserve their measured height for content-visibility

Documentation sections render with `content-visibility: auto`. The docs SPA SHALL
record each section's real rendered height and reserve it as that section's
`contain-intrinsic-size` so a section that is much taller than the CSS fallback
does not collapse to the fallback while skipped and then jump to its true height
when it renders during a backfill scroll.

The reservation SHALL be applied before the section element is inserted into
`#dynamic-content` (and before its first forced layout), and SHALL be kept in sync
with the rendered height. Measured heights SHALL persist across section teardown
(they remain valid the next time a section renders) and SHALL NOT cause any
additional sections or network requests to load.

#### Scenario: Tall backfilled section does not lurch on a fast scroll

- **WHEN** the reader fast-scrolls upward from a section whose previous neighbor is
  a tall section that has been measured before, triggering a backfill
- **THEN** the backfilled section reserves its measured height as it is inserted
- **AND** the viewport does not jump by approximately the section's height in a
  single frame

#### Scenario: Height cache survives navigating away and back

- **WHEN** a section is rendered, then torn down by navigating to another section,
  then loaded again
- **THEN** its previously measured height is reserved before it is re-inserted
- **AND** the section size observer is disconnected on teardown without clearing
  the cached heights

#### Scenario: Skipped sections do not corrupt the cache

- **WHEN** the size observer reports a section while `content-visibility: auto` is
  skipping it
- **THEN** the reported (reserved) size is ignored and the cached height is left
  unchanged
