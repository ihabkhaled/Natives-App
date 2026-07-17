# Dependency map

Every runtime vendor, its owner, and why that owner exists. The registry
`eslint/package-ownership.config.mjs` is the source of truth — 36 entries over 27 distinct owners.
This page explains the entries; it does not replace them. The mechanics live in
[package-ownership](./package-ownership.md), the decision in
[ADR 0004](../architecture/adrs/0004-package-ownership.md).

## Foundational (no owner)

`react` and `react-dom` are `FOUNDATIONAL_VENDORS`: they are the language the UI layer is written
in, so wrapping them would wrap everything. Every other runtime dependency needs an owner or
`npm run quality:package-ownership` fails.

## UI and navigation

| Vendor                                               | Owner                                | Why this owner exists                                                                                                         |
| ---------------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `@ionic/react`                                       | `packages/ionic` + `packages/router` | Enumerates the allowlisted component set and pulls Ionic CSS in once; the router owner needs `IonRouterOutlet`/`useIonRouter` |
| `@ionic/react-router`                                | `packages/router`                    | Ionic's routing integration; pins the React Router major                                                                      |
| `react-router`, `react-router-dom`                   | `packages/router`                    | Kept at v5 by the Ionic integration contract                                                                                  |
| `ionicons`                                           | `packages/icons`                     | Icon names become constants, so a renamed icon fails typecheck                                                                |
| `react-virtuoso`                                     | `packages/virtual-list`              | Virtualization is a perf contract, not a component choice                                                                     |
| `class-variance-authority`, `clsx`, `tailwind-merge` | `packages/ui-classes`                | One class-composition strategy; variants stay declarative                                                                     |

## Data and state

| Vendor                                                    | Owner               | Why this owner exists                                             |
| --------------------------------------------------------- | ------------------- | ----------------------------------------------------------------- |
| `axios`                                                   | `packages/http`     | The whole API boundary: interceptors, refresh, error mapping      |
| `@tanstack/react-query`, `@tanstack/react-query-devtools` | `packages/query`    | One retry/staleness policy; `useQuery` has exactly one caller     |
| `zustand`                                                 | `packages/state`    | Persistence cannot be enabled without a version and a migration   |
| `zod`                                                     | `packages/schema`   | Vendor issue types never escape; `safeParseWithSchema` normalizes |
| `react-hook-form`, `@hookform/resolvers`                  | `packages/forms`    | Validation always runs through a schema resolver                  |
| `socket.io-client`                                        | `packages/realtime` | Never auto-connects; callers opt in and must disconnect           |

## Platform, i18n, observability

| Vendor                                                         | Owner                                          | Why this owner exists                                                          |
| -------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------ |
| `i18next`, `react-i18next`, `i18next-browser-languagedetector` | `packages/i18n`                                | One init path, one detection order, one `translateNow`                         |
| `dayjs`                                                        | `packages/date`                                | Plugins and locale data are registered exactly once                            |
| `@sentry/react`, `@sentry/capacitor`                           | `packages/error-reporting`                     | Disabled without a DSN; reporting can never crash the app                      |
| `@aparajita/capacitor-secure-storage`                          | `packages/secure-storage`                      | Native keychain vs. documented web fallback in one place                       |
| `@capacitor/core`                                              | `platform/runtime` + `packages/secure-storage` | Runtime detection has one home; secure storage must branch on it               |
| `@capacitor/*` plugins (10)                                    | `packages/capacitor-*`                         | One owner per plugin — see [native-capability-map](./native-capability-map.md) |
| `msw`                                                          | `src/tests/msw`                                | The mock network is an owner too; features may not import it                   |

## Owners without a vendor

Three of the 28 directories under `src/packages/` wrap an internal seam rather than a dependency:

- `packages/logger` — the single `console` owner; the only documented `no-console` disable in the
  codebase lives in `logger.factory.ts`.
- `packages/analytics` — a vendor-free event seam that currently writes through the logger, so a
  real provider can be dropped in without touching feature code.
- `packages/environment` — the only reader of `import.meta.env`, validating it through a Zod schema
  and throwing at startup on bad configuration.

## Peer-conflict facts

Three version choices in `package.json` are constrained rather than preferred, and the reasons are
recorded in `memory/package-upgrade-notes.md`:

- `@sentry/react` is pinned to exactly `10.60.0` because `@sentry/capacitor@4.2.0` requires that
  exact peer.
- `eslint-plugin-react` and `eslint-plugin-jsx-a11y` still declare ESLint `<=9` peers, so
  `package.json` carries an `overrides` block mapping their `eslint` peer to `$eslint`.
- `typescript7` is an npm alias for the primary compiler; plain `typescript` exists only for the
  lint parser ([ADR 0011](../architecture/adrs/0011-typescript-7-toolchain-compatibility.md)).
