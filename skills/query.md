# Skill: Add a query

**Use when:** a screen needs remote data read from the API and cached.

## Required reading

- [rules/15 — Server state and queries](../rules/15-server-state-and-queries.md) — key builders and
  query ownership.
- [ADR 0008 — server state](../architecture/adrs/0008-tanstack-query-server-state-ownership.md) —
  why remote data belongs to TanStack Query and never lands in a store.
- [docs/eslint/no-inline-query-keys](../docs/eslint/no-inline-query-keys.md) — the rule behind the
  `*.keys.ts` requirement.
- [health.keys.ts](../src/modules/health/queries/health.keys.ts) and
  [health.query.ts](../src/modules/health/queries/health.query.ts) — the two-file split.

## Preconditions

- [ ] The service exists and returns domain types — see [service](service.md).
- [ ] The cache identity is decided: what varies the key (id, filter, locale) and what does not.
- [ ] The data is server-owned. If it is a user preference, use [store](store.md) instead.

## Files

```text
src/modules/<module>/queries/<module>.keys.ts     the key namespace and builders
src/modules/<module>/queries/<module>.query.ts    the options builder
src/modules/<module>/hooks/use-<thing>-query.hook.ts   the hook the UI sees
src/modules/<module>/index.ts                     edit: export the keys for cross-module invalidation
```

## Steps

1. **Keys first.** `health.keys.ts` is the template: a root `all: ['health'] as const` plus builders
   that spread it — `status: () => [...healthQueryKeys.all, 'status'] as const`. Spreading, not
   re-listing, is what makes `queryClient.invalidateQueries({ queryKey: healthQueryKeys.all })`
   sweep every child.
2. Parameterize builders that need it:
   `detail: (id: string) => [...keys.all, 'detail', id] as const`. An array literal passed to a
   query fails `architecture/no-inline-query-keys`.
3. **Options builder.** `health.query.ts` exports `buildHealthQueryOptions()` returning
   `{ queryKey: healthQueryKeys.status(), queryFn: () => getHealthStatus() }`. It stays React-free,
   so services and keys can be recomposed (prefetch, tests) without a component.
4. **Hook.** `use-health-query.hook.ts` calls `useAppQuery<HealthStatus>(buildHealthQueryOptions())`
   from `@/packages/query` — never `useQuery` directly (`architecture/no-raw-package-imports`).
5. Normalize the error in the hook: `error: query.error === null ? null : toAppError(query.error)`.
   The view type says `AppError | null`, so a raw error cannot reach a component.
6. Expose intent, not the query object: health returns
   `{ health, isLoading: query.isPending, error, refetch }` and wraps refetch as
   `() => { void query.refetch(); }` so callers need no promise handling.
7. Export the keys from `index.ts` (health does) when another module must invalidate them; keep the
   options builder internal.

## Tests

- `<module>.keys.test.ts` — a pure file at 100% per `vitest.config.ts`. Prove the root namespace,
  that a child key starts with it, and that each call returns a fresh array so callers cannot mutate
  the root.
- `<thing>-query.hook.test.ts` — mock the service (`vi.mock('../services/get-health.service')`) and
  drive it with `renderHookWithProviders`, which supplies a retry-disabled `QueryClient`.
- Prove: pending first render, resolved data, an `AppError` passthrough, a plain `Error` normalized
  to `APP_ERROR_CODE.Unexpected`, and that `refetch()` calls the service a second time.
- Run: `npx vitest run --project unit src/modules/<module>/queries src/modules/<module>/hooks`.

## Security / accessibility / native considerations

- Never key on a token or any secret; keys are cache identity and appear in devtools.
- The consuming hook must render a loading and an error state — the health card proves all three
  branches. See [component](component.md).

## Documentation delta

- The module README's public-surface table when the keys are exported — health lists
  `healthQueryKeys` as "Query-key builder for cache invalidation".
- `context/api-flow.md` when the query fronts a new endpoint.

## Validation

```bash
npm run lint
npx vitest run --project unit src/modules/<module>/queries
npm run test:coverage:per-file
```

## Forbidden shortcuts

- `useQuery({ queryKey: ['health', 'status'], … })` in a hook — `architecture/no-inline-query-keys`
  plus `architecture/no-raw-package-imports`.
- Copying fetched data into a Zustand store to "share" it —
  `architecture/no-server-state-in-client-store`; call the same query hook again and let the cache
  dedupe.
- Returning the `UseQueryResult` from the hook — the component would then read `data`/`isPending`
  itself, which is logic in a component.
- Calling the gateway from `queryFn` and skipping the service — nothing would normalize the error.

## Definition of done

- [ ] Keys derive from one `all` root and are the only source of query keys.
- [ ] The options builder is React-free and the hook wraps `useAppQuery`.
- [ ] The hook's error is an `AppError | null`.
- [ ] `<module>.keys.ts` sits at 100% coverage; the hook clears 95%.
- [ ] `npm run lint` and `npx vitest run --project unit` pass.
