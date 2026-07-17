# 12 — Routing and deep links

> Authority: normative. Conflicts resolve in favor of ADRs and the security policy.

## Mandatory

- MUST declare every path once in `APP_PATHS` (`src/shared/config/app-paths.constants.ts`) and
  expose typed builders from the owning module's `routes/*.paths.ts`.
- MUST describe a screen as an `AppRouteDefinition` — `path`, `exact`, `access`, `component` — and
  export the module's definitions through its `index.ts`.
- MUST declare access with `ROUTE_ACCESS`: `Public`, `PublicOnly`, or `Protected`. Access is data;
  the app-level `GuardedRoute` enforces it.
- MUST register routes centrally in `src/app/router/route-registry.ts`, and MUST keep the catch-all
  not-found definition last.
- MUST own cross-module redirects in the guard, not in the module that triggers them — a module
  never navigates another module's user somewhere.
- MUST validate every inbound deep link against `APP_DEEP_LINK_POLICY` — allowed schemes, hosts, and
  path prefixes — and MUST turn it into an internal path before navigating.
- MUST reject anything the allowlist does not cover, surfacing `DEEP_LINK_REJECTED` rather than
  following the URL.

## Forbidden

- NEVER write a raw path string outside a `*.paths.ts`, `*.constants.ts`, or `*.schema.ts` file.
- NEVER drive navigation through `history.pushState`, `history.back`, `location.assign`,
  `location.replace`, or `location.reload` from feature code; use `@/packages/router` or a platform
  facade.
- NEVER navigate to a URL taken from a deep link; navigate to the parsed, allowlisted path.
- NEVER add a route without an explicit `access` value — an omitted guard is an unprotected screen.

## Rationale

A single path table plus typed builders means a URL rename is one edit and a type error everywhere
stale. Declarative access turns "is this screen protected?" into data a reviewer can read in one
place instead of auditing every container. The deep-link allowlist is a security boundary: a cold
start hands the app an attacker-influenced string, and treating it as a route without validation is
how mobile apps get navigated into authenticated screens they should not open.

## Valid

```ts
// src/modules/home/routes/home.routes.ts
export function getHomeRouteDefinitions(): readonly AppRouteDefinition[] {
  return [
    { path: welcomePath(), exact: true, access: ROUTE_ACCESS.Public, component: WelcomeContainer },
    { path: homePath(), exact: true, access: ROUTE_ACCESS.Protected, component: HomeContainer },
  ];
}
```

## Invalid

```tsx
// src/modules/home/containers/home.container.tsx
export function HomeContainer(): React.JSX.Element {
  const view = useHomeScreen();
  if (!view.isAuthenticated) {
    globalThis.location.assign('/login'); // raw path + direct navigation, bypassing the guard
  }
  return <HomeView {...view} />;
}
```

## Enforcement

| Mechanism                                                        | Command                          |
| ---------------------------------------------------------------- | -------------------------------- |
| `architecture/no-inline-routes`                                  | `npm run lint`                   |
| `architecture/no-direct-navigation-outside-router-owner`         | `npm run lint`                   |
| `architecture/no-direct-browser-api-outside-platform`            | `npm run lint`                   |
| Deep-link parser at 100% coverage (`*.parser.ts` is a pure glob) | `npm run test:coverage:per-file` |
| Guard behavior across public, public-only, and protected routes  | `npm run test:e2e`               |

Manual review where mechanical enforcement is impossible: whether `APP_DEEP_LINK_POLICY` is
_correctly_ scoped. The parser faithfully enforces whatever allowlist it is given; only a reviewer
can notice that a newly added host or path prefix widens the attack surface.

## Definition of done

- [ ] The path exists once in `APP_PATHS`, with a typed builder in the owning module.
- [ ] The route definition carries an explicit `ROUTE_ACCESS`, and the catch-all is still last.
- [ ] Any deep-link change updates the policy and its parser tests together.

## Related

[18-security](18-security.md) · [10-ionic-boundaries](10-ionic-boundaries.md) ·
[02-feature-modules](02-feature-modules.md) ·
[../docs/eslint/no-inline-routes.md](../docs/eslint/no-inline-routes.md)
