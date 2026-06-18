#!/usr/bin/env node

const { cpSync, existsSync, mkdirSync, readFileSync, readdirSync } = require('fs');
const path = require('path');

const docsRoot = path.resolve(__dirname, '..');
const docsDistDir = path.join(docsRoot, 'dist');
const configuredFrameworkRoot = process.env.VANDUO_FRAMEWORK_DIR
  ? path.resolve(process.env.VANDUO_FRAMEWORK_DIR)
  : null;

function resolveFrameworkRoot() {
  if (configuredFrameworkRoot) {
    return configuredFrameworkRoot;
  }

  const candidateRoots = [
    path.resolve(docsRoot, '../framework'),
    path.resolve(docsRoot, '../vanduo-framework')
  ];

  return candidateRoots.find((candidateRoot) => existsSync(path.join(candidateRoot, 'dist'))) || candidateRoots[0];
}

const frameworkRoot = resolveFrameworkRoot();
const frameworkDistDir = path.join(frameworkRoot, 'dist');

function readBuildInfo(distDir) {
  const buildInfoPath = path.join(distDir, 'build-info.json');

  if (!existsSync(buildInfoPath)) {
    return null;
  }

  try {
    return JSON.parse(readFileSync(buildInfoPath, 'utf8'));
  } catch (_error) {
    return null;
  }
}

function readExpectedFrameworkVersion() {
  const manifestPath = path.join(docsRoot, 'release-version.json');

  if (!existsSync(manifestPath)) {
    return null;
  }

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    return typeof manifest.framework === 'string' ? manifest.framework : null;
  } catch (_error) {
    return null;
  }
}

function assertFrameworkVersionMatchesDocsPin(buildInfo) {
  const expectedVersion = readExpectedFrameworkVersion();

  if (!expectedVersion || !buildInfo || !buildInfo.version) {
    return;
  }

  if (buildInfo.version === expectedVersion) {
    return;
  }

  throw new Error(
    'Docs release-version.json pins framework v'
    + expectedVersion
    + ' but sibling framework dist is v'
    + buildInfo.version
    + '. Update ../framework (git pull && pnpm run build) or adjust release-version.json.'
  );
}

function logBuildInfo(prefix, buildInfo) {
  if (!buildInfo) {
    console.log(prefix + ': build-info.json not available');
    return;
  }

  console.log(
    prefix + ': v' + buildInfo.version + ' (' + buildInfo.commit + ', ' + buildInfo.mode + ')'
  );
}

function hasVendoredDocsAssets() {
  return existsSync(path.join(docsDistDir, 'vanduo.min.css'))
    && existsSync(path.join(docsDistDir, 'vanduo.min.js'));
}

function syncFrameworkAssets() {
  mkdirSync(docsDistDir, { recursive: true });

  if (!existsSync(frameworkDistDir)) {
    if (hasVendoredDocsAssets()) {
      console.warn(
        '[sync-framework-assets] Framework dist not found at ' + frameworkDistDir + '. Using vendored docs dist.'
      );
      logBuildInfo('[sync-framework-assets] Vendored docs dist', readBuildInfo(docsDistDir));
      return;
    }

    throw new Error(
      'Framework dist not found at ' + frameworkDistDir + ' and vendored docs assets are unavailable.'
    );
  }

  assertFrameworkVersionMatchesDocsPin(readBuildInfo(frameworkDistDir));

  // Overlay framework artifacts so docs-specific files under dist/ remain intact.
  const frameworkEntries = readdirSync(frameworkDistDir);
  frameworkEntries.forEach((entry) => {
    const sourcePath = path.join(frameworkDistDir, entry);
    const targetPath = path.join(docsDistDir, entry);
    cpSync(sourcePath, targetPath, { recursive: true, force: true });
  });

  // Vendor the framework icon entry stylesheets (icons.css / icons-all.css) so
  // the docs can opt into all Phosphor weights for its weight showcase during
  // local preview. The default bundle ships regular+fill only; icons-all.css
  // resolves its @imports against the (full) dist/icons/ tree synced above.
  const frameworkIconsCssDir = path.join(frameworkRoot, 'css', 'icons');
  const docsIconsCssDir = path.join(docsDistDir, 'css', 'icons');
  if (existsSync(frameworkIconsCssDir)) {
    mkdirSync(docsIconsCssDir, { recursive: true });
    cpSync(frameworkIconsCssDir, docsIconsCssDir, { recursive: true, force: true });
    console.log('[sync-framework-assets] Synced framework/css/icons/ → docs/dist/css/icons/');
  }

  // The framework's dist/icons ships only the bundled weights (regular+fill),
  // but the docs showcase previews every weight via icons-all.css. Vendor the
  // full top-level icons/ tree so all six weights resolve in local preview.
  const frameworkIconsDir = path.join(frameworkRoot, 'icons');
  const docsIconsDir = path.join(docsDistDir, 'icons');
  if (existsSync(frameworkIconsDir)) {
    cpSync(frameworkIconsDir, docsIconsDir, { recursive: true, force: true });
    console.log('[sync-framework-assets] Synced framework/icons/ (all weights) → docs/dist/icons/');
  }

  // NOTE: framework js/components and js/utils are intentionally NOT synced. The
  // docs use the framework bundle (window.Vanduo) for components; the only former
  // consumer was the hex demo, now sourced from the @vanduo-oss/hex-grid npm
  // package via scripts/sync-ecosystem-assets.js.

  console.log(
    '[sync-framework-assets] Synced ' + frameworkEntries.length + ' framework entries into ' + docsDistDir + '.'
  );
  logBuildInfo('[sync-framework-assets] Framework dist', readBuildInfo(frameworkDistDir));
  logBuildInfo('[sync-framework-assets] Docs dist', readBuildInfo(docsDistDir));
}

try {
  syncFrameworkAssets();
} catch (error) {
  console.error('[sync-framework-assets] ' + error.message);
  process.exit(1);
}
