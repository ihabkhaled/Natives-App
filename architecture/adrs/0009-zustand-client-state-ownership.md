# ADR 0009: Zustand owns client state

- Status: Accepted
- Date: 2026-07-16
- Deciders: Architecture owner

## Context

With server state assigned to TanStack Query
([ADR 0008](./0008-tanstack-query-server-state-ownership.md)), what genuinely remains is small: the
user's theme and locale preference, and whether a session exists. That residue still needs a home
that survives navigation, is readable outside React (startup code, services), and can persist
selectively. React Context re-renders whole subtrees and cannot be read from a service; a full Redux
setup is disproportionate to two values.

Persistence adds its own force: anything written to disk will eventually be read back in a shape the
code no longer expects — a build from six months ago, a half-written value, a renamed field.

## Decision

Zustand, owned exclusively by `src/packages/state`, with two factories:

- `createAppStore` for in-memory stores.
- `createPersistedAppStore` for persisted ones, which requires a `storageKey`, a `version`, a
  `migrate` function, and an injected `StateStorageAdapter` — persistence cannot be enabled without
  declaring a migration.

Exactly two stores exist, and the boundary between them is the point:

- `src/modules/settings/store/settings.store.ts` — theme and locale, persisted through
  `createPreferencesStorageAdapter()` (Capacitor Preferences). `partialize` writes only `theme` and
  `locale`; `settings.migrations.ts` validates the payload against `settings.schema.ts` and falls
  back to defaults when it is corrupt or from a newer version, so bad data degrades instead of
  crashing startup. Derivation stays pure in `settings.selectors.ts`.
- `src/modules/auth/store/session.store.ts` — the session _status_ only
  (`unknown` / `authenticated` / `anonymous`), in memory, never persisted.

Explicitly not in stores: tokens (secure storage — [ADR 0010](./0010-secure-token-storage.md)), the
user profile (server state), form state (React Hook Form), and derived values.

## Consequences

**Positive:** `useSessionStore.getState()` works from `bootstrap-session.service.ts` and
`auth-failure.service.ts` with no provider. Preference changes re-render only their subscribers.
A corrupt persisted payload can never brick a cold start.

**Negative / cost:** Two state systems means contributors must know which one applies before writing
a line. Every persisted schema change needs a migration and a version bump. Reading stores outside
React is powerful and equally easy to abuse.

**Enforcement:** `architecture/no-server-state-in-client-store` (store files may not import
gateways, queries, or mutations), `architecture/no-raw-package-imports` pinning `zustand` to
`@/packages/state`, `architecture/no-inline-storage-keys` forcing `STORAGE_KEYS`, and 100% coverage
on `*.selectors.ts` / `*.migrations.ts` under the pure-file policy.

## Alternatives considered

- React Context for preferences — rejected: unreadable from services and re-renders the tree.
- Redux Toolkit — rejected: the boilerplate cost dwarfs two values.
- Persisting the whole store — rejected: `partialize` exists precisely so functions and transient
  state never reach disk.

## Supersession

Revisit if client-global state grows past a handful of slices, or if preferences need to sync
across devices — which would make them server state and move them under ADR 0008.
