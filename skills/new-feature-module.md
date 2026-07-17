# Skill: Add a feature module

**Use when:** a new capability needs its own vertical slice under `src/modules/<name>/`.

## Required reading

- [rules/02 — Feature modules](../rules/02-feature-modules.md) — anatomy and the `index.ts`
  contract.
- [rules/01 — Dependency direction](../rules/01-architecture-and-dependency-direction.md) — the
  one-way graph `app → modules → platform → shared → packages`.
- [ADR 0001 — Module-first architecture](../architecture/adrs/0001-module-first-architecture.md) —
  why the slice, not the layer, is the unit of change.
- [context/module-anatomy](../context/module-anatomy.md) — how a live slice wires together today.
- [Health module README](../src/modules/health/README.md) — the worked example below, end to end.

## Preconditions

- [ ] The capability is a feature, not a vendor wrapper ([package-wrapper](package-wrapper.md)) and
      not a reusable primitive (`src/shared/ui`).
- [ ] The NestJS endpoint and its wire shape are known — see [axios-endpoint](axios-endpoint.md).
- [ ] The module name is one kebab-case noun; it becomes the folder and `@/modules/<name>`.

## Files

```text
src/modules/<name>/
  types/<name>.types.ts                      domain types (app-owned, no vendor types)
  schemas/<name>.schema.ts                   wire contract (Zod via @/packages/schema)
  mappers/<name>.mapper.ts                   DTO → domain, pure, 100% covered
  constants/<name>-api.constants.ts          endpoint paths
  gateways/<name>.gateway.ts                 request* functions
  services/get-<thing>.service.ts            one use case per file
  queries/<name>.keys.ts                     key builder
  queries/<name>.query.ts                    query-options builder
  hooks/use-<thing>-query.hook.ts            query hook
  hooks/use-<thing>-card.hook.ts             translated view model
  components/<thing>-card/                   index.ts + .component.tsx + .constants.ts + .types.ts
  containers/<thing>-card.container.tsx      composition seam
  routes/<name>.paths.ts + routes/<name>.routes.ts
  README.md
  index.ts
src/app/router/route-registry.ts             edit: register the module's routes
src/shared/config/app-paths.constants.ts     edit: canonical path
src/shared/config/test-ids.constants.ts      edit: test ids
src/shared/i18n/i18n-keys.constants.ts + locales/{en,ar}.json   edit: keys and copy
```

## Steps

Build bottom-up. Health is the reference; every file named below exists.

1. **Types** — `health/types/health.types.ts` declares `HealthStatus` with `readonly` fields. App
   vocabulary only: `architecture/no-raw-vendor-types-in-domain` rejects vendor types here.
2. **Schema** — `health/schemas/health.schema.ts` builds `healthResponseSchema` from `schemaBuilder`
   (`@/packages/schema`). It mirrors the wire, not the domain: `status`, `version`, `timestamp`.
3. **Mapper** — `health/mappers/health.mapper.ts` exports `mapHealthResponseToStatus`, taking
   `SchemaOutput<typeof healthResponseSchema>` and returning `HealthStatus`. Pure and React-free
   (`architecture/no-react-in-pure-layers`); `vitest.config.ts` demands 100% on `*.mapper.ts`.
4. **Endpoint constants** — `health/constants/health-api.constants.ts` exports `HEALTH_API_PATHS`
   `as const`. Literal paths at a call site trip `architecture/no-inline-api-endpoints`.
5. **Gateway** — `health/gateways/health.gateway.ts` exports `requestHealth()` calling
   `getAppHttpClient().get(HEALTH_API_PATHS.health, healthResponseSchema, { skipAuth: true })`. See
   [gateway](gateway.md).
6. **Service** — `health/services/get-health.service.ts` exports `getHealthStatus()`: call the
   gateway, map the DTO, and translate failures with
   `isHttpError(error) ? mapHttpErrorToAppError(error) : toAppError(error)`. See
   [service](service.md).
7. **Keys then query** — `health/queries/health.keys.ts` exports `healthQueryKeys` (`all`,
   `status()`); `health/queries/health.query.ts` exports `buildHealthQueryOptions()`. See
   [query](query.md).
8. **Query hook** — `health/hooks/use-health-query.hook.ts` wraps `useAppQuery` and returns
   `HealthQueryView` with an `AppError | null`, never a raw query error.
9. **View-model hook** — `health/hooks/use-health-card.hook.ts` composes `useAppTranslation`,
   `useHealthQuery`, `formatDateTime` and `mapErrorCodeToI18nKey` into `HealthCardView`. See
   [hook](hook.md).
10. **Component** — `components/health-status-card/` renders the view model. Props type aliases the
    hook's view (`HealthStatusCardProps = HealthCardView`). See [component](component.md).
11. **Container** — `containers/health-card.container.tsx` is two lines: call the hook, spread into
    the component. See [container](container.md).
12. **Routes** — only if the module owns a screen: add the path to `APP_PATHS`, expose
    `<name>.paths.ts` builders and a `get<Name>RouteDefinitions()`. See [route](route.md).
13. **Registry** — add the getter to `getAppRouteDefinitions()` in
    `src/app/router/route-registry.ts`. The catch-all stays last.
14. **README** — copy the shape of `src/modules/health/README.md`: public surface table, anatomy,
    invariants, tests, related rules.
15. **index.ts** — export only what other layers need. Health exports four names; `quality:exports`
    rejects any non-export statement in the surface.

## Tests

- Colocate `*.test.ts(x)` beside every file: mapper, keys, gateway, service, hooks, component.
- Prove the slice, not the plumbing — `health.gateway.test.ts` asserts no `Authorization` header on
  the public probe; `use-health-card.hook.test.ts` asserts a raw `ECONNREFUSED` never reaches copy.
- Add a contract test mirroring `tests/contract/health.contract.test.ts`. See
  [contract-test](contract-test.md).
- Run: `npx vitest run --project unit src/modules/<name>`.

## Security / accessibility / native considerations

- Public endpoints set `skipAuth`; anything authenticated must not. Tokens never enter a module
  other than auth — see [secure-storage](secure-storage.md).
- Every user-visible string is an `I18N_KEYS` lookup and needs `en` **and** `ar` copy.
- No native surface unless the module talks to a plugin; then go through
  [capacitor-plugin](capacitor-plugin.md).

## Documentation delta

- `src/modules/<name>/README.md` (new).
- `context/module-anatomy.md` and `context/architecture-map.md` if the slice adds a new shape.
- `context/api-flow.md` when a new endpoint joins the boundary.

## Validation

```bash
npm run quality:architecture
npm run quality:exports
npm run quality:filenames
npm run quality:locales
npx vitest run --project unit src/modules/<name>
```

## Forbidden shortcuts

- Reaching into another module's internals instead of its `index.ts` —
  `architecture/no-cross-module-deep-imports`.
- Shipping without `index.ts` or `README.md` — `architecture/require-module-public-surface` plus
  `npm run quality:architecture`.
- Registering the route inside `app-router.routes.tsx` instead of the registry —
  `architecture/no-inline-routes`.
- Putting the slice's use case in `src/shared` or `src/app` —
  `architecture/no-feature-business-logic-in-shared` and
  `architecture/no-feature-business-logic-in-app`.

## Definition of done

- [ ] Every layer file carries its taxonomy suffix and `npm run quality:filenames` passes.
- [ ] `index.ts` exposes the minimum surface; nothing imports past it.
- [ ] The module README documents the public surface, anatomy, and invariants.
- [ ] Mapper, schema, keys and paths files sit at 100% coverage; the rest at 95%.
- [ ] `npm run quality:architecture` and `npm run quality:exports` pass.
