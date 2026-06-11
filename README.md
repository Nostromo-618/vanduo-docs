# Vanduo Docs

Documentation and website for Vanduo, served at https://vanduo.dev.

Framework repo: https://github.com/vanduo-oss/framework
NPM Package: https://www.npmjs.com/package/@vanduo-oss/framework
Hex Grid Package: https://www.npmjs.com/package/@vanduo-oss/hex-grid
Charts Package: https://www.npmjs.com/package/@vanduo-oss/charts
Flowchart Package: https://www.npmjs.com/package/@vanduo-oss/flowchart

## Current Snapshot

- Docs content now includes the **v1.4.5** changelog (rounded-corner background fixes), scoped runtime guidance, lifecycle manager docs, security practices, and canonical token guidance.
- Vanduo Charts is documented as the standalone `@vanduo-oss/charts` package with SVG chart demos and Vanduo lifecycle auto-init examples.
- Vanduo Flowchart is documented as the standalone `@vanduo-oss/flowchart` package with a live editor demo, primitive palette, and JSON import/export workflow.
- Production docs load the pinned framework CDN bundle from `@v1.4.5`, while local preview resolves framework assets from `./dist` and refreshes them from the sibling framework repo when available.
- Theme docs now treat `--vd-*` semantic and component tokens as the strict Vanduo API.
- Framework integration docs now recommend scoped `Vanduo.init(root)`, `Vanduo.destroy(root)`, and `Vanduo.reinit(name, root)` for SPAs and dynamic DOM.
- **v1.4.4+ Theme Switcher:** navbar uses the framework **menu variant** (icon toggle opens a picker). The theme-switcher live demo shows **icon menu and cycle button** side by side in a two-column layout with a shared opaque dropdown. Docs omit optional `data-tooltip` on the switcher; the framework supports tooltips when consumers opt in.
- Theme demo label updates on section init (no persistent `MutationObserver` on `#docs-view`) to avoid SPA tab freeze when navigating via global search.
- OpenSpec consumer spec: [openspec/specs/theme-switcher-consumer/spec.md](openspec/specs/theme-switcher-consumer/spec.md).

## Project Structure

```text
docs/
├── sections/     # Hash-routed doc content (components, guides, changelog)
├── js/           # SPA shell, navigation, demos
├── dist/         # Vendored framework build (synced from sibling repo)
├── tests/        # Playwright E2E
└── openspec/     # Consumer specs for framework integration
```

## Labs

The Labs section now focuses on experimental search and AI components. Hex Grid has graduated into the standalone `@vanduo-oss/hex-grid` package and repository.

## Installation

**We strongly recommend using [pnpm](https://pnpm.io/)**. The Vanduo ecosystem uses strict `.npmrc` security policies for dependency isolation and lockfile enforcement.

```bash
pnpm add @vanduo-oss/framework
```

## Local preview

Use the local preview script so the docs shell resolves framework assets from `./dist` instead of the published CDN bundle.

```bash
pnpm run preview:local
```

When the sibling `../framework` repo is present, the preview script refreshes `docs/dist` from `../framework/dist` before serving the site. If the framework repo is unavailable, the script falls back to the vendored `dist/` copy already tracked in this repo.

To refresh the local framework assets without starting the server:

```bash
pnpm run sync:framework
```

For a direct `file://` preview, run the sync step first so the local `dist/` assets match the latest framework build.

## Validation

```bash
pnpm test
```
