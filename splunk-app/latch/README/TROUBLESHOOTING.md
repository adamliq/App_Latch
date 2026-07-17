# Troubleshooting guide

## The app page is blank after install or upgrade

1. Hard-refresh the browser (Ctrl/Cmd+Shift+R) to bypass any cached view
   template.
2. Confirm `appserver/static/build/` contains a `latch_app.<hash>.js` file
   and `appserver/templates/latch_app.html` references that exact filename
   — a partial or manually-assembled copy of the app can end up with these
   out of sync. Re-run `npm run build && npm run package` and reinstall if so.
3. Check the browser console for a 404 on the bundle script — this usually
   means the app was extracted with the wrong top-level directory name (it
   must be `latch`, matching `default/app.conf`'s `[package] id`).

## Missing JavaScript or CSS bundle

The app has no separate CSS bundle (styling is handled by `styled-components`
inside the JS bundle), so a missing-CSS symptom usually means the JS bundle
itself failed to load — see the blank-page steps above.

## Blank page only after an upgrade, but fresh install works

Almost always a browser cache issue: the *view* (`data/ui/views/latch_app.xml`
→ `appserver/templates/latch_app.html`) can be cached more aggressively by
some browsers than the content-hashed JS it references. Hard-refresh, or ask
affected users to clear their Splunk Web browser cache once after an
upgrade.

## Expired Splunk session

If your Splunk session expires while the app is open, Splunk Web's own
session-handling will redirect you to the login page on your next action
(the same as any other app) — the app does not implement its own session
logic to interfere with this.

## REST endpoint failures / "no data received" / throttling / TLS / proxy issues

Not applicable to this release: the app has no REST handler, modular input,
or outbound network call, so none of these failure modes can occur. If you
are seeing one, you are likely running a different app or a modified build.

## Frontend permission errors

Every page requires only the ability to view the app. If a user cannot see
a page's content, check that they can see the app at all
(Settings → Access controls → the user's role has this app in its list, or
the app isn't hidden for their role).

## Relevant SPL troubleshooting searches

The app writes nothing to any index, so there is no SPL search that reflects
its internal state. To confirm Splunk Web served the app's assets without
error, check `splunkd.log`/`web_service.log` for HTTP errors on requests to
`/static/app/latch/build/*` or `/app/latch/latch_app` around the time of the
report.
