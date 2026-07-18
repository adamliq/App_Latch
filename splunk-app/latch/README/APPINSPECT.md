# AppInspect

## How to run it locally

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
