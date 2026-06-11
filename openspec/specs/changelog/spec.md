# changelog (docs consumer) Specification

## Purpose

How the vanduo.dev changelog page (`sections/changelog.html`) presents release notes. Normative product rules live in the framework spec: `framework/openspec/specs/changelog/spec.md`.

## Requirements

### Requirement: Page models Framework and Ecosystem only

The changelog page SHALL document **Vanduo Framework** and **Ecosystem extension packages** in its header copy. It SHALL NOT present the documentation site as a separate tracked product with its own column.

#### Scenario: No Docs column

- GIVEN a framework release that also updated docs demos or navbar
- WHEN the version card is authored in `sections/changelog.html`
- THEN only Framework (and Ecosystem when applicable) sections appear
- AND there is no `<h4>Docs</h4>` block

### Requirement: Version card layout

Each `<article class="version-card">` SHALL include:

- Version badge (for example `v1.4.5`)
- Release date
- Optional `Latest` badge on the newest entry only
- One or two columns:
  - **Framework** — required when the framework version ships changes
  - **Ecosystem** — only when an ecosystem package ships in that release window

When only Framework changes, use a single full-width column (`vd-col-12`).

#### Scenario: Framework-only patch

- GIVEN v1.4.5 framework fixes with no ecosystem releases
- WHEN editing `sections/changelog.html`
- THEN the card contains Framework → Fixes (or other non-empty groups) in `vd-col-12`
- AND no Ecosystem column is rendered

### Requirement: Source file

Changelog content is maintained in [`docs/sections/changelog.html`](../../../sections/changelog.html). New versions are inserted at the top of the version list, below the page header.
