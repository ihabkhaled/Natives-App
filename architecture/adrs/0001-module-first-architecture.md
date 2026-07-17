# ADR 0001: Module-first architecture

- Status: Accepted
- Date: 2026-07-16
- Deciders: Architecture owner

## Context

A Capacitor application grows by feature, not by technical role. A folder-by-type tree spreads one
feature across the whole repository, so every change touches unrelated directories and no boundary
can be checked mechanically. This repository also has to keep vendor churn (Ionic, Capacitor,
TanStack Query) away from product code, which requires layers underneath features that features may
depend on but that may never depend on features.

## Decision

Five top-level layers under `src/`, with imports flowing one way only:

`app` → `modules` → `platform` → `shared` → `packages` → vendors.

- `src/modules/<name>/` owns one feature end to end — `auth`, `health`, `home`, `settings`,
  `ui-workbench` — and exposes exactly one public surface, its `index.ts`.
- `src/platform/` owns device and runtime concerns, `src/shared/` owns cross-feature primitives,
  and `src/packages/` owns vendors.
- `src/app/` is the only composition layer: `src/app/startup/start-app.ts` wires the runtime and
  `src/app/router/route-registry.ts` assembles the route definitions modules declare.
- Cross-module imports resolve through `@/modules/<name>` only; deep imports are rejected.

## Consequences

**Positive:** A feature is one directory, so deleting it is deleting a folder. Layer direction is a
graph property, which makes it checkable rather than aspirational.

**Negative / cost:** Shared behavior must be pushed down into `shared/` or `packages/` before a
second module can use it, which is more work than importing sideways. Route registration becomes
indirect — a module declares definitions and the app registers them.

**Enforcement:** ESLint `architecture/no-restricted-layer-imports`,
`architecture/no-cross-module-deep-imports`, `architecture/no-app-imports-below-app`,
`architecture/require-module-public-surface`; plus `npm run quality:architecture`
(`scripts/architecture/validate-architecture.mjs`), which re-scans the direction independently and
requires an `index.ts` and a `README.md` per module.

## Alternatives considered

- Folder-by-type at the root (`components/`, `hooks/`, `services/`) — rejected because a feature
  boundary cannot be expressed, so nothing can enforce one.
- Nx or Turborepo packages per feature — rejected because workspace and build wiring overhead
  outweighs the benefit for a single-app boilerplate; lint rules buy the same isolation.
- Permitting sideways module imports for convenience — rejected because it turns the module graph
  into a mesh and makes deletion unsafe.

## Supersession

Revisit if the repository ever ships more than one deliverable (a second Capacitor shell, or a
published SDK), at which point real workspace packages may become worth their cost.
