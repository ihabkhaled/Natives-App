# Skill: Add a client-state store

**Use when:** genuinely client-owned state must be shared across screens — a preference, a status
flag.

## Required reading

- [rules/14 — State management](../rules/14-state-management.md) — persistence, versioning,
  migration.
- [ADR 0009 — client state](../architecture/adrs/0009-zustand-client-state-ownership.md) — the two
  legitimate Zustand categories: preferences and session status.
- [session.store.ts](../src/modules/auth/store/session.store.ts) — an in-memory status store.
- [settings.store.ts](../src/modules/settings/store/settings.store.ts) — a persisted, versioned,
  migrated store with schema validation.

## Preconditions

- [ ] The state is not server data. If the API is its source of truth, use [query](query.md).
- [ ] The state is not local to one screen — that is `useState` inside a hook.
- [ ] If it must survive a restart, you have a version number, a schema, and a migration plan.

## Files

```text
src/modules/<module>/store/<thing>.store.ts         the store
src/modules/<module>/store/<thing>.schema.ts        persisted payload shape (persisted only)
src/modules/<module>/store/<thing>.migrations.ts    version + migrate function (persisted only)
src/modules/<module>/store/<thing>.selectors.ts     pure derivations (optional)
src/shared/config/storage-keys.constants.ts         edit: the persistence key (persisted only)
```

## Steps

1. **In-memory store.** `createAppStore<State>` from `@/packages/state`. `session.store.ts` holds
   `status: SessionStatus` plus `markAuthenticated` / `markAnonymous`; actions live in the state
   object, so consumers select functions rather than importing setters.
2. Keep the state minimal and honest. The session store's comment states the boundary: "status only:
   never profile data (that is server state) and never tokens (secure storage)". A store that
   imports a query module fails `architecture/no-server-state-in-client-store`.
3. **Persisted store.** `createPersistedAppStore<State>(initializer, options)` with:
   - `storageKey: STORAGE_KEYS.settings` — a literal fails `architecture/no-inline-storage-keys`.
   - `version: SETTINGS_STORE_VERSION` — bump on every payload shape change.
   - `storage: createPreferencesStorageAdapter()` from `@/platform` — non-secrets only.
   - `partialize` — persist data, never actions:
     `(state) => ({ theme: state.theme, locale: state.locale })`.
4. **Schema the payload.** `settings.schema.ts` exports `persistedSettingsSchema` built from
   `schemaBuilder`. Storage is an untrusted boundary (ADR 0013): a user can edit it, an old build
   can have written it.
5. **Migrate defensively.** `migratePersistedSettings(persisted, fromVersion, defaults)` returns
   `defaults` when `fromVersion > SETTINGS_STORE_VERSION` (a downgrade) and when
   `safeParseWithSchema` fails. Corrupted storage must never crash startup.
6. **Selectors are pure files.** `selectIsDarkTheme(theme, systemPrefersDark)` takes plain arguments
   and returns a value; it does not read the store. `*.selectors.ts` is held to 100% coverage.
7. Consume through a hook, never in a component:
   `const markAuthenticated = useSessionStore((state) => state.markAuthenticated);` inside a
   `*.hook.ts`. `architecture/no-third-party-hooks-outside-hook-files` catches the rest.

## Tests

- `<thing>.store.test.ts` — drive actions via `useSessionStore.getState()` and assert transitions;
  reset state between tests so cases stay independent.
- `<thing>.migrations.test.ts` — a pure file at 100%: a valid v1 payload round-trips; garbage falls
  back to defaults; a future version falls back to defaults.
- `<thing>.selectors.test.ts` — every branch of the derivation (dark, light, system + both signals).
- Run: `npx vitest run --project unit src/modules/<module>/store`.

## Security / accessibility / native considerations

- Never persist secrets here. The Preferences adapter is plaintext; tokens go through
  [secure-storage](secure-storage.md).
- Persisted state is attacker-controllable on a rooted device — the schema is the defense, not a
  hope.
- Changing `STORAGE_KEYS.settings` orphans existing data; either migrate or accept the reset
  knowingly.

## Documentation delta

- `context/architecture-map.md` when a new store joins the client-state set.
- The module README's invariants stating what the store may never hold.
- `rules/14` if the persistence policy itself changes.

## Validation

```bash
npm run lint
npx vitest run --project unit src/modules/<module>/store
npm run test:coverage && npm run test:coverage:per-file
npm run quality:architecture
```

## Forbidden shortcuts

- Caching the fetched profile "to avoid a refetch" — `architecture/no-server-state-in-client-store`.
- `import { create } from 'zustand'` — `architecture/no-raw-package-imports`; the owner is
  `@/packages/state`.
- Persisting without `version` and `migrate` — the next shape change breaks every installed app.
- Persisting the whole state including actions — omit `partialize` and functions get serialized.

## Definition of done

- [ ] The state is client-owned, and the store's doc comment says what it must never hold.
- [ ] Persisted stores have a key from `STORAGE_KEYS`, a version, a schema, and a migration.
- [ ] Migration handles garbage and future versions without throwing.
- [ ] Migrations and selectors sit at 100% coverage.
- [ ] `npm run lint` and `npx vitest run --project unit` pass.
