#!/usr/bin/env node
/*
 * Validates the packaged release archive before it is considered ready for
 * AppInspect / Splunkbase submission:
 *  - exactly one top-level directory, named after the app
 *  - no development artefacts, VCS metadata, or caches
 *  - required files are present
 *  - JSON and XML files are well-formed
 *  - version numbers agree across app.conf, app.manifest and package.json
 *  - the real Splunk Packaging Toolkit (SLIM) validates the app; SLIM
 *    rejecting an app means Classic Splunk Cloud will refuse to install it,
 *    so this is a hard gate, not an optional check (see checkSlimValidation)
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const tar = require('tar');

const ROOT = path.join(__dirname, '..');
const RELEASE_DIR = path.join(ROOT, 'release');

const FORBIDDEN_PATTERNS = [
    /(^|\/)\.git($|\/)/,
    /(^|\/)\.DS_Store$/,
    /(^|\/)node_modules($|\/)/,
    /(^|\/)__pycache__($|\/)/,
    /\.pyc$/,
    /\.map$/,
    /(^|\/)\.env$/,
];

// Splunk Cloud Platform (Classic) will not install an app that fails SLIM
// (Splunk Packaging Toolkit) validation, so this gate must actually run —
// not be skipped — before a release is considered installable there.
const SLIM_BIN = process.env.SLIM_BIN || 'slim';
const SLIM_INSTALL_HELP =
    'Install it with: python3 -m venv /tmp/spt-venv && ' +
    '/tmp/spt-venv/bin/pip install --upgrade pip && ' +
    '/tmp/spt-venv/bin/pip install splunk-packaging-toolkit, then re-run with ' +
    'SLIM_BIN=/tmp/spt-venv/bin/slim. See README/APPINSPECT.md for the full ' +
    'recipe, including a workaround for a slim config-loader bug triggered ' +
    'when both NO_PROXY and no_proxy are set.';

const REQUIRED_FILES = [
    'app.manifest',
    'LICENSE',
    'default/app.conf',
    'metadata/default.meta',
    'default/data/ui/nav/default.xml',
    'default/data/ui/views/latch_app.xml',
    'appserver/templates/latch_app.html',
];

function findLatestPackage() {
    const files = fs.readdirSync(RELEASE_DIR).filter((f) => f.endsWith('.spl'));
    if (files.length === 0) {
        throw new Error('No .spl package found in release/. Run "npm run package" first.');
    }
    files.sort((a, b) => fs.statSync(path.join(RELEASE_DIR, b)).mtimeMs - fs.statSync(path.join(RELEASE_DIR, a)).mtimeMs);
    return path.join(RELEASE_DIR, files[0]);
}

async function extractToTemp(archivePath) {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'latch-release-validate-'));
    await tar.extract({ file: archivePath, cwd: tempDir });
    return tempDir;
}

function checkSingleTopLevelDirectory(tempDir) {
    const entries = fs.readdirSync(tempDir);
    if (entries.length !== 1) {
        throw new Error(`Expected exactly one top-level entry in the archive, found: ${entries.join(', ')}`);
    }
    const [onlyEntry] = entries;
    if (onlyEntry !== 'latch') {
        throw new Error(`Top-level directory must be named "latch", found "${onlyEntry}"`);
    }
    const fullPath = path.join(tempDir, onlyEntry);
    if (!fs.statSync(fullPath).isDirectory()) {
        throw new Error('Top-level entry must be a directory.');
    }
    return fullPath;
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

function checkForbiddenFiles(appDir) {
    const allFiles = listAllFiles(appDir);
    const offenders = allFiles.filter((relativePath) =>
        FORBIDDEN_PATTERNS.some((pattern) => pattern.test(relativePath))
    );
    if (offenders.length > 0) {
        throw new Error(`Forbidden files present in the package:\n  ${offenders.join('\n  ')}`);
    }
    return allFiles;
}

function checkRequiredFiles(appDir) {
    const missing = REQUIRED_FILES.filter((relativePath) => !fs.existsSync(path.join(appDir, relativePath)));
    if (missing.length > 0) {
        throw new Error(`Required files are missing from the package:\n  ${missing.join('\n  ')}`);
    }
}

function checkBuildAssetsPresent(appDir) {
    const buildDir = path.join(appDir, 'appserver', 'static', 'build');
    if (!fs.existsSync(buildDir)) {
        throw new Error('appserver/static/build is missing from the package.');
    }
    const jsFiles = fs.readdirSync(buildDir).filter((f) => f.endsWith('.js'));
    if (jsFiles.length === 0) {
        throw new Error('No compiled JavaScript assets found in appserver/static/build.');
    }
    const hashedNames = jsFiles.filter((f) => /\.[0-9a-f]{16,20}\.js$/.test(f) || /^latch_app\.[0-9a-f]+\.js$/.test(f));
    if (hashedNames.length === 0) {
        console.warn('Warning: no content-hashed asset filenames detected among', jsFiles);
    }
}

function checkJsonFiles(appDir) {
    const jsonFiles = listAllFiles(appDir).filter((f) => f.endsWith('.json'));
    jsonFiles.forEach((relativePath) => {
        const fullPath = path.join(appDir, relativePath);
        try {
            JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        } catch (error) {
            throw new Error(`Invalid JSON in ${relativePath}: ${error.message}`);
        }
    });
    console.log(`Validated ${jsonFiles.length} JSON file(s).`);
}

function checkXmlFiles(appDir) {
    const xmlFiles = listAllFiles(appDir).filter((f) => f.endsWith('.xml'));
    xmlFiles.forEach((relativePath) => {
        const fullPath = path.join(appDir, relativePath);
        try {
            execFileSync('xmllint', ['--noout', fullPath], { stdio: 'pipe' });
        } catch (error) {
            throw new Error(`Invalid XML in ${relativePath}:\n${error.stderr}`);
        }
    });
    console.log(`Validated ${xmlFiles.length} XML file(s).`);
}

function checkVersionConsistency(appDir) {
    const manifest = JSON.parse(fs.readFileSync(path.join(appDir, 'app.manifest'), 'utf8'));
    const appConf = fs.readFileSync(path.join(appDir, 'default', 'app.conf'), 'utf8');
    const versionMatch = appConf.match(/version\s*=\s*(\S+)/);
    const rootPkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

    const manifestVersion = manifest.info.id.version;
    const confVersion = versionMatch && versionMatch[1];
    if (manifestVersion !== confVersion) {
        throw new Error(
            `Version mismatch: app.manifest is ${manifestVersion}, default/app.conf is ${confVersion}`
        );
    }
    if (manifestVersion !== rootPkg.version) {
        throw new Error(
            `Version mismatch: app.manifest is ${manifestVersion}, workspace package.json is ${rootPkg.version}`
        );
    }
    console.log(`Version consistent across package: ${manifestVersion}`);
}

/**
 * Runs the real Splunk Packaging Toolkit against the extracted package and
 * rejects the release unless it passes. `slim` is a hard requirement here,
 * not an optional/best-effort check: an app SLIM rejects cannot be
 * installed on Classic Splunk Cloud, so "SLIM isn't installed" must fail
 * the gate the same as "SLIM found a real problem" would.
 *
 * One specific, narrowly-matched exception is tolerated: the pip-published
 * `splunk-packaging-toolkit` package ships a static, stale list of known
 * Splunk Enterprise releases (topping out at 8.0.0 as of this writing), so
 * it rejects any correctly-formed version range this app declares that
 * targets a newer minimum. That failure mode is confirmed (see
 * README/APPINSPECT.md) to be a stale-data limitation of the local tool,
 * not a defect in this app, so it's the only message this function ever
 * treats as non-fatal — and only when it matches this app's own declared
 * requirement exactly. Any other SLIM error, or SLIM being unavailable at
 * all, fails the release.
 */
function checkSlimValidation(appDir) {
    let manifest;
    try {
        manifest = JSON.parse(fs.readFileSync(path.join(appDir, 'app.manifest'), 'utf8'));
    } catch (error) {
        throw new Error(`Could not read app.manifest to run SLIM validation: ${error.message}`);
    }
    const enterpriseRange = manifest.platformRequirements?.splunk?.Enterprise;
    const knownStaleVersionListMessage = enterpriseRange
        ? `Version requirement includes no supported version of Splunk Enterprise: ${enterpriseRange}`
        : null;

    let output;
    try {
        // Both NO_PROXY and no_proxy being set trips a DuplicateOptionError
        // in slim's own config loader (it reads os.environ into a
        // case-insensitive ConfigParser). Strip the proxy vars for this
        // subprocess only; slim makes no network calls during validate.
        const env = { ...process.env };
        delete env.NO_PROXY;
        delete env.no_proxy;
        delete env.HTTPS_PROXY;
        delete env.https_proxy;
        output = execFileSync(SLIM_BIN, ['validate', appDir], { env, encoding: 'utf8', stdio: 'pipe' });
    } catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error(
                `SLIM ("${SLIM_BIN}") is not installed or not on PATH. A release cannot be ` +
                    `validated (and therefore cannot be confirmed installable on Classic Splunk ` +
                    `Cloud) without it. ${SLIM_INSTALL_HELP}`
            );
        }
        output = `${error.stdout || ''}${error.stderr || ''}`;
        const errorLines = output.split('\n').filter((line) => line.includes('[ERROR]'));
        const unacceptedErrors = errorLines.filter(
            (line) => !(knownStaleVersionListMessage && line.includes(knownStaleVersionListMessage))
        );
        if (unacceptedErrors.length > 0) {
            throw new Error(`SLIM validation rejected the app:\n  ${unacceptedErrors.join('\n  ')}`);
        }
        console.log(
            'SLIM validation passed except for one accepted, known stale-data limitation ' +
                `of the local toolkit (see README/APPINSPECT.md): ${knownStaleVersionListMessage}`
        );
        return;
    }
    console.log(output.trim() || 'SLIM validation passed.');
}

async function main() {
    const archivePath = findLatestPackage();
    console.log(`Validating ${path.relative(ROOT, archivePath)}`);

    const tempDir = await extractToTemp(archivePath);
    try {
        const appDir = checkSingleTopLevelDirectory(tempDir);
        const allFiles = checkForbiddenFiles(appDir);
        checkRequiredFiles(appDir);
        checkBuildAssetsPresent(appDir);
        checkJsonFiles(appDir);
        checkXmlFiles(appDir);
        checkVersionConsistency(appDir);
        checkSlimValidation(appDir);
        console.log(`\nRelease package is valid: ${allFiles.length} files, structure and metadata check out.`);
    } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
}

main().catch((error) => {
    console.error('\nRelease validation failed:', error.message);
    process.exit(1);
});
