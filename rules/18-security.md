# 18 — Security

> Authority: normative. Conflicts resolve in favor of ADRs and the security policy.

## Mandatory

- MUST store tokens only through `@/packages/secure-storage`, which uses hardware-backed storage on
  native and a documented, explicitly-warned memory + `sessionStorage` fallback for web development
  that is not secure at rest.
- MUST access tokens only through the auth module's `token.repository.ts`; it is the sole holder of
  `STORAGE_KEYS.authAccessToken` and `STORAGE_KEYS.authRefreshToken`.
- MUST name every persisted key in `STORAGE_KEYS` and pass the constant to the storage facade.
- MUST read configuration only from `@/packages/environment`, which parses `import.meta.env` through
  a Zod schema once, freezes it, and fails fast on an invalid environment.
- MUST treat every `VITE_*` value as public: it is embedded in the web bundle and readable by
  anyone.
- MUST validate any URL before it leaves the app: `isAllowedExternalUrl` enforces `https:` only and
  rejects embedded credentials; deep links go through the allowlist parser.
- MUST redact sensitive fields before they reach a log or a report — `token`, `secret`, `password`,
  `authorization`, `cookie`, `credential` are replaced with `[REDACTED]`.
- MUST keep `sendDefaultPii: false` in error reporting and keep reporting disabled without a DSN.

## Forbidden

- NEVER put a token in Preferences, a Zustand store, a log field, a query string, or a URL.
- NEVER touch `localStorage`, `sessionStorage`, or `indexedDB` outside the platform layer and the
  storage owners.
- NEVER read `import.meta.env` outside the environment owner, and never read `process.env` anywhere
  in `src/` — it does not exist in the browser and hides secrets in a bundle.
- NEVER put a secret in a `VITE_*` variable, and never commit a real `.env`.
- NEVER enable cleartext traffic or commit a `server.url` in `capacitor.config.ts`.

## Rationale

The refresh token is the crown jewel of a mobile client: it is long-lived, it survives restarts, and
it is trivially exfiltrated from web storage by any injected script. Confining it to a hardware-
backed store behind one repository means the number of places that could leak it is one, and that
place is reviewable. Redaction at the sink rather than at each call site is deliberate: developers
forget, a regex in the logger does not.

## Valid

```ts
// src/modules/auth/repositories/token.repository.ts
export function createAuthTokenRepository(): TokenStore {
  return {
    getAccessToken: () => getSecureValue(STORAGE_KEYS.authAccessToken),
    clearTokens: async () => {
      await removeSecureValue(STORAGE_KEYS.authAccessToken);
      await removeSecureValue(STORAGE_KEYS.authRefreshToken);
    },
  };
}
```

## Invalid

```ts
// src/modules/auth/store/session.store.ts
globalThis.localStorage.setItem('access-token', token); // web storage + raw key + a token
logger.info('logged in', { authorization: `Bearer ${token}` }); // secret in a log field
const apiKey = import.meta.env.VITE_SECRET_KEY; // env outside the owner, and a "secret" in a bundle
```

## Enforcement

| Mechanism                                                                                  | Command                    |
| ------------------------------------------------------------------------------------------ | -------------------------- |
| `architecture/no-inline-storage-keys`                                                      | `npm run lint`             |
| `architecture/no-direct-storage-api-outside-platform`                                      | `npm run lint`             |
| `architecture/no-import-meta-env-outside-environment`                                      | `npm run lint`             |
| `architecture/no-process-env-outside-tooling`                                              | `npm run lint`             |
| `security/detect-unsafe-regex`, `detect-eval-with-expression`, `detect-non-literal-regexp` | `npm run lint`             |
| Dependency vulnerabilities at high and above                                               | `npm run security:audit`   |
| Committed secrets                                                                          | `npm run security:secrets` |
| Vulnerabilities, secrets, and misconfiguration                                             | `npm run security:scan`    |
| Token lifecycle across refresh and failure                                                 | `npm run test:integration` |

Manual review where mechanical enforcement is impossible: threat modelling. No scanner will tell you
that a new endpoint returns another user's data, that a deep-link prefix opens an authenticated
screen, or that a redaction regex misses a field named `sessionKey`.

## Definition of done

- [ ] No secret entered a store, a log, a URL, or a `VITE_*` variable.
- [ ] Storage went through an owner facade with a `STORAGE_KEYS` constant.
- [ ] `npm run security:audit`, `security:secrets`, and `security:scan` all pass.

## Related

[13-http-and-nest-api](13-http-and-nest-api.md) · [12-routing-and-deep-links](12-routing-and-deep-links.md) ·
[27-observability](27-observability.md) · [../src/modules/auth/README.md](../src/modules/auth/README.md)

ADR: [0010](../architecture/adrs/0010-secure-token-storage.md).
