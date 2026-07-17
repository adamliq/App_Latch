# Latch frontend (Splunk UI Toolkit)

React + TypeScript frontend for the Latch Splunk app, built on the Splunk UI
Toolkit (SUIT) component library (`@splunk/react-ui`) and packaged with
`@splunk/webpack-configs` / `@splunk/babel-preset`, the same tooling used by
Splunk's own SUIT example apps.

## Requirements

| Tool | Version used |
| --- | --- |
| Node.js | 22.x (any Node ≥ 18 supported by the toolchain works) |
| npm | 10.x (workspaces) |
| React | 18.3.1 |
| `@splunk/react-ui` | 5.12.0 |
| `@splunk/themes` | 1.9.0 |
| `@splunk/react-page` | 8.3.1 |
| TypeScript | 5.9.3 (type-checking only; Babel does the actual JS transform) |

These are pinned exactly in `package.json` and locked in the workspace-root
`package-lock.json`.

## Local development

From the repository root (this package is an npm workspace member):

```bash
npm install
npm run start --workspace packages/latch   # webpack --watch, development build
npm run lint --workspace packages/latch
npm run typecheck --workspace packages/latch
npm run test --workspace packages/latch
```

There is no dev server / hot-reload flow for viewing the app inside Splunk
Web itself — the app only runs correctly inside a real Splunk Web page
(it needs `__splunkd_partials__` and Splunk Web's own bootstrap scripts, see
`mako/latch_app.html.template`). The practical development loop is:
edit → `npm run build` (from the repo root) → copy/symlink
`splunk-app/latch` into `$SPLUNK_HOME/etc/apps/latch` → restart Splunk Web →
reload the page.

## Project structure

```
src/
  index.tsx               Entry point: mounts <App/> via @splunk/react-page
  App.tsx                 Theme, router, top nav, error boundary
  routes.tsx              Single source of truth for pages <-> nav tabs
  appInfo.ts              Version/vendor constants shown in the UI
  pages/                  One component per route (lazy-loaded)
  components/             Shared presentational components
  components/taxonomy/    Taxonomy tree + detail panel
  services/                Typed accessors over the bundled reference data
  types/                   TypeScript interfaces for each data shape
  data/generated/          JSON extracted from the original HTML tool (see scripts/extract-data.js)
  test/                    Jest setup
mako/latch_app.html.template   Source template for the generated Splunk view page
```

## Data flow

All reference data (`data/generated/*.json`) was extracted once from the
original static HTML tool (`scripts/extract-data.js` at the repo root) and is
committed as plain JSON. Nothing is fetched at runtime; `services/*.ts`
import the JSON directly and expose typed, derived views (tree building,
filtering, health-check derivation) over it.

## Build and package

Run from the repository root, not from this directory, since it orchestrates
lint/typecheck/test/build/package across the whole workspace:

```bash
npm run build             # -> splunk-app/latch/appserver/static/build + templates
npm run package            # -> release/latch-<version>.tar.gz + .sha256
npm run validate-release
```

`npm run build` fails the whole build if lint, type-checking, tests, or the
production webpack build fail, or if the compiled output contains a dev-server
URL, hot-reload code, or a source map.

## Testing

Tests use Jest + React Testing Library and test user-observable behaviour
(rendered text, accessible roles/names, keyboard and focus behaviour) rather
than component internals. Run with:

```bash
npm run test --workspace packages/latch
```
