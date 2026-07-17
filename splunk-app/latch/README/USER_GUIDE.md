# User guide

Latch has seven pages, reached from the tab bar at the top of the app.

## Home

An overview of the app with quick-link cards to each reference area and a
record count for each.

## Taxonomy Explorer

The LATCH TAX07 taxonomy as a browsable, searchable tree (over 1,200
records: domains, groups, and current instance records).

- **Search** filters the tree to records (and their ancestors) whose code,
  term, definition, or other fields match the text you type.
- **Domain** filters to a single top-level domain.
- Selecting a record shows its full detail — breadcrumb path, definition,
  metadata, and any additional record-specific fields — in the panel on the
  right.
- The tree is keyboard-operable: use Tab to reach it, Enter/Space to expand
  a node or select a record, and arrow keys to move between visible items.

## Source Catalogue

A table of SIEM data sources (firewalls, EDR, identity providers, etc.) with
their expected events, use cases, priority, and coverage/assurance state.
Search and filter by category or priority; select **View details** on a row
to see the full record, including its required event types.

## Logging Patterns

A reference table of approved collection topologies (how a class of source
is collected end-to-end): category, transport, destination, and what is
required on the source platform and network path before onboarding.

## Health Checks

The catalogue of health-check test definitions used to validate that an
onboarded source is collecting correctly (pass criteria, failure action,
automation, frequency, thresholds). This is derived directly from the
taxonomy's health-test definitions, so it always matches the Taxonomy
Explorer.

## Glossary

Definitions for the framework terms used across the other pages (logging
pattern, collection topology, cyber value density, assessment gates, and so
on), searchable and filterable by category.

## About

App version, Splunk version/build, a note on where the data comes from, and
the list of features from the original standalone tool that are not yet
ported into this app (see `RELEASE_NOTES.md`).

## Tips

- Every page's URL (the part after `#` in the browser address bar) is a
  direct deep link to that page — bookmarking or sharing it will take you
  straight back.
- The browser back/forward buttons move between pages you've visited, the
  same as any other web app.
