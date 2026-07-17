# Accessibility guide

## Target standard

WCAG 2.1 AA, achieved primarily by relying on Splunk UI Toolkit's own
accessible component implementations (`Tree`, `Table`, `Modal`, `Select`,
`ControlGroup`, `Paginator`, etc.) rather than recreating controls with
custom HTML/CSS/JS.

## Keyboard navigation

- The top navigation is a standard ARIA tablist (arrow keys move between
  tabs, Enter/Space activates).
- The Taxonomy Explorer's tree implements the W3C treeview keyboard pattern
  (arrow keys to move, Enter/Space to expand/select) via SUIT's `Tree`
  component.
- Every table's "View details" action and every filter control is a real
  `<button>`, `<input>`, or `<select>`-equivalent, reachable and operable by
  keyboard alone.
- A "Skip to main content" link is the first focusable element on every
  page, for keyboard users who want to bypass the navigation.
- Modals trap and restore focus (SUIT's `Modal` component; each usage passes
  `returnFocus` pointing back to the control that opened it).

## Screen reader considerations

- Each page has exactly one `<h2>` page heading, in a consistent position,
  announced on navigation.
- Filter controls that are visually unlabelled (to save space in a compact
  toolbar) still carry a programmatic label via `ControlGroup`/`aria-label`.
- Tables that don't have a visible caption still have an accessible name via
  a screen-reader-only `Table.Caption`.
- Icon-only controls (tree expand/collapse toggles) have an `aria-label`
  describing the action and the record it applies to (e.g. "Expand
  Platforms").

## Use of colour

Status/priority/coverage values are always shown as text (in `Badge`s or
table cells), never conveyed by colour alone.

## Form validation

The app has no data-entry forms that persist data (it is read-only), so
there is no server-validated form-error state to associate with fields.
Search/filter controls have no invalid state.

## Known accessibility limitations

- The main content region of long tables (e.g. Health Checks, at ~390 rows)
  is paginated for performance, but the current page's row count is not
  announced via a live region beyond the visible "Showing X of Y" text.
- Automated accessibility testing (axe or equivalent) has not been run
  against a live, packaged install of this app as part of this release —
  only component-level tests (Jest + Testing Library, see
  `packages/latch/src/**/*.test.tsx`) and manual review of SUIT's documented
  accessibility behaviour. Run an automated scan (e.g. `@axe-core/react` or
  the axe browser extension) against a real Splunk-hosted instance before a
  Splunkbase submission and record the results here.

## Reporting an accessibility defect

See `SUPPORT.md`.
