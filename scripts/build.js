#!/usr/bin/env node
/*
 * Repeatable production build for the Latch Splunk app.
 *
 * Runs lint, type-checking and tests, then produces a production webpack
 * build, verifies the output is free of development artefacts, generates
 * the Mako view template with the correct (content-hashed) bundle filename,
 * and writes a build manifest recording the version and build metadata.
 *
 * Any failing step aborts the build with a non-zero exit code.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const FRONTEND_DIR = path.join(ROOT, 'packages', 'latch');
const SPLUNK_APP_DIR = path.join(ROOT, 'splunk-app', 'latch');
const BUILD_DIR = path.join(SPLUNK_APP_DIR, 'appserver', 'static', 'build');
const TEMPLATES_DIR = path.join(SPLUNK_APP_DIR, 'appserver', 'templates');

async function step(label, fn) {
    console.log(`\n=== ${label} ===`);
    return fn();
}

function run(command, args, cwd) {
    execFileSync(command, args, { cwd, stdio: 'inherit' });
}

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function assertVersionsMatch() {
    const rootPkg = readJson(path.join(ROOT, 'package.json'));
    const frontendPkg = readJson(path.join(FRONTEND_DIR, 'package.json'));
    const appInfoSource = fs.readFileSync(path.join(FRONTEND_DIR, 'src', 'appInfo.ts'), 'utf8');
    const appInfoVersionMatch = appInfoSource.match(/APP_VERSION = '([^']+)'/);
    const appConfSource = fs.readFileSync(path.join(SPLUNK_APP_DIR, 'default', 'app.conf'), 'utf8');
    const appConfVersionMatch = appConfSource.match(/version\s*=\s*(\S+)/);
    const manifest = readJson(path.join(SPLUNK_APP_DIR, 'app.manifest'));

    const versions = {
        'root package.json': rootPkg.version,
        'frontend package.json': frontendPkg.version,
        'src/appInfo.ts APP_VERSION': appInfoVersionMatch && appInfoVersionMatch[1],
        'default/app.conf [launcher] version': appConfVersionMatch && appConfVersionMatch[1],
        'app.manifest info.id.version': manifest.info.id.version,
    };

    const values = new Set(Object.values(versions));
    if (values.size > 1) {
        console.error('Version mismatch detected:');
        Object.entries(versions).forEach(([source, version]) => console.error(`  ${source}: ${version}`));
        throw new Error('All version references must match before building a release.');
    }
    return [...values][0];
}

function runWebpackBuild() {
    // Invoked with cwd = FRONTEND_DIR (not required from the workspace root)
    // so Babel's upward config search actually finds packages/latch/babel.config.js.
    const statsPath = path.join(os.tmpdir(), `latch-webpack-stats-${Date.now()}.json`);
    execFileSync(
        'npx',
        ['webpack', '--bail', '--json', statsPath],
        { cwd: FRONTEND_DIR, env: { ...process.env, NODE_ENV: 'production' }, stdio: 'inherit' }
    );
    const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
    fs.rmSync(statsPath, { force: true });
    if (stats.errors && stats.errors.length > 0) {
        throw new Error('webpack build reported errors');
    }
    return stats;
}

function verifyNoDevArtifacts() {
    const files = fs.readdirSync(BUILD_DIR);
    // Matches an actual dev-server URL (e.g. http://localhost:8080), not
    // incidental mentions of the word "localhost" in bundled reference data
    // (this app's taxonomy content legitimately discusses "localhost" as a
    // placeholder host value to flag in log sources).
    const forbiddenPatterns = [
        /https?:\/\/localhost(:\d+)?/i,
        /webpack-dev-server/i,
        /webpack\/hot/i,
        /hot-update\.(js|json)/i,
    ];
    let sourceMapCount = 0;

    files.forEach((file) => {
        const filePath = path.join(BUILD_DIR, file);
        if (file.endsWith('.map')) {
            sourceMapCount += 1;
            return;
        }
        if (!file.endsWith('.js')) return;
        const content = fs.readFileSync(filePath, 'utf8');
        forbiddenPatterns.forEach((pattern) => {
            if (pattern.test(content)) {
                throw new Error(`Forbidden pattern ${pattern} found in production asset ${file}`);
            }
        });
        if (/\/\/# sourceMappingURL=/.test(content)) {
            throw new Error(`Production asset ${file} references a source map, which must not ship.`);
        }
    });

    if (sourceMapCount > 0) {
        throw new Error(`${sourceMapCount} source map file(s) found in production build output.`);
    }
    console.log(`Verified ${files.length} build assets contain no development artefacts or source maps.`);
}

function findMainBundleFilename(stats) {
    const { assetsByChunkName } = stats;
    const entryAssets = assetsByChunkName.latch_app;
    const jsAsset = (Array.isArray(entryAssets) ? entryAssets : [entryAssets]).find((name) =>
        name.endsWith('.js')
    );
    if (!jsAsset) {
        throw new Error('Could not locate the latch_app entry bundle in webpack stats.');
    }
    return jsAsset;
}

function generateMakoTemplate(bundleFilename) {
    const templateSource = fs.readFileSync(
        path.join(FRONTEND_DIR, 'mako', 'latch_app.html.template'),
        'utf8'
    );
    const rendered = templateSource.replace('__BUNDLE_FILENAME__', bundleFilename);
    fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
    fs.writeFileSync(path.join(TEMPLATES_DIR, 'latch_app.html'), rendered);
    console.log(`Generated appserver/templates/latch_app.html referencing ${bundleFilename}`);
}

function writeBuildManifest(version, bundleFilename) {
    let gitCommit = 'unknown';
    try {
        gitCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT }).toString().trim();
    } catch {
        // Not fatal: the build may run outside a git checkout (e.g. from an
        // extracted source archive).
    }
    const manifest = {
        appVersion: version,
        bundleFilename,
        builtAt: new Date().toISOString(),
        gitCommit,
        nodeVersion: process.version,
    };
    fs.writeFileSync(
        path.join(BUILD_DIR, 'build-manifest.json'),
        `${JSON.stringify(manifest, null, 2)}\n`
    );
    console.log('Wrote build-manifest.json:', manifest);
}

async function main() {
    const version = assertVersionsMatch();

    await step('Install frontend dependencies (npm ci)', () => run('npm', ['ci'], ROOT));
    await step('Lint', () => run('npm', ['run', 'lint', '--workspace', 'packages/latch'], ROOT));
    await step('Type check', () => run('npm', ['run', 'typecheck', '--workspace', 'packages/latch'], ROOT));
    await step('Unit and component tests', () =>
        run('npm', ['run', 'test:ci', '--workspace', 'packages/latch'], ROOT)
    );

    const stats = await step('Production frontend build', runWebpackBuild);
    await step('Verify production build has no dev artefacts', verifyNoDevArtifacts);

    const bundleFilename = findMainBundleFilename(stats);
    await step('Generate Splunk view template', () => generateMakoTemplate(bundleFilename));
    await step('Write build manifest', () => writeBuildManifest(version, bundleFilename));

    console.log(`\nBuild complete for Latch v${version}.`);
}

main().catch((error) => {
    console.error('\nBuild failed:', error.message);
    process.exit(1);
});
