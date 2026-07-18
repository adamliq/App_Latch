# AppInspect and SLIM validation

## AppInspect: how to run it locally

`splunk-appinspect`'s own dependency pin (`painter`) fails to build against
current `setuptools` unless an older `setuptools` is installed first. A
throwaway virtualenv avoids touching your main Python environment:

```bash
python3 -m venv /tmp/appinspect-venv
/tmp/appinspect-venv/bin/pip install "setuptools<81" wheel
/tmp/appinspect-venv/bin/pip install splunk-appinspect

npm run build && npm run package   # produces release/latch-<version>.spl
/tmp/appinspect-venv/bin/splunk-appinspect inspect release/latch-1.0.0.spl --mode precert
```

`--mode precert` runs the same, stricter rule set used for Splunkbase
pre-certification (a superset of `--mode test`).

## Last recorded result (splunk-appinspect 4.2.1, `--mode precert`)

```
error:  0
failure:  0
future_failure:  0
skipped:  0
not_applicable: 149
warning:  3
success: 97
Total: 249
```

All 3 warnings are known, accepted, and explained below — none require a
code change:

| Check | Warning | Why it's accepted |
| --- | --- | --- |
| `check_for_updates_disabled` | `check_for_updates` is `True` in `[package]`, which AppInspect flags for *private, unlisted* apps | Intentional: `check_for_updates` must stay enabled for a real Splunkbase-listed app (this is also an explicit requirement of this project). The warning only fires because AppInspect assumes a private/unlisted test context; it does not apply once the app is actually listed on Splunkbase. |
| `check_for_splunk_js` | Detects the string `splunkjs/mvc` inside the compiled JS bundle | Comes from `@splunk/react-page`'s own internal layout-detection code (`document.querySelector('header[data-view="splunkjs/mvc/headerview"]')`), not from any code in this app. AppInspect's own message says: *"Please ignore this warning as it has no impact to your Splunk app."* |
| `check_for_splunk_js_header_and_footer_view` | Same match as above, flagged again under the "deprecated features" rule set | Same root cause and justification as above — it's Splunk's own official `@splunk/react-page` package doing feature detection against older Splunk Web layouts, not this app using the deprecated `HeaderView`/`FooterView` API. |

Before a real Splunkbase submission, re-run this check against whatever the
current `splunk-appinspect` release is (rules and trusted-library lists
change over time), and re-verify these three warnings are still the only
findings and still apply for the same reasons.

## Two real findings this caught and fixed during development

AppInspect is not just a formality — it caught two genuine packaging bugs
during development of this app, both now fixed:

1. **`is_configured = true` in `default/app.conf` was rejected.** AppInspect
   requires every shipped package to have `is_configured = false`
   (`check_that_setup_has_not_been_performed`), regardless of whether the
   app actually needs a setup step. This app has no `setup_view` and
   nothing to configure, so the fix has no user-visible effect — Splunk
   just never has a reason to flip it to `true`.
2. **Missing `[id]` stanza in `default/app.conf`.** Newer app.conf
   convention expects an explicit `[id] name = <app_id> / version = <semver>`
   stanza (in addition to the older `[package] id = <app_id>`). Both are
   now present and kept in sync by `scripts/build.js`'s version-consistency
   check.

## SLIM (Splunk Packaging Toolkit): an enforced release gate

`check_that_app_passes_slim_validation_for_cloud` is an AppInspect check
that, in Splunk's hosted AppInspect API service, shells out to the actual
Splunk Packaging Toolkit (`slim`) to validate `app.manifest` and package
structure. It is **not included** in the `splunk-appinspect` PyPI package
(confirmed: it does not appear in `splunk-appinspect list checks` for
4.2.1), so `--mode precert` above cannot exercise it.

Classic Splunk Cloud refuses to install an app SLIM rejects, so
`scripts/validate-release.js` runs `slim validate` against every packaged
release as a **hard, required gate** (`checkSlimValidation`), not a manual
or optional step — `npm run validate-release` fails if SLIM finds a real
problem, *and also* fails if SLIM isn't installed at all (an app that
can't be validated is treated the same as an app that fails validation).
The one narrow exception is documented below.

### Installing SLIM

```bash
python3 -m venv /tmp/spt-venv
/tmp/spt-venv/bin/pip install --upgrade pip
/tmp/spt-venv/bin/pip install splunk-packaging-toolkit
```

Then point the validator at it:

```bash
SLIM_BIN=/tmp/spt-venv/bin/slim npm run validate-release
```

(`SLIM_BIN` defaults to plain `slim`, i.e. whatever's on `PATH`.)

Note: if your shell exports both `NO_PROXY` and `no_proxy`, `slim`'s own
config loader treats them as a single case-insensitive ConfigParser section
and raises `DuplicateOptionError` — a quirk of `slim` itself, unrelated to
this app. `checkSlimValidation` already strips both (and their
`https_proxy`/`HTTPS_PROXY` counterparts) from the subprocess environment
it runs `slim` in, so this doesn't need to be worked around manually when
going through `npm run validate-release`; it only matters if you run `slim`
directly yourself, e.g. `env -u no_proxy -u NO_PROXY /tmp/spt-venv/bin/slim validate splunk-app/latch`.

### What this caught, and its own limitation

Running it against this app found and led to fixing one real defect, and
also exposed a limitation in the pip-published `slim` package itself:

1. **Real defect (fixed):** `app.manifest`'s `platformRequirements.splunk`
   originally declared both `"Enterprise": "^9.1"` and `"Cloud": "*"`. `slim`
   rejected `"Cloud"` outright — `Expected a Splunk edition name, not
   "Cloud"` — because `platformRequirements.splunk` only recognizes the
   pre-Cloud-era edition names (`Enterprise`, `Free`, `Light`). Splunk
   Cloud Platform compatibility is not something `app.manifest` declares at
   all; it's evidenced by passing AppInspect's Cloud-tagged checks (which
   this app does — see above) rather than by a manifest field. The invalid
   `"Cloud"` key has been removed.
2. **Tool limitation (not a defect in this app):** with the invalid key
   removed, `slim validate` still reports
   `Version requirement includes no supported version of Splunk Enterprise: ^9.1`.
   This pip package (`splunk-packaging-toolkit` 1.2.8) ships a static,
   stale `splunk-releases.json` whose newest known Enterprise release is
   **8.0.0** — it has no knowledge that 9.x exists, regardless of what
   range syntax is used. This was confirmed by re-running validation
   against an identical manifest with the range temporarily lowered to
   `"^8.0"`, which passed both `slim validate` and `slim package` cleanly —
   proving the `^`-range syntax itself, and every other part of the
   package, is valid; only this package's bundled version list is out of
   date. Splunk's hosted AppInspect API service (used for real Splunkbase
   submissions) uses a current, continuously updated release list and
   would not hit this.

Before a real Splunkbase submission, either use the hosted AppInspect API
(which runs the real, current `check_that_app_passes_slim_validation_for_cloud`)
or install a current `splunk-packaging-toolkit` release with an up-to-date
`splunk-releases.json` to re-verify the `^9.1` requirement directly.

`checkSlimValidation` doesn't hardcode `^9.1` as an accepted string — it
reads `platformRequirements.splunk.Enterprise` from `app.manifest` at run
time and only tolerates a SLIM error that matches *that* declared range
exactly. If the range is legitimately changed in the future, the accepted
message updates itself automatically; any error that doesn't match it
still fails the release, which is the correct fail-closed default if a
future `splunk-packaging-toolkit` release ever reports something new and
genuine against this app.
