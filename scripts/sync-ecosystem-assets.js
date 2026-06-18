#!/usr/bin/env node

/**
 * Vendor the installed @vanduo-oss ecosystem packages' built assets into the
 * paths the docs demos load. The docs site is static (no bundler, node_modules
 * is not deployed), so the demos reference committed copies — but those copies
 * are now generated from the npm-installed, lockfile-pinned package builds rather
 * than hand-maintained. Run on `pnpm install`/`preview:local`; commit the output.
 *
 * Source of truth: docs/package.json dependencies + pnpm-lock.yaml.
 */

const { cpSync, mkdirSync, existsSync, readFileSync } = require('fs');
const path = require('path');

const docsRoot = path.resolve(__dirname, '..');
const modulesDir = path.join(docsRoot, 'node_modules', '@vanduo-oss');

// Each entry: copy <pkg>/dist/<from> -> docs/<to>.
const COPIES = [
  // IIFE bundles loaded via <script> in index.html (expose window.Vanduo* globals).
  { pkg: 'charts', from: 'vanduo-charts.iife.js', to: 'js/vanduo-charts.iife.js' },
  { pkg: 'charts', from: 'vanduo-charts.css', to: 'css/vanduo-charts.css' },
  { pkg: 'flowchart', from: 'vanduo-flowchart.iife.js', to: 'js/vanduo-flowchart.iife.js' },
  { pkg: 'flowchart', from: 'vanduo-flowchart.css', to: 'css/vanduo-flowchart.css' },
  { pkg: 'music-player', from: 'vanduo-music-player.iife.js', to: 'js/vanduo-music-player.iife.js' },
  { pkg: 'music-player', from: 'vanduo-music-player.css', to: 'css/vanduo-music-player.css' },
  // hex-grid ships ESM only; docs/js/hex-grid.js re-exports VdHexGrid from here.
  { pkg: 'hex-grid', from: 'index.js', to: 'js/vendor/hex-grid/index.js' },
];

function pkgVersion(pkg) {
  try {
    return JSON.parse(readFileSync(path.join(modulesDir, pkg, 'package.json'), 'utf8')).version;
  } catch (_e) {
    return '?';
  }
}

function run() {
  if (!existsSync(modulesDir)) {
    throw new Error('node_modules/@vanduo-oss not found. Run `pnpm install` first.');
  }

  const seenVersions = {};
  for (const { pkg, from, to } of COPIES) {
    const src = path.join(modulesDir, pkg, 'dist', from);
    const dst = path.join(docsRoot, to);
    if (!existsSync(src)) {
      throw new Error(`Missing ${pkg} dist asset: ${src}. Is @vanduo-oss/${pkg} installed?`);
    }
    mkdirSync(path.dirname(dst), { recursive: true });
    cpSync(src, dst, { force: true });
    seenVersions[pkg] = pkgVersion(pkg);
  }

  Object.entries(seenVersions).forEach(([pkg, version]) => {
    console.log(`[sync-ecosystem-assets] Vendored @vanduo-oss/${pkg}@${version}`);
  });
  console.log(`[sync-ecosystem-assets] Synced ${COPIES.length} ecosystem assets into docs.`);
}

try {
  run();
} catch (error) {
  console.error('[sync-ecosystem-assets] ' + error.message);
  process.exit(1);
}
