# 15 — Server state and queries

> Authority: normative. Conflicts resolve in favor of ADRs and the security policy.

## Mandatory

- MUST treat remote data as cache: TanStack Query owns it, through `@/packages/query`.
- MUST build every query key in the module's `*.keys.ts` as a hierarchical builder — `all`, then
  narrowing factories — so an invalidation can target a branch:
  `healthQueryKeys.all` → `healthQueryKeys.status()`.
- MUST export a module's key builder from its `index.ts` when other modules invalidate its cache.
- MUST assemble query options in a `*.query.ts` builder whose `queryFn` calls a service, never a
  gateway — the service is where transport errors become `AppError`.
- MUST consume Query through the owner hooks `useAppQuery` and `useAppMutation`, wrapped once more
  in a module hook such as `useHealthQuery`.
- MUST let the app-wide client own the defaults: two attempts, no retry on 4xx, a 30 second
  `staleTime`, no refetch on window focus, and no mutation retries.
- MUST invalidate or reset the caches an operation makes stale — logout clears cached server state
  rather than leaving the previous user's data addressable.

## Forbidden

- NEVER write an inline `queryKey: ['health', 'status']` array; keys come from the builder.
- NEVER import `@tanstack/react-query` outside `src/packages/query`.
- NEVER copy a query result into a Zustand store to "share" it — share the key and let Query
  deduplicate.
- NEVER call a gateway straight from a `queryFn`, skipping the service's error translation.

## Rationale

Query keys are the cache's addressing scheme; the moment they are typed inline, invalidation becomes
grep-driven and stale UI becomes a permanent low-grade bug. A builder makes the key hierarchy
explicit and refactorable. Routing `queryFn` through a service preserves the one-way translation of
transport errors into domain errors, which is what lets a screen render a translated message from a
code instead of inspecting a status number.

## Valid

```ts
// src/modules/health/queries/health.keys.ts
export const healthQueryKeys = {
  all: ['health'] as const,
  status: () => [...healthQueryKeys.all, 'status'] as const,
};
```

```ts
// src/modules/health/queries/health.query.ts
export function buildHealthQueryOptions() {
  return { queryKey: healthQueryKeys.status(), queryFn: () => getHealthStatus() };
}
```

## Invalid

```ts
// src/modules/health/hooks/use-health-query.hook.ts
import { useQuery } from '@tanstack/react-query'; // owner is @/packages/query

export function useHealthQuery() {
  // inline key, and a gateway call that skips the service's error translation
  return useQuery({ queryKey: ['health', 'status'], queryFn: () => requestHealth() });
}
```

## Enforcement

| Mechanism                                              | Command                             |
| ------------------------------------------------------ | ----------------------------------- |
| `architecture/no-inline-query-keys`                    | `npm run lint`                      |
| `architecture/no-raw-package-imports`                  | `npm run lint`                      |
| `architecture/no-third-party-hooks-outside-hook-files` | `npm run lint`                      |
| `*.keys.ts` at 100% coverage                           | `npm run test:coverage:per-file`    |
| Query owner dir matches the registry                   | `npm run quality:package-ownership` |

Manual review where mechanical enforcement is impossible: invalidation completeness. No rule can
know that a successful mutation should have expired three other keys; that is a reviewer reading the
mutation's `onSuccess` against the module's key tree.

## Definition of done

- [ ] The key comes from a builder, and the builder is exported if other modules need it.
- [ ] The `queryFn` calls a service, so errors arrive as `AppError`.
- [ ] Every mutation that changes server state invalidates or resets the keys it affects.

## Related

[14-state-management](14-state-management.md) · [13-http-and-nest-api](13-http-and-nest-api.md) ·
[06-services-use-cases](06-services-use-cases.md) ·
[../docs/eslint/no-inline-query-keys.md](../docs/eslint/no-inline-query-keys.md)

ADR: [0008](../architecture/adrs/0008-tanstack-query-server-state-ownership.md).
