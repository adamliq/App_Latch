#!/usr/bin/env node
/*
 * Packages splunk-app/latch into a Splunkbase-ready release archive:
 * release/latch-<version>.spl, containing a single top-level `latch/`
 * directory, plus a .sha256 checksum file and a build report.
 *
 * .spl is Splunk's own package format (used by the `splunk package` CLI
 * command and required for Splunkbase uploads) — it is byte-for-byte a
 * gzip-compressed tar archive, just with a Splunk-specific extension.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const tar = require('tar');

const ROOT = path.join(__dirname, '..');
const APP_DIR = path.join(ROOT, 'splunk-app', 'latch');
const RELEASE_DIR = path.join(ROOT, 'release');

// Never include these in the release package, even if they somehow appear
// under splunk-app/latch (defence in depth on top of source control hygiene).
const EXCLUDE_PATTERNS = [
    /(^|\/)\.git($|\/)/,
    /(^|\/)\.DS_Store$/,
    /(^|\/)node_modules($|\/)/,
    /(^|\/)__pycache__($|\/)/,
    /\.pyc$/,
    /(^|\/)\.pytest_cache($|\/)/,
    /\.map$/,
];

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function listAllFiles(dir, base = dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    return entries.flatMap((entry) => {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(base, fullPath);
        if (entry.isDirectory()) {
            return listAllFiles(fullPath, base);
        }
        return [relativePath];
    });
}

function assertBuildOutputExists() {
    const buildDir = path.join(APP_DIR, 'appserver', 'static', 'build');
    const templateFile = path.join(APP_DIR, 'appserver', 'templates', 'latch_app.html');
    if (!fs.existsSync(buildDir) || fs.readdirSync(buildDir).length === 0) {
        throw new Error('No production build output found. Run "npm run build" first.');
    }
    if (!fs.existsSync(templateFile)) {
        throw new Error('Generated view template is missing. Run "npm run build" first.');
    }
}

async function main() {
    assertBuildOutputExists();

    const manifest = readJson(path.join(APP_DIR, 'app.manifest'));
    const version = manifest.info.id.version;
    const packageName = `latch-${version}`;
    const archivePath = path.join(RELEASE_DIR, `${packageName}.spl`);

    fs.mkdirSync(RELEASE_DIR, { recursive: true });
    fs.rmSync(archivePath, { force: true });

    const allFiles = listAllFiles(APP_DIR).filter(
        (relativePath) => !EXCLUDE_PATTERNS.some((pattern) => pattern.test(relativePath))
    );

    // tar's `file:` entries are relative to `cwd`, and prefixing each with
    // `latch/` gives the archive its single required top-level directory.
    await tar.create(
        {
            gzip: true,
            file: archivePath,
            cwd: path.join(ROOT, 'splunk-app'),
            portable: true,
            noMtime: true,
        },
        allFiles.map((relativePath) => path.join('latch', relativePath))
    );

    const archiveBuffer = fs.readFileSync(archivePath);
    const checksum = crypto.createHash('sha256').update(archiveBuffer).digest('hex');
    fs.writeFileSync(`${archivePath}.sha256`, `${checksum}  ${packageName}.spl\n`);

    const report = {
        package: `${packageName}.spl`,
        version,
        fileCount: allFiles.length,
        sizeBytes: archiveBuffer.length,
        sha256: checksum,
        builtAt: new Date().toISOString(),
    };
    fs.writeFileSync(
        path.join(RELEASE_DIR, `${packageName}.build-report.json`),
        `${JSON.stringify(report, null, 2)}\n`
    );

    console.log(`Packaged ${allFiles.length} files into ${path.relative(ROOT, archivePath)}`);
    console.log(`SHA-256: ${checksum}`);
}

main().catch((error) => {
    console.error('Packaging failed:', error.message);
    process.exit(1);
});
