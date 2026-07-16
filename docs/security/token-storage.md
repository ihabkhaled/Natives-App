# Token storage

## The rule

Access and refresh tokens live **only** in the secure-storage owner
([`src/packages/secure-storage/`](../../src/packages/secure-storage/)), reached through the auth
module's token repository. They never touch Capacitor Preferences, `localStorage`, Zustand, the
query cache, logs, or URLs.

## Native

`@aparajita/capacitor-secure-storage` backs onto the platform keystore (Android Keystore, iOS
Keychain). This is the real protection.

## Web — read this before shipping a web build

Browsers have no equivalent of a keystore. The web fallback keeps tokens in a module-scoped `Map`
(primary) with a `sessionStorage` mirror so a dev-server reload does not end your session. It logs
a one-time warning on first use:

```text
[secure-storage] Using the browser-development secure-storage fallback; not secure at rest.
```

**This fallback is not secure at rest.** Any script running on the origin can read
`sessionStorage`. It exists so web development works without a native shell. Before shipping a
production _web_ target, decide deliberately:

- Prefer httpOnly, `Secure`, `SameSite` cookies issued by the backend, or
- accept the XSS exposure explicitly and compensate (strict CSP, no third-party scripts, short
  token TTLs, refresh rotation).

The native app is the intended production target; the web build is a development and testing
surface unless you make that decision.

## What the E2E suite proves

[`tests/e2e/auth.spec.ts`](../../tests/e2e/auth.spec.ts) asserts that after a real login no token
value appears in `localStorage`. That is a regression guard against the most common leak, not proof
the web fallback is secure — see above.

## Lifecycle

| Event                      | Behavior                                                          |
| -------------------------- | ----------------------------------------------------------------- |
| Login success              | Both tokens written through the repository.                       |
| Access token expired (401) | Single-flight refresh, then the original request replays once.    |
| Refresh rejected / absent  | Tokens cleared, session → anonymous, guards redirect to `/login`. |
| Logout                     | Server call is best-effort; local tokens are cleared regardless.  |

The single-flight coordinator
([`token-refresh.coordinator.ts`](../../src/packages/http/token-refresh.coordinator.ts)) guarantees
concurrent 401s produce exactly one refresh call — verified in
[`tests/integration/token-refresh.integration.test.ts`](../../tests/integration/token-refresh.integration.test.ts).

## Redaction

- `Authorization`, `Cookie`, and `X-Api-Key` headers are redacted before logging
  ([`http-log.helper.ts`](../../src/packages/http/helpers/http-log.helper.ts)).
- Any log field whose key matches `token|secret|password|authorization|cookie|credential` is
  replaced with `[REDACTED]` ([`logger.helper.ts`](../../src/packages/logger/logger.helper.ts)).
- Tokens are never placed in query strings or route params.

## Review checklist

- [ ] No new code path reads or writes tokens outside the repository.
- [ ] No token value reaches a log, URL, analytics event, or error report.
- [ ] Storage keys come from `STORAGE_KEYS` (enforced by `architecture/no-inline-storage-keys`).
- [ ] `npm run security:secrets` passes.
