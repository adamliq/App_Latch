# Third-party notices

This file inventories every direct dependency of `packages/latch` (the
frontend workspace). "Ships in package?" marks whether the dependency's code
is actually compiled into the release archive under `splunk-app/latch/` —
most development dependencies (linters, test runners, the TypeScript
compiler, webpack itself) do not, and unused code paths of runtime
dependencies are tree-shaken out (see
`splunk-app/latch/README/THIRD_PARTY_COMPONENTS.md` for what's confirmed
present in the compiled bundle).

All dependencies are pinned to an exact version in `packages/latch/package.json`
and locked via the workspace-root `package-lock.json`, installed
reproducibly with `npm ci`.

| Package | Version | License | Ships in package? |
| --- | --- | --- | --- |
| @babel/core | 7.29.7 | MIT | No (build tool) |
| @splunk/babel-preset | 4.0.0 | Apache-2.0 | No (build tool) |
| @splunk/eslint-config | 6.0.0 | Apache-2.0 | No (lint tool) |
| @splunk/react-icons | 5.13.0 | Apache-2.0 | Yes |
| @splunk/react-page | 8.3.1 | Apache-2.0 | Yes |
| @splunk/react-ui | 5.12.0 | Apache-2.0 | Yes |
| @splunk/splunk-utils | 4.0.0 | Apache-2.0 | Yes |
| @splunk/themes | 1.9.0 | Apache-2.0 | Yes |
| @splunk/webpack-configs | 7.0.3 | Apache-2.0 | No (build tool) |
| @testing-library/jest-dom | 6.9.1 | MIT | No (test tool) |
| @testing-library/react | 16.3.2 | MIT | No (test tool) |
| @testing-library/user-event | 14.6.1 | MIT | No (test tool) |
| @types/jest | 30.0.0 | MIT | No (types only) |
| @types/react | 18.3.31 | MIT | No (types only) |
| @types/react-dom | 18.3.7 | MIT | No (types only) |
| @types/styled-components | 5.1.36 | MIT | No (types only) |
| babel-loader | 8.4.1 | MIT | No (build tool) |
| copy-webpack-plugin | 14.0.0 | MIT | No (build tool, unused in current config) |
| eslint | 9.39.4 | MIT | No (lint tool) |
| identity-obj-proxy | 3.0.0 | MIT | No (test tool) |
| jest | 30.4.2 | MIT | No (test tool) |
| jest-environment-jsdom | 30.4.1 | MIT | No (test tool) |
| react | 18.3.1 | MIT | Yes |
| react-dom | 18.3.1 | MIT | Yes |
| react-router-dom | 6.30.4 | MIT | Yes |
| styled-components | 5.3.11 | MIT | Yes |
| typescript | 5.9.3 | Apache-2.0 | No (type-checking only) |
| typescript-eslint | 8.64.0 | MIT | No (lint tool) |
| webpack | 5.108.4 | MIT | No (build tool) |
| webpack-cli | 5.1.4 | MIT | No (build tool) |
| webpack-merge | 6.0.1 | MIT | No (build tool) |

Two transitive dependencies of `@splunk/react-ui` end up partially present
in the compiled bundle because SUIT components import small parts of them
internally: **lodash** (MIT) and **prop-types** (MIT). Neither is a direct
dependency of this project; both are documented in
`splunk-app/latch/README/THIRD_PARTY_COMPONENTS.md` since that file
describes what's actually shipped.

## Root workspace tooling

| Package | Version | License |
| --- | --- | --- |
| rimraf | 6.1.3 | ISC |
| tar | 7.5.20 | ISC |

## Dependency-update process

Dependencies are bumped by editing the exact version in the relevant
`package.json`, running `npm install` to update the lockfile, then running
the full `npm run release` pipeline (lint, typecheck, test, build, package,
validate) before committing. Each bump should be reviewed for license
changes and known vulnerabilities (`npm audit`) before merging.

## Vulnerability-response process

Run `npm audit` (or an equivalent SCA tool) against the workspace as part of
each dependency bump and before each release. Document any accepted
vulnerability and its compensating control here; there are none accepted as
of this release.
