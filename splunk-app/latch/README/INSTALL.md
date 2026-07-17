# Installation guide

## Supported platforms

- Splunk Cloud Platform (Victoria experience and later)
- Splunk Enterprise 9.1 and later

> **Verify before submission:** the minimum supported Splunk version above
> should be re-checked against the current Splunk UI Toolkit / Splunk Cloud
> compatibility matrix at install time, since both evolve independently of
> this app's release cadence.

## Runtime dependencies

None beyond Splunk Web itself. The app ships pre-built, minified JavaScript
under `appserver/static/build/`; **Node.js and npm are build-time
dependencies only** and are not required, invoked, or bundled at runtime.
There is no modular input, custom search command, REST handler, or KV Store
collection — the app has no backend component at all.

## Required indexes, roles, and network access

- **Indexes:** none.
- **Roles/capabilities:** any role that can view the app (`ui.label` /
  app-visibility) can use every page. No custom capability is defined; see
  `metadata/default.meta`.
- **Outbound network access:** none. The app makes no HTTP requests outside
  of Splunk Web's own asset/session bootstrap.

## Splunk Cloud Platform installation

1. Package the app (see the repository root `README.md` / `packages/latch/README.md`
   for the build, or use a pre-built `latch-<version>.tar.gz` release archive).
2. In Splunk Cloud, go to **Apps → Manage Apps → Install app from file**, or
   submit through Splunkbase/the self-service app vetting workflow if this
   is a public listing.
3. Because the app requires no configuration (`is_configured = true`,
   no setup page), it is usable immediately after install — no post-install
   steps are required.

## Splunk Enterprise installation

1. Copy or extract `latch-<version>.tar.gz` so that its single top-level
   `latch/` directory lands at `$SPLUNK_HOME/etc/apps/latch`.
2. Restart Splunk Web (`splunk restart splunkweb`), or the whole instance.
3. The app appears in the app list as **Latch**.

## Search head cluster deployment

The app has no per-instance state, KV Store collections, or index-time
configuration, so it can be deployed like any other stateless app through
the deployer to all search head cluster members. No cluster-specific
configuration is required.

## Upgrade procedure

1. Replace the `latch/` app directory with the new version's contents (or
   let Splunk's app-install-from-file flow do this for you).
2. Restart Splunk Web.
3. **Clear your browser cache**, or hard-refresh the app's page, after an
   upgrade — the compiled JavaScript bundle filename changes on every
   release (content-hash based), so the new view template will reference the
   new file, but a browser that aggressively caches the *view XML/HTML
   template* itself (rather than the hashed JS, which is safe to cache
   indefinitely) may need a forced reload the first time.

## Rollback procedure

Reinstall the previous version's `latch-<version>.tar.gz` the same way as a
fresh install (Splunk treats a lower-version reinstall as a downgrade of the
app directory contents). There is no persisted configuration or data to
migrate back.

## Uninstallation

Remove the `latch` app directory (or use **Apps → Manage Apps → Delete**).
No indexes, lookups, KV Store collections, or credentials are left behind,
because none are created.
