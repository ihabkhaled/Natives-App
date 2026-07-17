# Skill: Store a secret securely

**Use when:** a token, key, or any other secret must survive beyond a single page load.

## Required reading

- [rules/18 — Security](../rules/18-security.md) — the storage tiers and what may live in each.
- [ADR 0010 — Secure token storage](../architecture/adrs/0010-secure-token-storage.md) — one
  repository, one storage owner.
- [docs/security/token-storage](../docs/security/token-storage.md) — the tiers and the web fallback,
  documented.
- [secure-storage.facade.ts](../src/packages/secure-storage/secure-storage.facade.ts) — the native
  path and the development fallback, side by side.
- [token.repository.ts](../src/modules/auth/repositories/token.repository.ts) — the only consumer.

## Preconditions

- [ ] It is genuinely a secret. Theme and locale are not; they belong in [store](store.md).
- [ ] You have read the fallback caveat below and accept it, or you are gating the feature to
      native.
- [ ] The key is (or will be) declared in `STORAGE_KEYS`.

## Files

```text
src/shared/config/storage-keys.constants.ts        edit: declare the key
src/modules/<module>/repositories/<thing>.repository.ts   the only place that calls the facade
src/packages/secure-storage/                       the owner — edit only to change the tier itself
```

## Steps

1. **Declare the key** in `src/shared/config/storage-keys.constants.ts` alongside `authAccessToken`
   and `authRefreshToken`. A literal at a call site fails `architecture/no-inline-storage-keys`.
2. **Use the owner, only the owner.** `getSecureValue(key)`, `setSecureValue(key, value)` and
   `removeSecureValue(key)` from `@/packages/secure-storage`. Nothing else may touch secret storage:
   `architecture/no-direct-storage-api-outside-platform` blocks `localStorage`/`sessionStorage`, and
   `architecture/no-raw-capacitor-imports` blocks `@capacitor/preferences`.
3. **Never Preferences.** `createPreferencesStorageAdapter()` exists for the settings store and says
   so in its comment: "Non-sensitive data only; tokens use the secure-storage owner." Preferences is
   plaintext on both platforms.
4. **Know the web fallback and its limit.** On native, the facade calls `SecureStorage`
   (hardware-backed keystore/keychain). Off-native it falls back to an in-memory `Map` plus a
   `sessionStorage` mirror so a dev-server reload keeps the session — and it logs a one-time warning
   saying it is **not secure at rest**. That fallback is for web development. Do not treat a web
   build as a secure vault, and do not remove the warning to quiet the console.
5. **Wrap access in a repository**, never call the facade from a hook or service directly.
   `createAuthTokenRepository()` returns a `TokenStore`, which is what `createHttpClient` takes as
   `tokenStore` in `start-app.ts` — the HTTP owner never learns where tokens live. See
   [repository](repository.md).
6. **Clear on the way out.** `logoutUser` calls `clearTokens()` even when the server logout rejects;
   a secret that outlives its session is the bug this ordering prevents.
7. Never put the secret anywhere else on its way through: not a query key, not a URL, not an
   analytics property, not a log field. `sanitizeLogFields` in `@/packages/logger` redacts, but the
   discipline is not to pass it in the first place.

## Tests

- `<thing>.repository.test.ts` — mock `@/packages/secure-storage` and assert the exact
  `STORAGE_KEYS` values passed, that both keys are written and both removed, and that a missing
  value reads `null`.
- Consumers take `createMemoryTokenStore(buildTokenPair())` from `tests/factories/http.factory.ts` —
  it satisfies `TokenStore` and exposes `snapshot()` so a test can assert what was persisted.
  `token-refresh.integration.test.ts` uses it to prove rotation.
- `tests/e2e/auth.spec.ts` holds the standing proof:
  `expect(localStorageDump).not.toContain('mock-access-token')`. Keep that test passing.
- Run: `npx vitest run --project unit src/modules/<module>/repositories`.

## Security / accessibility / native considerations

- This is the **critical** risk lane every time. Run the integration, contract, E2E and secret
  gates.
- `npm run security:secrets` (Trivy) scans the tree for committed secrets — never hard-code a real
  token in a fixture; use the `MOCK_TOKENS` constants.
- A secret in `sessionStorage` is readable by any injected script. That is precisely why the
  fallback is documented, warned about, and confined to development.
- Changing a `STORAGE_KEYS` secret key orphans the old value on device — clear the old key too.

## Documentation delta

- `docs/security/token-storage.md` if the tier, the fallback, or the key set changes.
- `context/auth-flow.md` for lifecycle changes.
- The module README's invariants — auth records that it "is the only module that touches tokens".

## Validation

```bash
npm run security:secrets
npm run security:scan
npx vitest run --project unit src/modules/<module>/repositories
npm run test:integration
npm run test:e2e
```

## Forbidden shortcuts

- `localStorage.setItem('token', …)` — `architecture/no-direct-storage-api-outside-platform`; and it
  is readable forever by any script on the origin.
- Preferences "because secure storage is awkward on web" — plaintext at rest on the device.
- Putting the token in a query key or an `options.params` — it lands in devtools and server logs.
- Silencing the fallback warning — it is the only signal that a build is not storing secrets
  securely.
- A second module reading tokens — auth owns them; inject a `TokenStore` port instead.

## Definition of done

- [ ] The secret is reached only through `@/packages/secure-storage`, behind a repository.
- [ ] Its key is declared in `STORAGE_KEYS`.
- [ ] It is cleared on logout even when the server call fails.
- [ ] No test, fixture, log, URL, or query key contains a real secret.
- [ ] `npm run security:secrets` and the E2E localStorage assertion pass.
