# State ownership map

Which system owns which state, and — more usefully — what is deliberately in neither.

## The split

| State                        | Owner                | Lives in                                                |
| ---------------------------- | -------------------- | ------------------------------------------------------- |
| Anything from the network    | TanStack Query       | `src/packages/query` + module `queries/`                |
| Theme + locale preference    | Zustand (persisted)  | `src/modules/settings/store/settings.store.ts`          |
| Session status               | Zustand (in memory)  | `src/modules/auth/store/session.store.ts`               |
| Tokens                       | Secure storage       | `src/modules/auth/repositories/token.repository.ts`     |
| Form values + errors         | React Hook Form      | `src/packages/forms`                                    |
| Connectivity                 | Capacitor Network    | `src/platform/network/hooks/use-network-status.hook.ts` |
| Route location               | React Router / Ionic | `src/packages/router`                                   |
| Ephemeral UI (open, focused) | React local state    | the owning `*.hook.ts`                                  |

Decisions: [ADR 0008](../architecture/adrs/0008-tanstack-query-server-state-ownership.md) for server
state, [ADR 0009](../architecture/adrs/0009-zustand-client-state-ownership.md) for client state.

## Server state — TanStack Query

Everything the backend owns. The client caches it; it never re-homes it.

- One `QueryClient` (`src/app/bootstrap/query-client.factory.ts`), configured by
  `src/packages/query/query-client.factory.ts`: `staleTime` 30s, no refetch on focus, mutations
  never retry, queries retry twice but never on a 4xx — a client error will not fix itself.
- `useQuery`/`useMutation` are reachable only through `use-app-query.hook.ts` /
  `use-app-mutation.hook.ts`.
- Keys are builders, never literals: `healthQueryKeys.all` → `['health']`, `.status()` →
  `['health', 'status']`. Hierarchy is what makes invalidation a typed call.
- The authenticated profile is server state — `use-current-user-query.hook.ts`, not the session
  store.

## Client-global state — Zustand

Exactly two stores exist. The list is short because most candidates belong somewhere else.

**Settings** (persisted). Theme and locale, written through
`createPreferencesStorageAdapter()` (Capacitor Preferences) under `STORAGE_KEYS.settings`. Three
properties matter:

- `partialize` persists **only** `theme` and `locale` — actions, derived values, and anything
  transient never reach disk.
- `settings.migrations.ts` parses the payload against `settings.schema.ts` and returns defaults when
  it is corrupt or from a newer version. A stale payload degrades; it does not brick startup.
- Derivation is pure and separate: `selectIsDarkTheme(theme, systemPrefersDark)` in
  `settings.selectors.ts` combines preference with the system signal.

**Session** (in memory). `status` only — `unknown` / `authenticated` / `anonymous` — with
`markAuthenticated()` and `markAnonymous()`. It is deliberately readable outside React:
`bootstrap-session.service.ts` and `auth-failure.service.ts` both call
`useSessionStore.getState()`, which is how the HTTP owner's auth-failure callback reaches the
session without a provider.

## What is explicitly NOT in a store

This is the part worth reading twice. Each exclusion is a mistake this architecture has a rule for.

- **Tokens.** Secure storage only. A Zustand store is memory a persist middleware can quietly write
  to disk ([ADR 0010](../architecture/adrs/0010-secure-token-storage.md)).
- **The user profile.** Server state. Copying it into the session store creates a second, silently
  stale source of truth — and a persisted one would leak server data to disk.
- **Loading and error flags for remote calls.** Query owns them. A hand-rolled `isLoading` beside a
  query is a bug waiting for a race.
- **Form state.** React Hook Form owns values, touched, and errors until submit.
- **Derived values.** Computed in a selector or a hook, never stored. Stored derivations go stale.
- **Route location.** The router owns it.
- **Connectivity.** The network owner's hook, seeded from a snapshot and updated by subscription.

`architecture/no-server-state-in-client-store` enforces the first three mechanically: a `store` file
that imports anything under `gateways/`, `queries/`, or `mutations/` — or any `.gateway`, `.query`,
`.mutation` path — fails lint. The rule is structural, so it catches the intent, not just the name.

## Where each kind is read

```text
component   ← props only, never a store
hook        ← useAppQuery / useSessionStore / useSettingsStore / useNetworkStatus
service     ← useSessionStore.getState()   (React-free; no hooks)
startup     ← bootstrapSessionFromStoredTokens() seeds session before first render
```

Adding new client-global state: prove it is not server state, not derived, and not local first. If
it must persist, it needs a schema, a version, and a migration — `createPersistedAppStore` will not
compile without them.
