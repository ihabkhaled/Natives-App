# Skill: Add a repository

**Use when:** a module must persist or read local data behind a port instead of touching storage.

## Required reading

- [rules/07 — Gateways and repositories](../rules/07-gateways-repositories.md) — the
  persistence-port contract.
- [rules/18 — Security](../rules/18-security.md) — which storage is allowed for which data.
- [ADR 0010 — Secure token storage](../architecture/adrs/0010-secure-token-storage.md) — the
  decision the auth repository implements.
- [token.repository.ts](../src/modules/auth/repositories/token.repository.ts) — the only repository
  in the codebase, and the shape to copy.

## Preconditions

- [ ] The data is genuinely local. Anything the server owns is server state — see [query](query.md).
- [ ] The sensitivity call is made: secrets go through `@/packages/secure-storage`; preferences go
      through `createPreferencesStorageAdapter()` — see [secure-storage](secure-storage.md).
- [ ] The consumer's port interface exists (`TokenStore` in `@/packages/http`) or you are defining
      one.

## Files

```text
src/modules/<module>/repositories/<thing>.repository.ts
src/shared/config/storage-keys.constants.ts    edit: declare every key you persist
src/modules/<module>/index.ts                  edit: export the factory if a foreign layer injects it
```

## Steps

1. Declare keys centrally first. `STORAGE_KEYS` already holds `authAccessToken`, `authRefreshToken`
   and `settings`; a literal key at a storage call fails `architecture/no-inline-storage-keys`.
2. Implement the port an owner already defines. `createAuthTokenRepository(): TokenStore` returns
   `getAccessToken`, `getRefreshToken`, `setTokens`, `clearTokens` — the exact interface
   `@/packages/http` needs, so the HTTP owner never learns where tokens live.
3. Route every read and write through a facade: `getSecureValue` / `setSecureValue` /
   `removeSecureValue` for secrets. Calling `localStorage` or `Preferences` here fails
   `architecture/no-direct-storage-api-outside-platform` and
   `architecture/no-raw-capacitor-imports`.
4. Keep it React-free (`architecture/no-react-in-gateways` covers `*.repository.ts` too) and free of
   business rules — the repository stores what it is given.
5. Expose a factory plus a lazily memoized accessor when a singleton is needed:

   ```ts
   let sharedRepository: TokenStore | null = null;

   export function getAuthTokenRepository(): TokenStore {
     sharedRepository ??= createAuthTokenRepository();
     return sharedRepository;
   }
   ```

   The factory keeps tests injectable; the accessor keeps callers simple.

6. Export the factory from `index.ts` only if another layer injects it. Auth exports both
   `createAuthTokenRepository` and `getAuthTokenRepository` because `start-app.ts` passes the latter
   into `createHttpClient` as `tokenStore`.
7. Write a doc comment naming the storage tier and the rule that forces it — the token repository's
   comment says tokens "never touch Preferences, logs, or URLs".

## Tests

- `<thing>.repository.test.ts`, colocated. Mock the storage facade
  (`vi.mock('@/packages/secure-storage')`) and assert the exact keys used.
- Prove: reads return `null` when absent; `setTokens` writes both keys; `clearTokens` removes both;
  and the memoized accessor returns the same instance twice.
- For a consumer-side double use `createMemoryTokenStore` from `tests/factories/http.factory.ts` —
  it implements `TokenStore` with a `snapshot()` for assertions.
- Run: `npx vitest run --project unit src/modules/<module>/repositories`.

## Security / accessibility / native considerations

- Tokens have exactly one home: `@/packages/secure-storage`. The documented web-development fallback
  (memory plus a sessionStorage mirror) is **not secure at rest** — see
  [docs/security/token-storage](../docs/security/token-storage.md).
- Persisted non-secrets must be versioned and migrated — see [store](store.md).
- `tests/e2e/auth.spec.ts` asserts no token string ever appears in `localStorage`; keep it that way.

## Documentation delta

- The module README's public surface if the factory is exported.
- `context/auth-flow.md` when the token lifecycle changes.
- `docs/security/token-storage.md` if the storage tier or fallback behavior changes.

## Validation

```bash
npm run quality:architecture
npx vitest run --project unit src/modules/<module>/repositories
npm run security:secrets
npm run test:e2e
```

## Forbidden shortcuts

- Reaching for `@capacitor/preferences` because it is simpler —
  `architecture/no-raw-capacitor-imports`; and it would put tokens in plaintext.
- Inlining `'auth.access-token'` — `architecture/no-inline-storage-keys`.
- Caching the user profile here — that is server state
  (`architecture/no-server-state-in-client-store`).
- Letting a second module read tokens — auth is the only module that touches them.

## Definition of done

- [ ] Every key resolves through `STORAGE_KEYS`.
- [ ] The repository implements an owner-defined port and imports only a storage facade.
- [ ] The sensitivity tier is correct and documented in the file's doc comment.
- [ ] `npm run quality:architecture` and `npx vitest run --project unit` pass.
