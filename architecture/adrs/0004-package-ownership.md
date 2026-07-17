# ADR 0004: Package ownership

- Status: Accepted
- Date: 2026-07-16
- Deciders: Architecture owner

## Context

Every direct vendor import is an unbudgeted migration cost. When `axios` is imported in forty
files, swapping or upgrading it is a forty-file change with forty chances to diverge; when Ionic's
API shifts between majors, the blast radius is every view. The problem is not the dependency, it is
the _number of edges_ to it. Something has to cap that number at one, and the cap has to be
machine-checked, because "please use the wrapper" is a request, not a boundary.

## Decision

Every third-party runtime dependency has exactly one owning directory, declared in the machine-
readable registry `eslint/package-ownership.config.mjs`. That registry is the single source of
truth: the ESLint rules, the ownership script, and the generated `.ai/graphs/ownership.json` all
read it rather than restating it.

- 36 registry entries map vendors onto 27 distinct owners; `src/packages/` holds 28 owner
  directories (`analytics`, `environment`, and `logger` own internal seams rather than a vendor).
- A handful of entries deliberately list more than one owner dir — `@ionic/react` is shared by
  `src/packages/ionic` and `src/packages/router`; `@capacitor/core` by `src/platform/runtime` and
  `src/packages/secure-storage`, both of which must branch on native versus web.
- `react` and `react-dom` are `FOUNDATIONAL_VENDORS`: they are the language of the UI layer, so
  ownership does not apply.
- Owners wrap vendors and nothing else — they may not import `modules`, `shared`, `platform`, or
  `app` code.
- Type-only vendor imports stay legal inside `packages/` and `platform/`, since they erase at build
  time and cannot create a runtime edge.

## Consequences

**Positive:** A vendor swap is a one-directory change. An unregistered dependency fails the build,
so ownership cannot silently rot.

**Negative / cost:** Adding any dependency now costs a facade plus a registry entry, and facades
inevitably lag behind the vendor's full API surface. Contributors who know the vendor must learn
the local wrapper first.

**Enforcement:** Six generated rules from `createVendorOwnershipRule` — `no-raw-package-imports`
(all vendors) plus targeted `no-raw-capacitor-imports`, `no-direct-axios-import-outside-owner`,
`no-direct-ionic-import-outside-owner`, `no-direct-dayjs-import-outside-owner`,
`no-direct-virtuoso-import-outside-owner` — reinforced by
`architecture/no-module-imports-in-package-owners` and `npm run quality:package-ownership`.

## Alternatives considered

- Import-boundary tooling alone (`import-x/no-restricted-paths`) — rejected because it cannot
  answer "who owns this vendor" or fail on an unregistered dependency.
- Trusting code review — rejected because vendor edges are added one at a time and each looks
  locally reasonable.

## Supersession

Revisit if the app splits into real workspace packages, where `package.json` dependency lists could
express ownership directly.
