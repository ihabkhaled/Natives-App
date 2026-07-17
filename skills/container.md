# Skill: Add a container

**Use when:** a hook's view model needs to be joined to a component, or a screen needs a route
target.

## Required reading

- [rules/04 — Containers](../rules/04-containers.md) — the composition-seam contract.
- [Health card container](../src/modules/health/containers/health-card.container.tsx) — the whole
  pattern in four lines.
- [Login container](../src/modules/auth/containers/login.container.tsx) — a screen container that
  wraps its component in `PageShell`.

## Preconditions

- [ ] The hook exists and returns a complete view model — see [hook](hook.md).
- [ ] The component exists and takes that view model as props — see [component](component.md).
- [ ] You know which this is: an **embeddable** container (`HealthCardContainer`, exported for other
      modules) or a **screen** container (`LoginContainer`, referenced by a route definition).

## Files

```text
src/modules/<module>/containers/<thing>.container.tsx
src/modules/<module>/index.ts        edit: export it only if another layer mounts it
```

## Steps

1. Name the file `<thing>.container.tsx`; the taxonomy in `eslint/filenames.config.mjs` maps
   `container.tsx` to the component family, which carries the strictest declaration rules.
2. Write one named `export function <Thing>Container(): React.JSX.Element`. Default exports fail
   `architecture/no-default-export-in-app-source`.
3. Call exactly one hook and pass its result on. `HealthCardContainer` is the canonical body:
   `const view = useHealthCard(); return <HealthStatusCard {...view} />;`.
4. For a screen, wrap in `PageShell` from `@/shared/ui` with a `TEST_IDS` page id, the way
   `LoginContainer` uses `TEST_IDS.loginPage` and spreads `screen.form` fields explicitly.
5. Do not reshape data between hook and component. If the props do not line up, the hook is
   incomplete — widen the view model instead of computing in the container. Any `if`, `map` or `??`
   chain here trips `architecture/no-inline-component-logic`.
6. Export from the module `index.ts` only when something outside the module mounts it. Health
   exports `HealthCardContainer` because the home screen embeds it; `LoginContainer` stays internal
   and is reached through `getAuthRouteDefinitions()`.
7. For a screen, register the route next — see [route](route.md).

## Tests

- `<thing>.container.test.tsx`, colocated. Mock the hook module
  (`vi.mock('../hooks/use-<thing>.hook')`) and assert the component receives the view; or render for
  real with `renderWithProviders` from `tests/setup/render-with-providers.helper.tsx` after
  `await initTestI18n()`.
- Prove the seam: the container mounts, and the hook's callbacks reach the rendered control.
  `login.container.test.tsx` is the reference.
- Run: `npx vitest run --project unit src/modules/<module>/containers`.

## Security / accessibility / native considerations

- None beyond the defaults: a container adds no surface of its own. Page titles and test ids it
  passes through must already be translated ids and `TEST_IDS` entries.

## Documentation delta

- The module README's public-surface table when the container is exported — health lists
  `HealthCardContainer` as "Embeddable health card (used by home)".

## Validation

```bash
npm run lint
npm run quality:exports
npx vitest run --project unit src/modules/<module>/containers
```

## Forbidden shortcuts

- Calling two hooks "because it is simpler than one" — compose them inside a screen hook such as
  `use-login-screen.hook.ts`; `architecture/no-hooks-in-components` reads containers as components.
- Doing the translation or formatting here — `architecture/no-raw-i18n-text`.
- Navigating with `history.push` from a container —
  `architecture/no-direct-navigation-outside-router-owner`; guards own transitions
  (`guarded-route.guard.tsx`).
- Exporting every container from `index.ts` by reflex — it widens the module surface for nothing.

## Definition of done

- [ ] The body is one hook call and one component render.
- [ ] The container is exported from `index.ts` only if a foreign layer mounts it.
- [ ] A screen container is reachable through its module's route definitions, not an inline
      `<Route>`.
- [ ] `npm run lint` and `npm run quality:exports` pass.
