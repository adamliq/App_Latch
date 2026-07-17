# Third-party components bundled in this app

These are the runtime third-party packages actually compiled into
`appserver/static/build/latch_app.<hash>.js` (confirmed by inspecting the
production bundle for each library's identifying strings; unused
dependencies of these packages, such as `moment`, `lodash`'s bulk, or
`react-markdown`, are tree-shaken out and are not present).

| Component | Version | License | Role |
| --- | --- | --- | --- |
| React | 18.3.1 | MIT | UI rendering |
| React DOM | 18.3.1 | MIT | UI rendering |
| React Router | 6.30.4 | MIT | In-app page routing |
| styled-components | 5.3.11 | MIT | Component styling |
| @splunk/react-ui | 5.12.0 | Apache-2.0 | Splunk UI Toolkit components |
| @splunk/react-icons | 5.13.0 | Apache-2.0 | Icons used by SUIT components |
| @splunk/react-page | 8.3.1 | Apache-2.0 | Mounts the app into Splunk Web's page chrome |
| @splunk/themes | 1.9.0 | Apache-2.0 | Design tokens and theme provider |
| @splunk/splunk-utils | 4.0.0 | Apache-2.0 | Splunk config/theme helper utilities |
| lodash (partial, via @splunk/react-ui) | — | MIT | Utility functions used internally by SUIT components |
| prop-types (via @splunk/react-ui) | — | MIT | Runtime prop validation used internally by SUIT components |

Full license texts for MIT/Apache-2.0 dependencies are available from each
package's own repository; none require separate distribution beyond
standard attribution, which this file provides. No component listed here is
modified from its published form.

For the complete development-time dependency list (build tooling, test
libraries, linters — none of which ship in this package), see the
repository root `THIRD_PARTY_NOTICES.md`.
