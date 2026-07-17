# 14 — State management

> Authority: normative. Conflicts resolve in favor of ADRs and the security policy.

## Mandatory

- MUST classify state before writing it: server data belongs to TanStack Query, client state to a
  Zustand store, ephemeral view state to the screen hook, and derived values to a selector.
- MUST create stores through `@/packages/state` — `createAppStore` for memory, and
  `createPersistedAppStore` for anything that survives a restart.
- MUST hold client state at the smallest scope that works; a store is for genuinely app-global
  state such as session status or preferences.
- MUST give a persisted store a `storageKey` from `STORAGE_KEYS`, a numeric `version`, a `migrate`
  function, and a `partialize` that names exactly the fields worth persisting.
- MUST validate a persisted payload with a schema on read, and MUST degrade a corrupt or unknown
  payload to defaults instead of crashing startup.
- MUST persist through the platform storage adapter (`createPreferencesStorageAdapter`), never a
  browser global.
- MUST put derivation in a pure `*.selectors.ts` file — `selectIsDarkTheme(preference, systemSignal)`
  — so it is testable without a React tree.

## Forbidden

- NEVER import a gateway, query, or mutation from a `*.store.ts`; a store that fetches is a cache
  with no invalidation story.
- NEVER keep a user profile, a list of entities, or any other server-owned data in a store — cache
  it in Query and read it there.
- NEVER persist tokens, secrets, functions, or server state; `partialize` is the allowlist.
- NEVER bump a persisted payload's shape without bumping `version` and extending `migrate`.

## Rationale

The single most expensive mistake in a React app is duplicating server data into a client store: the
copy has no staleness model, no refetch, and no invalidation, so it drifts and the bugs look like
ghosts. Splitting ownership — Query for remote, Zustand for local — is what makes cache
invalidation a solved problem rather than an app-wide discipline. Versioned, schema-validated
persistence exists because a shipped app meets payloads written by versions that no longer exist.

## Valid

```ts
// src/modules/auth/store/session.store.ts
export const useSessionStore = createAppStore<SessionState>((set) => ({
  status: SESSION_STATUS.Unknown, // status only: no profile, no tokens
  markAuthenticated: () => {
    set({ status: SESSION_STATUS.Authenticated });
  },
}));
```

## Invalid

```ts
// src/modules/auth/store/session.store.ts
import { requestCurrentUser } from '../gateways/auth.gateway'; // server state in a client store

export const useSessionStore = createAppStore<SessionState>((set) => ({
  user: null,
  accessToken: null, // tokens belong in secure storage
  load: async () => {
    set({ user: await requestCurrentUser() });
  },
}));
```

## Enforcement

| Mechanism                                               | Command                             |
| ------------------------------------------------------- | ----------------------------------- |
| `architecture/no-server-state-in-client-store`          | `npm run lint`                      |
| `architecture/no-inline-storage-keys`                   | `npm run lint`                      |
| `architecture/no-direct-storage-api-outside-platform`   | `npm run lint`                      |
| `*.selectors.ts` and `*.migrations.ts` at 100% coverage | `npm run test:coverage:per-file`    |
| Zustand owner dir matches the registry                  | `npm run quality:package-ownership` |

Manual review where mechanical enforcement is impossible: the store rule matches imports from
`/gateways/`, `/queries/`, `/mutations/` and the matching suffixes. A store handed server data as a
plain argument by a hook is invisible to it — that shape has to be caught by a reader.

## Definition of done

- [ ] The new state has one owner, and it is the right one for its lifecycle.
- [ ] Persisted state has a key, a version, a migration, a schema, and a `partialize` allowlist.
- [ ] Derivations live in pure selectors with full coverage.

## Related

[15-server-state-and-queries](15-server-state-and-queries.md) · [18-security](18-security.md) ·
[16-forms-and-validation](16-forms-and-validation.md) ·
[../src/modules/settings/README.md](../src/modules/settings/README.md)

ADR: [0009](../architecture/adrs/0009-zustand-client-state-ownership.md).
