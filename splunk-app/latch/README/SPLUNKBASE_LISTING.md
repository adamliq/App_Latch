# Splunkbase listing text

## Short description

Browse the LATCH SIEM onboarding taxonomy, source catalogue, logging
patterns and health checks — a searchable reference tool built with the
Splunk UI Toolkit.

## Full description

**Latch** turns the LATCH SIEM onboarding and assurance taxonomy into an
interactive, searchable Splunk app:

- **Taxonomy Explorer** — browse the full LATCH TAX07 taxonomy tree.
- **Source Catalogue** — look up expected events, use cases, and coverage
  state for common SIEM data sources.
- **Logging Patterns** — reference approved collection topologies before
  onboarding a new source.
- **Health Checks** — the health-check test catalogue used to validate an
  onboarded source.
- **Glossary** — definitions for the framework's terminology.

Built with the **Splunk UI Toolkit** (`@splunk/react-ui` 5.12.0) and React
18, running natively inside Splunk Web — no external services, no
credentials, and no configuration required.

- **Supported Splunk versions:** Splunk Cloud Platform; Splunk Enterprise
  9.1+ (verify against current compatibility documentation before
  installing).
- **Splunk Cloud compatible:** yes — no restricted operations are used.
- **Required external services:** none.
- **Required permissions:** none beyond standard app visibility.
- **Installation:** install like any other app; no setup steps.
- **Configuration:** none required.
- **Support:** developer-supported community project — see `SUPPORT.md`.
- **License:** Apache-2.0.
- **Privacy:** the app collects, stores, and transmits no data — see
  `PRIVACY.md`.
- **Accessibility:** targets WCAG 2.1 AA, built on Splunk UI Toolkit's
  accessible components — see `ACCESSIBILITY.md`.
- **Browser support:** current versions of Chrome, Firefox, Safari, and
  Edge (whatever Splunk Web itself supports for the target platform
  version).

See `RELEASE_NOTES.md` for what's included in this release and what's
planned next.
