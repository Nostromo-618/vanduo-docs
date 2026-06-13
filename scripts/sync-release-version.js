#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const manifestPath = path.join(rootDir, 'release-version.json');
const checkOnly = process.argv.includes('--check');

function readManifest() {
  const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const framework = String(raw.framework || '').trim();
  const docsRevision = Number(raw.docsRevision);

  if (!/^\d+\.\d+\.\d+$/.test(framework)) {
    throw new Error('release-version.json: framework must be semver like 1.4.6');
  }
  if (!Number.isInteger(docsRevision) || docsRevision < 1) {
    throw new Error('release-version.json: docsRevision must be a positive integer');
  }

  const frameworkCompact = framework.replace(/\./g, '');
  return {
    framework,
    docsRevision,
    docsContentVersion: `${framework}-docs-${docsRevision}`,
    sectionCacheKey: `vanduo-sections-v${frameworkCompact}-docs-${docsRevision}`,
    sessionCacheKey: `vd:sectionCache:v${frameworkCompact}-docs${docsRevision}`,
    appCssQuery: `${framework}-docs-${docsRevision}`,
    docsScriptSuffix: `-docs-${docsRevision}`,
  };
}

function stampFile(relPath, transform) {
  const absolute = path.join(rootDir, relPath);
  const before = fs.readFileSync(absolute, 'utf8');
  const after = transform(before, manifest);

  if (before === after) {
    return { relPath, changed: false };
  }

  if (!checkOnly) {
    fs.writeFileSync(absolute, after, 'utf8');
  }

  return { relPath, changed: true };
}
const manifest = readManifest();
const results = [];

results.push(stampFile('js/modules/state.js', (content) => {
  return content.replace(
    /export const DOCS_CONTENT_VERSION = '[^']+';/,
    `export const DOCS_CONTENT_VERSION = '${manifest.docsContentVersion}';`,
  );
}));

results.push(stampFile('sw.js', (content) => {
  return content.replace(
    /const SECTION_CACHE = '[^']+';/,
    `const SECTION_CACHE = '${manifest.sectionCacheKey}';`,
  );
}));

results.push(stampFile('js/section-cache.js', (content) => {
  return content.replace(
    /var CACHE_KEY = '[^']+';/,
    `var CACHE_KEY = '${manifest.sessionCacheKey}';`,
  );
}));

results.push(stampFile('index.html', (content) => {
  let next = content;

  next = next.replace(
    /var frameworkVersion = '[^']+';/,
    `var frameworkVersion = '${manifest.framework}';`,
  );

  next = next.replace(
    /var assetQuery = mode === 'local'\s*\n\s*\? '\?dev=' \+ Date\.now\(\)\s*\n\s*: '';/,
    `var assetQuery = mode === 'local'\n                ? '?dev=' + Date.now()\n                : '?v=' + frameworkVersion;`,
  );

  next = next.replace(
    /href="css\/app\.css\?v=[^"]+"/,
    `href="css/app.css?v=${manifest.appCssQuery}"`,
  );

  next = next.replace(
    /var docsScriptVersion = '\?v=' \+ \(assetState\.expectedVersion \|\| 'dev'\) \+ '-docs-\d+';/,
    `var docsScriptVersion = '?v=' + (assetState.expectedVersion || 'dev') + '${manifest.docsScriptSuffix}';`,
  );

  next = next.replace(
    /"softwareVersion": "[^"]+",/,
    `"softwareVersion": "${manifest.framework}",`,
  );

  next = next.replace(
    /Vanduo Framework v[0-9]+\.[0-9]+\.[0-9]+/g,
    `Vanduo Framework v${manifest.framework}`,
  );

  return next;
}));

const mismatches = results.filter((result) => result.changed);

if (checkOnly) {
  if (mismatches.length > 0) {
    console.error('Release version drift detected. Run: pnpm run sync:release-version');
    mismatches.forEach((result) => {
      console.error(' -', result.relPath);
    });
    process.exit(1);
  }

  console.log(`Release version check passed (${manifest.docsContentVersion})`);
  process.exit(0);
}

if (mismatches.length === 0) {
  console.log(`Release version already synced (${manifest.docsContentVersion})`);
} else {
  mismatches.forEach((result) => {
    console.log(`[sync-release-version] Updated ${result.relPath}`);
  });
  console.log(`[sync-release-version] Synced to ${manifest.docsContentVersion}`);
}
