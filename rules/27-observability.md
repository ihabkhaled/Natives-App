# 27 — Observability

> Authority: normative. Conflicts resolve in favor of ADRs and the security policy.

## Mandatory

- MUST log through `@/packages/logger`: `createLogger(scope, sink)` returns an `AppLogger` with
  `debug`, `info`, `warn`, and `error`, and every message is prefixed with its scope.
- MUST obtain a scoped logger in application code from the platform facade —
  `getPlatformLogger('http')`, `getPlatformLogger('error-boundary')`.
- MUST pass context as structured fields, never as an interpolated sentence, so the sink can redact
  and a backend can index: `logger.warn('http request failed', { kind, status })`.
- MUST let the logger sanitize: `sanitizeLogFields` replaces any field whose key matches `token`,
  `secret`, `password`, `authorization`, `cookie`, or `credential` with `[REDACTED]`.
- MUST emit analytics through `@/packages/analytics` (`trackEvent`, `trackScreenView`) with event
  names from a `*.constants.ts` file.
- MUST report exceptions through `@/packages/error-reporting`, which stays disabled without a DSN,
  sets `sendDefaultPii: false`, and swallows its own failures so reporting can never crash the app.
- MUST propagate the correlation id: every request carries a fresh `X-Request-Id`, and an
  `HttpError`'s `requestId` survives onto the `AppError` for support.
- MUST log an error's `name` and code rather than its full object, and MUST keep the user-facing
  message a translated code (see [17-error-handling](17-error-handling.md)).

## Forbidden

- NEVER call `console` in `src/` — `no-console` is an error, and `src/packages/logger` is the one
  documented exception ([29-exceptions](29-exceptions.md)).
- NEVER pass a raw event name string to `trackEvent`, `trackScreenView`, `emit`, or `on`.
- NEVER log a token, a password, a full request body, or a raw error object.
- NEVER let a logging or reporting call sit on a hot path where its cost is unbounded.

## Rationale

Logs are the one place secrets leak by accident rather than by intent: someone logs a request to
debug it, and the bearer token is in the headers. Redaction at the sink means the mistake is caught
by a regex instead of by a reviewer's memory. Owning analytics behind a vendor-free seam means the
app can adopt or drop a provider without touching a single feature, and the console sink keeps the
default honest — nothing leaves the device until a DSN says so.

## Valid

```ts
// src/packages/http/http-client.factory.ts
deps.logger?.debug('http request', {
  method: config.method,
  url: config.url,
  headers: sanitizeHeadersForLog(config.headers.toJSON()), // Authorization redacted before it lands
});
```

## Invalid

```ts
// src/modules/auth/services/login.service.ts
console.log('login', credentials); // console in src/, and a password in a log
trackEvent('login_success'); // raw event name; belongs in auth-analytics.constants.ts
logger.error(`failed: ${JSON.stringify(error)}`); // raw error object, interpolated, unredactable
```

## Enforcement

| Mechanism                                      | Command                             |
| ---------------------------------------------- | ----------------------------------- |
| `no-console` on `src/**` (Node tooling exempt) | `npm run lint`                      |
| `architecture/no-inline-event-names`           | `npm run lint`                      |
| `architecture/no-undocumented-eslint-disable`  | `npm run lint`                      |
| Sentry owner dirs match the registry           | `npm run quality:package-ownership` |
| Redaction helpers at 100% coverage             | `npm run test:coverage:per-file`    |
| Committed secrets and tokens                   | `npm run security:secrets`          |

Manual review where mechanical enforcement is impossible: field names the redaction pattern does not
match. `sessionKey`, `refresh`, or `pin` sail straight through — a reviewer has to notice, and then
either rename the field or extend the pattern.

## Definition of done

- [ ] Every diagnostic goes through a scoped logger with structured fields.
- [ ] No raw event names, no raw error objects, and nothing sensitive in a field the pattern misses.
- [ ] Error reporting still degrades to a no-op without a DSN.

## Related

[18-security](18-security.md) · [17-error-handling](17-error-handling.md) ·
[13-http-and-nest-api](13-http-and-nest-api.md) · [29-exceptions](29-exceptions.md)
