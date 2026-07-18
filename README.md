# Latch

A Splunk UI Toolkit (SUIT) app that turns the LATCH SIEM onboarding taxonomy —
originally a single static HTML reference tool — into an installable Splunk
app: a taxonomy explorer, source catalogue, logging pattern reference, and
health-check catalogue, running natively inside Splunk Web.

The app is entirely self-contained. All reference data ships as static
assets inside the app; there are no credentials, indexes, modular inputs, or
outbound network calls.

## Repository layout

```
package.json                 Workspace root (build/test/package orchestration)
scripts/                      clean / build / package / validate-release / data-extraction scripts
packages/latch/               SUIT frontend source (React + TypeScript, built with webpack)
splunk-app/latch/             The Splunk app itself — this directory is what gets packaged
SplunkTaxonomy-*.html         Original static HTML tool this app is derived from (kept for reference)
```

See `packages/latch/README.md` for frontend development, and
`splunk-app/latch/README/` for installation, configuration, user, and
security documentation for the packaged app.

## Quick start

```bash
npm install          # installs the whole workspace (root + packages/latch)
npm run build         # lint, typecheck, test, production build, package the app assets
npm run package        # produce splunk-app/latch → release/latch-<version>.spl
npm run validate-release
```

Install the resulting `release/latch-<version>.spl` into Splunk Enterprise
or Splunk Cloud Platform as you would any other app. See
`splunk-app/latch/README/INSTALL.md` for details.

## What was ported from the original tool, and what wasn't (yet)

This release ports the taxonomy tree browser, source catalogue, logging
pattern reference, health-check catalogue, and glossary as genuine SUIT/React
pages. The original tool's interactive viability-assessment calculator,
logging-pattern advisor wizard, assurance rollup dashboard, CMEI scoring
assessments, and prompt library are **not yet ported** — see
`splunk-app/latch/README/RELEASE_NOTES.md` for the full list and rationale.
