# Routing map

The route table, how access is decided, and what a deep link has to satisfy to become navigation.

## Route table

Paths are declared once in `src/shared/config/app-paths.constants.ts` (`APP_PATHS`). Each module
exports typed builders in `routes/*.paths.ts` and definitions in `routes/*.routes.ts`;
`src/app/router/route-registry.ts` concatenates them in order.

| Path         | Access        | Container            | Module         |
| ------------ | ------------- | -------------------- | -------------- |
| `/`          | redirect      | → `/welcome`         | app router     |
| `/welcome`   | `public`      | `WelcomeContainer`   | `home`         |
| `/login`     | `public-only` | `LoginContainer`     | `auth`         |
| `/home`      | `protected`   | `HomeContainer`      | `home`         |
| `/settings`  | `public`      | `SettingsContainer`  | `settings`     |
| `/workbench` | `public`      | `WorkbenchContainer` | `ui-workbench` |
| `*`          | `public`      | `NotFoundContainer`  | `home`         |

Registration order is `auth`, `home`, `settings`, `ui-workbench`, then the root redirect, then the
catch-all. The catch-all comes from `getCatchAllRouteDefinition()` and **must** stay last — React
Router v5 matches in order, so a catch-all registered earlier would swallow everything after it.
`settings` and `workbench` are public deliberately: preferences must be reachable before signing in,
and the workbench is a design-system catalogue with no data of its own.

## Access levels

`ROUTE_ACCESS` in `src/shared/types/route.types.ts` has exactly three values:

- **`public`** — always renders.
- **`public-only`** — renders only for an anonymous visitor. `/login` is `public-only`, so an
  authenticated user who navigates back to it is sent to `/home`.
- **`protected`** — renders only with a session; otherwise redirect to `/login`.

A route declares its access; it never enforces it. That is the guard's job.

## Guard behavior

`src/app/router/guarded-route.guard.tsx` wraps every definition, and `use-route-guard.hook.ts`
gives it `isResolved`, `isAuthenticated`, and a translated loading label from `useSession()`:

```text
!isResolved                          → <LoadingState />        (session status still unknown)
protected   && !isAuthenticated      → <Redirect to="/login" />
public-only && isAuthenticated       → <Redirect to="/home" />
otherwise                            → <Screen />
```

The `isResolved` branch is what makes this correct rather than merely typical. The session store
starts at `unknown`, and `bootstrapSessionFromStoredTokens()` resolves it during `startApp()` —
before the first render. Without the tri-state, a returning user would see `/login` flash while the
token read settled.

Guards also centralize navigation ownership: modules declare access and never redirect across
module boundaries themselves. The router owner (`@/packages/router`) is the only holder of
`Redirect`, `Route`, `IonRouterOutlet`, and `useIonRouter`;
`architecture/no-direct-navigation-outside-router-owner` rejects `history.pushState` and
`location.assign` outside `platform/` and `packages/`.

## Composition

`src/app/router/app-router.routes.tsx` renders `IonReactRouter` → `AppLifecycle` →
`IonRouterOutlet`, mapping every definition to a `<Route>` whose `render` returns a `GuardedRoute`.
Ionic's outlet, not React Router, owns page transitions — which is why the router owner re-exports
from both `@ionic/react-router` and `react-router-dom`, and why React Router stays on v5
([ionic-router-compatibility](../memory/ionic-router-compatibility.md)).

## Deep-link allowlist policy

`src/app/router/deep-link-policy.constants.ts` builds the policy from canonical constants rather
than restating strings:

```ts
export const APP_DEEP_LINK_POLICY: DeepLinkPolicy = {
  allowedSchemes: ['https', APP_IDENTITY.appId], // https + com.capacitorranger.app
  allowedHosts: ['capacitorranger.app', 'localhost'],
  allowedPathPrefixes: Object.values(APP_PATHS), // derived — a new route is covered for free
};
```

`parseDeepLink()` (`src/platform/deep-links/deep-link.parser.ts`) enforces it and returns a
`Result<string, DeepLinkRejection>` with a reason of `unparseable`, `scheme`, `host`, or `path`.
Three properties make it an allowlist rather than a filter:

1. It returns an **internal path** (`pathname` + `search`), never a URL — so a validated link cannot
   carry an origin into the router.
2. Path matching is exact-or-prefixed (`=== prefix || startsWith(prefix + '/')`), so `/homeless`
   does not match `/home`.
3. Anything not explicitly allowed is rejected. There is no default-allow branch.

`use-app-lifecycle.hook.ts` wires the listener: accepted links go to
`router.push(path, 'root', 'replace')`; rejected ones raise a translated toast
(`I18N_KEYS.errors.deepLinkRejected`) and change nothing. Cold start (`getLaunchUrl()`) and warm
start (`subscribeToAppUrlOpen`) both pass through the same parser — there is no second, more
trusting path.

Deep-link and auth work sits in the **critical** risk lane — see
[release-gates](./release-gates.md).
