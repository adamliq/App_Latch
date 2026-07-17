# Release notes

## 1.0.0

Initial release. Ports the original standalone HTML tool
(`SplunkTaxonomy-LATCH-TAX07-ICD-CDC-INP-What-Activity-Target.html`) into a
Splunk UI Toolkit app.

**Included:**

- Taxonomy Explorer — full LATCH TAX07 taxonomy tree (1,200+ records),
  searchable and filterable by domain, with a detail panel.
- Source Catalogue — table of SIEM data sources with expected events, use
  cases, priority, coverage/assurance state, and required event types.
- Logging Patterns — reference table of approved collection topologies.
- Health Checks — health-check test catalogue, derived from the taxonomy's
  health-test definitions (390+ tests).
- Glossary — searchable framework concept definitions.
- Home and About pages.

**Not yet ported (known limitations):**

The original tool also included several interactive assessment/calculator
features that are not part of this release:

- The **viability-assessment calculator** (security value, technical
  readiness, operational assurance, and engagement/engineering complexity
  scoring engine).
- The **logging-pattern advisor wizard** (a guided questionnaire that
  recommends a pattern).
- The **assurance rollup dashboard** (per-component health/CIM/detection
  coverage rollups derived from the taxonomy's instance records).
- **CMEI scoring assessments** (ICD/CDC/INP/value assessment modals).
- The **prompt library**.

These were intentionally out of scope for this release to ship a correct,
well-tested, genuinely SUIT-native app rather than a partial or unverified
port of several thousand lines of bespoke scoring logic. They are candidates
for a future 1.1.0 release, most likely as additional SUIT pages reusing the
same `taxonomy-nodes.json` / `services/taxonomyService.ts` data layer this
release already established.

**Architecture notes for future contributors:**

- All reference data lives in `packages/latch/src/data/generated/*.json`,
  extracted once from the original HTML via `scripts/extract-data.js`. If
  the source-of-truth taxonomy changes, re-run that script rather than
  hand-editing the JSON.
- The Assurance and Health-Check derivations in the original tool both
  compute their tables by filtering/mapping over the same taxonomy node
  list, keyed by specific `parentCode` values (e.g.
  `CUR::TAX-04.07.01` for health checks). Look for similar
  `nodes.filter(node => node.parentCode === "...")` patterns in the original
  HTML's `<script>` block if you need to port the assurance rollup next.
