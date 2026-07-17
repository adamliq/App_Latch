# Security guide

## Summary

Latch is a static, read-only reference UI. It has no backend component (no
REST handler, modular input, custom search command, or KV Store collection),
stores no credentials, makes no outbound network calls, and does not write
to any Splunk index. This significantly shrinks its attack surface relative
to a typical integration app.

## Data flow

1. Splunk Web serves the app's compiled JavaScript bundle
   (`appserver/static/build/latch_app.<hash>.js`) to the browser, the same
   way it serves any other app's static assets.
2. The bundle runs entirely client-side. All taxonomy, source-catalogue,
   logging-pattern, and health-check data is embedded in the bundle at build
   time (see `packages/latch/src/data/generated/*.json`) — nothing is
   fetched over the network at runtime.
3. The only Splunk-provided data the app reads is the current user's
   session/theme context, exposed by Splunk Web to every app
   (`__splunkd_partials__`, used by `@splunk/react-page`) and
   `window.$C` (used by `@splunk/splunk-utils/config` to show the signed-in
   username and Splunk version on the Home/About pages). Neither is logged,
   persisted, or sent anywhere.

## Frontend security controls

- **No unsafe HTML rendering.** The app renders all dynamic content through
  React's normal JSX text interpolation, which HTML-escapes by default.
  There is no `dangerouslySetInnerHTML`, `innerHTML` assignment, or
  equivalent anywhere in the source.
- **No `eval`, `Function`, or dynamic script injection.**
- **No secrets in the browser.** The app has no secrets to store; nothing is
  written to `localStorage`, `sessionStorage`, or `IndexedDB`.
- **No dev-only code ships to production.** `scripts/build.js` scans the
  compiled output and fails the build if it finds a `localhost` dev-server
  URL, webpack hot-reload code, or a source map.
- **No CDN dependencies.** Every script the app loads comes from the app's
  own `appserver/static/build/` directory or from Splunk Web's own bundled
  assets (`/config`, `/static/js/i18n.js`, `/i18ncatalog`) — nothing is
  fetched from an external CDN.
- **Console logging.** Production code contains no `console.log` calls.
  `ErrorBoundary` intentionally swallows caught render errors rather than
  logging them, since the app has no backend to correlate a diagnostic ID
  against.

## Backend / packaging controls

- The app writes nothing to `default/` at runtime (there is no runtime
  write path at all).
- `update checking` is not disabled (`check_for_updates = true` in
  `default/app.conf`).
- The release package (`scripts/package.js`) excludes `.git`, `node_modules`,
  `__pycache__`, `.pyc` files, and source maps by pattern, in addition to
  never containing them in the first place because they're never generated
  under `splunk-app/latch/`.
- `metadata/default.meta` grants only `read` access to `[*]` and `write` to
  `admin`; the app defines no custom capability because no page performs a
  privileged action.

## Threat model (summary)

| Threat | Applicable? | Control |
| --- | --- | --- |
| Credential theft | No | App never handles credentials |
| Splunk session-token exposure | Mitigated | Session context is only read by the trusted `@splunk/react-page` / `@splunk/splunk-utils` libraries, never logged or rendered |
| XSS / unsafe HTML rendering | Mitigated | React's default escaping; no raw-HTML injection points |
| CSRF | N/A | App makes no state-changing requests |
| SSRF | N/A | App makes no outbound requests at all |
| Supply-chain compromise (npm) | Mitigated | Dependencies pinned to exact versions, lockfile committed, `npm ci` used in the build; see `THIRD_PARTY_COMPONENTS.md` |
| Excessive REST permissions | N/A | No REST handler exists |
| Denial of service via unbounded rendering | Mitigated | Large tables (390-row Health Checks) are paginated client-side |
| Clickjacking | Inherited from Splunk Web | The app renders inside Splunk Web's own page chrome and is subject to Splunk Web's own frame-ancestors policy |

## AppInspect

This package has been run through `splunk-appinspect` (`--mode precert`,
the Splunkbase pre-certification rule set): 0 errors, 0 failures, 3 accepted
warnings. See `APPINSPECT.md` for how to reproduce this and why each
warning is accepted.

## Vulnerability reporting

See `SUPPORT.md` for how to report a security issue.
