# Architecture map

How `src/` is laid out today, which way imports flow, and where execution starts. The reasoning
behind the shape is [ADR 0001](../architecture/adrs/0001-module-first-architecture.md); this page is
the wiring.

## Layers

```text
┌──────────────────────────────────────────────────────────────────────┐
│ src/app/          composition root — the ONLY layer that knows all    │
│                   modules: startup, providers, router, shell, boundary│
├──────────────────────────────────────────────────────────────────────┤
│ src/modules/      features, one folder each, one public index.ts      │
│                   auth · health · home · settings · ui-workbench      │
├──────────────────────────────────────────────────────────────────────┤
│ src/platform/     device + runtime policy composed from plugin owners │
├──────────────────────────────────────────────────────────────────────┤
│ src/shared/       cross-feature primitives: ui · errors · i18n keys · │
│                   config constants · enums · mappers · types          │
├──────────────────────────────────────────────────────────────────────┤
│ src/packages/     vendor owners — 28 directories, one vendor each     │
├──────────────────────────────────────────────────────────────────────┤
│ node_modules      Ionic · Capacitor · Axios · Query · Zustand · Zod … │
└──────────────────────────────────────────────────────────────────────┘
                              imports flow DOWN only
```

## The one-way rule

| Layer      | May import                                            | May never import             |
| ---------- | ----------------------------------------------------- | ---------------------------- |
| `app`      | modules, platform, shared, packages                   | nothing below is off-limits  |
| `modules`  | other modules' `index.ts`, platform, shared, packages | `app`                        |
| `platform` | platform, shared, packages                            | `app`, `modules`             |
| `shared`   | shared, packages                                      | `app`, `modules`, `platform` |
| `packages` | packages, vendors                                     | everything above             |

Two independent checks hold the line: `architecture/no-restricted-layer-imports` at lint time, and
`scripts/architecture/validate-architecture.mjs` (`npm run quality:architecture`), which re-derives
the graph from import statements and also rejects deep imports into another module.

The direction has one consequence worth stating: a package owner cannot import `@/shared`. That is
why `src/packages/http` depends on its own `TokenStore` interface rather than on the auth module —
the auth repository implements the interface, and `src/app/startup/start-app.ts` connects them.

## Cross-cutting: UI/UX Quality Mandate

Every screen this map wires together must satisfy the
[UI/UX Quality Mandate](../rules/ui-ux-quality-mandate.md): cool, clear, vibrant, catchy and
UX-perfect on web and mobile — responsive (desktop sidebar+navbar, mobile tab bar+drawer), polished
loaders and skeletons for all async states, first-class dark + light mode, perfect RTL + LTR,
accessible (WCAG AA), refined components and tasteful motion. Plain/default styling is not
acceptable. The `src/app` shell owns the responsive frame; `src/shared/ui` owns the skeletons, state
components, and themed primitives that keep every async state polished across modules.

## What lives where

- **`src/app/`** — `startup/start-app.ts` (composition root), `router/` (route registry, guard,
  deep-link policy), `providers/`, `shell/` (offline banner), `error-boundaries/`, `lifecycle/`,
  `bootstrap/query-client.factory.ts`.
- **`src/modules/`** — one vertical slice each; see [module-anatomy](./module-anatomy.md).
- **`src/platform/`** — `runtime/` (the `@capacitor/core` owner), `deep-links/`, `security/`,
  `back-button/`, `app-state/`, `storage/`, `permissions/`, `lifecycle/`, `network/`.
- **`src/shared/`** — `ui/` (the design system, including the toast and alert hook owners),
  `errors/` (`AppError`, codes), `mappers/`, `i18n/` (keys + `en`/`ar` catalogs), `config/`
  (`APP_PATHS`, `STORAGE_KEYS`, `TEST_IDS`, `APP_IDENTITY`), `enums/`, `types/`, `security/`.
- **`src/packages/`** — vendor owners; see [dependency-map](./dependency-map.md).
- **`src/tests/msw/`** — the mock network layer
  ([ADR 0016](../architecture/adrs/0016-mock-api-mode.md)).

## Entry points

| Entry                                  | Responsibility                                                     |
| -------------------------------------- | ------------------------------------------------------------------ |
| `src/main.tsx`                         | Awaits `startApp()`, then mounts `<AppShell />` in StrictMode      |
| `src/app/startup/start-app.ts`         | i18n → HTTP client → error reporting → mock mode → session         |
| `src/app/shell/app-shell.provider.tsx` | Providers → Ionic frame → error boundary → offline banner → router |
| `src/app/router/app-router.routes.tsx` | `IonReactRouter` + guarded routes + root redirect + catch-all      |
| `capacitor.config.ts`                  | Native shell config; derives identity from `APP_IDENTITY`          |
| `eslint/package-ownership.config.mjs`  | The vendor→owner registry every ownership check reads              |

Startup order in `start-app.ts` is deliberate: i18n first (errors need translation), then the HTTP
client (wired with the auth token store, the refresh executor, and the auth-failure handler), then
error reporting, then mock mode, and finally `bootstrapSessionFromStoredTokens()` — so the first
render already knows whether a session exists and the route guard never flashes.
