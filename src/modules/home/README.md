# Home module

Owns the public welcome screen, the protected home screen, and the not-found screen.

## Public surface (`index.ts`)

| Export                       | Purpose                                      |
| ---------------------------- | -------------------------------------------- |
| `getHomeRouteDefinitions`    | `/welcome` (public) and `/home` (protected). |
| `getNotFoundRouteDefinition` | Catch-all; the app router registers it last. |
| `welcomePath`, `homePath`    | Typed path builders.                         |

## Anatomy

```text
routes/home.paths.ts     typed builders over APP_PATHS
hooks/use-*-screen.hook  translated view models
components/*             UI-only views
containers/*             composition (home injects the health card by slot)
```

## Invariants

- Home consumes auth through `@/modules/auth` and health through `@/modules/health` — public
  surfaces only, never deep imports.
- The health card arrives as a `healthSlot` prop, so `HomeView` stays presentational.
- Route access is declared, not hand-rolled: the app-level guard enforces it.

## Related

- Rules: [02-feature-modules](../../../rules/02-feature-modules.md),
  [04-containers](../../../rules/04-containers.md),
  [12-routing-and-deep-links](../../../rules/12-routing-and-deep-links.md).
- Context: [routing-map](../../../context/routing-map.md).
