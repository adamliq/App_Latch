# Configuration guide

## Initial setup

There is none. Latch is a read-only reference tool over data that ships
inside the app package — there is no credential to add, endpoint to point at,
proxy to configure, TLS setting to review, index to choose, or input to
create. `default/app.conf` sets `is_configured = true` because the app is
fully usable the moment it is installed.

## Required capabilities per page

Every page in the app (Home, Taxonomy Explorer, Source Catalogue, Logging
Patterns, Health Checks, Glossary, About) requires only the ability to view
the app itself. No page performs a privileged action, so no additional
Splunk capability is required beyond standard app visibility.

## If you were expecting a setup page

Earlier drafts of this document template assumed the app would call an
external SIEM or ticketing API and need credential/endpoint/proxy/TLS
configuration and a "Test Connection" workflow. That does not apply here:
this release of Latch has no external integration. If a future release adds
one (see `RELEASE_NOTES.md` for the roadmap), this file will be updated to
describe its setup page.
