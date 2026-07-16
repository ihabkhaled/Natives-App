# ADR 0008: TanStack Query owns server state

- Status: Accepted
- Date: 2026-07-16
- Deciders: Architecture owner

## Context

Remote data is not application state — it is a cache of something another system owns. Modelling it
as state means hand-rolling loading flags, staleness, retry policy, deduplication, and invalidation
in every feature, and getting them subtly different each time. The specific trap this repository
guards against is copying a fetched user profile into a client store: two sources of truth, one of
which is silently stale, plus a persisted store that now leaks server data to disk.

## Decision

TanStack Query owns everything that comes from the network. `src/packages/query` is the sole owner
of the vendor; `useQuery` and `useMutation` are reachable only through
`hooks/use-app-query.hook.ts` and `hooks/use-app-mutation.hook.ts`.

- `query-client.factory.ts` sets the shared policy: `staleTime` 30s, no refetch on window focus,
  mutations never retry, and queries retry at most twice — never for a 4xx, since a client error
  will not fix itself (`isRetryableFailure`).
- The app holds one client via `src/app/bootstrap/query-client.factory.ts`, provided by
  `AppProviders`; devtools mount only when the environment flag and dev mode both agree.
- Modules follow a fixed shape: `queries/<name>.keys.ts` builds hierarchical keys,
  `queries/<name>.query.ts` builds options, `hooks/use-*-query.hook.ts` adapts the result to a view
  model, and `mutations/use-*-mutation.hook.ts` holds writes. `src/modules/health/` is the
  reference.
- Query hooks convert failures to `AppError` at the edge, so screens never see a vendor error.

## Consequences

**Positive:** Caching, deduplication, and invalidation are solved once. Query keys are builders, so
invalidation is a typed call rather than a guessed array literal.

**Negative / cost:** The key-builder + options-builder + hook trio is three files for one GET.
Query state lives outside React state, so debugging staleness means reading cache semantics, not
component code. The 30s `staleTime` is a global guess that individual screens may need to override.

**Enforcement:** `architecture/no-raw-package-imports` (the registry pins `@tanstack/react-query`
to `@/packages/query`), `architecture/no-inline-query-keys`,
`architecture/no-server-state-in-client-store` — which rejects any `store` file importing a
`gateways/`, `queries/`, or `mutations/` path. See
[no-inline-query-keys](../../docs/eslint/no-inline-query-keys.md).

## Alternatives considered

- Zustand or Redux for remote data — rejected: it means reimplementing cache invalidation and
  request deduplication by hand, badly.
- `useEffect` + `useState` fetching — rejected: no deduplication, no retry policy, and a race on
  every remount.
- RTK Query or SWR — rejected on stack fit; Query's mutation and invalidation model matches the
  NestJS resource shape most directly.

## Supersession

Revisit if the app adopts a realtime-first data model where the Socket.IO owner
(`src/packages/realtime`) pushes canonical state and the request/response cache becomes secondary.
