# Skill: Add a route

**Use when:** a screen must be reachable at a URL.

## Required reading

- [rules/12 — Routing and deep links](../rules/12-routing-and-deep-links.md) — definitions, typed
  paths, guard ownership.
- [docs/eslint/no-inline-routes](../docs/eslint/no-inline-routes.md) — where a raw path string is
  legal.
- [route-registry.ts](../src/app/router/route-registry.ts) — the ordered table the router renders.
- [guarded-route.guard.tsx](../src/app/router/guarded-route.guard.tsx) — the only place that decides
  redirects.
- [home.routes.ts](../src/modules/home/routes/home.routes.ts) — two screens plus the catch-all.

## Preconditions

- [ ] The screen container exists — see [container](container.md).
- [ ] The access level is decided: `ROUTE_ACCESS.Public`, `PublicOnly` (login) or `Protected`
      (home).
- [ ] The path is a new value for `APP_PATHS`, not a variant of an existing one.

## Files

```text
src/shared/config/app-paths.constants.ts       edit: the canonical path literal
src/modules/<module>/routes/<module>.paths.ts  typed builders
src/modules/<module>/routes/<module>.routes.ts get<Module>RouteDefinitions()
src/app/router/route-registry.ts               edit: splice the getter in
src/modules/<module>/index.ts                  edit: export the getter
```

## Steps

1. Add the literal to `APP_PATHS` in `src/shared/config/app-paths.constants.ts`. That object is the
   canonical route table; `AppPath` derives from it, and `architecture/no-inline-routes` allows raw
   path strings only in paths/constants files.
2. Expose a builder in `routes/<module>.paths.ts` —
   `export function loginPath(): string { return APP_PATHS.login; }`. Parameterized routes build
   here too: `` (id) => `${APP_PATHS.order}/${id}` ``. `*.paths.ts` is held to 100% coverage.
3. Declare the definition in `routes/<module>.routes.ts` returning `readonly AppRouteDefinition[]`:
   `{ path: loginPath(), exact: true, access: ROUTE_ACCESS.PublicOnly, component: LoginContainer }`.
   `AppRouteDefinition` and `ROUTE_ACCESS` come from `@/shared/types`.
4. Pick `access` deliberately — it is the whole authorization decision:
   - `Protected` → `GuardedRoute` redirects to `APP_PATHS.login` when not authenticated.
   - `PublicOnly` → redirects to `APP_PATHS.home` when already authenticated (login).
   - `Public` → always renders (welcome, 404).
5. Register in `src/app/router/route-registry.ts` by spreading the getter into
   `getAppRouteDefinitions()`. The catch-all `getCatchAllRouteDefinition()` stays last —
   `home.routes.ts` returns it separately with `path: '*'` for exactly this reason.
6. Export the getter from the module `index.ts` — auth exports `getAuthRouteDefinitions` and nothing
   else about routing. `src/app` may import modules; the reverse fails
   `architecture/no-app-imports-below-app`.
7. Navigate with `useAppNavigation` from `@/packages/router` inside a hook. Cross-module transitions
   after auth are the guard's job — do not push history from a module.

## Tests

- `<module>.paths.test.ts` — pure, 100%: each builder returns its `APP_PATHS` value; parameterized
  builders compose correctly.
- `<module>.routes.test.ts` — assert the definition list: path, `exact`, `access`, and that the
  component reference is the expected container.
- Guard behavior belongs to `src/app/router/hooks/use-route-guard.hook.ts` and to E2E:
  `tests/e2e/auth.spec.ts` proves an authenticated visitor bounces off `/login` and a signed-out one
  bounces off `/home`.
- Run: `npx vitest run --project unit src/modules/<module>/routes`.

## Security / accessibility / native considerations

- A `Protected` route is an authorization boundary; getting `access` wrong exposes the screen. It is
  the **critical** lane — run the E2E auth suite.
- Adding to `APP_PATHS` widens the deep-link allowlist automatically: `APP_DEEP_LINK_POLICY` uses
  `Object.values(APP_PATHS)` as its `allowedPathPrefixes`. Read [deep-link](deep-link.md) before
  adding.
- The screen's `PageShell` title must be a translated key, and the page needs a `TEST_IDS` id.

## Documentation delta

- `context/architecture-map.md` route table.
- The module README's public surface — auth documents `getAuthRouteDefinitions` as "`/login` route
  definition".

## Validation

```bash
npm run lint
npx vitest run --project unit src/modules/<module>/routes
npm run test:e2e
npm run quality:architecture
```

## Forbidden shortcuts

- `<Route path="/orders" …>` inside `app-router.routes.tsx` — `architecture/no-inline-routes`; the
  registry is the only table.
- `'/home'` typed into a container — same rule; import the builder.
- A guard clause inside the container (`if (!session) return <Redirect/>`) — that duplicates
  `GuardedRoute` and fails `architecture/no-inline-component-logic`.
- `history.push` from a module hook — `architecture/no-direct-navigation-outside-router-owner`.

## Definition of done

- [ ] The path exists once, in `APP_PATHS`, and is reached through a builder everywhere else.
- [ ] The definition declares the correct `access`; the catch-all is still last.
- [ ] The registry renders the route; nothing inlines a `<Route>`.
- [ ] `*.paths.ts` sits at 100% coverage.
- [ ] `npm run test:e2e` passes, including the guard redirects.
