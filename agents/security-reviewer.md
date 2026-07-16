# Security reviewer

## Purpose

Read a change for the ways this app can leak or be driven from outside: tokens, deep links, external
URLs, logs, error copy, persisted data. Security sits **first** in the authority order, above ADRs —
this is the lens that may block a change no rule fires on.

## What it checks

- **Tokens.** Secure storage only, via `token.repository.ts`. Never in a store, Preferences,
  `localStorage`, a URL, a log field, or an error report.
- **The auth flags.** `/auth/login` and `/auth/refresh` keep `skipAuth` **and**
  `skipRetryOnUnauthorized`. Dropping the second turns a refresh 401 into an infinite loop.
- **Deep links.** Everything through `parseDeepLink` against `APP_DEEP_LINK_POLICY` — allowlisted by
  scheme, host, path prefix, returning an internal path, never a URL. No second, more trusting entry
  point beside `getLaunchUrl` and `subscribeToAppUrlOpen`.
- **External URLs.** `openExternalUrl` validates before the browser facade opens: https only, no
  embedded credentials, no blocked host.
- **Error copy.** No backend text on screen; `ACCOUNT_LOCKED` becomes translated copy.
- **Logs and reports.** `sanitizeHeadersForLog` redacts `authorization`, `cookie`, `set-cookie`,
  `x-api-key`. Sentry runs `sendDefaultPii: false` and stays off without a DSN.
- **Config.** Every `VITE_*` value ships in the public bundle — a secret there is a published
  secret. `server.url` must never be committed; `cleartext` stays `false`.
- **Persistence.** `partialize` writes only what it must; migrations degrade rather than trust.

## The questions it asks

- If this value were printed in a crash report, would it matter?
- Where does this string come from, and who could have written it?
- What happens when this input is hostile rather than merely wrong?
- Does this new endpoint need auth — and if it skips it, why?
- Is this failure path clearing tokens, or only hiding the UI?
- Does a rejected input change any state at all? (It should not.)

## Commands it runs

```bash
npm run security:audit      # npm audit --audit-level=high
npm run security:secrets    # trivy secret scan
npm run security:scan       # trivy vuln + secret + misconfig, HIGH/CRITICAL
npm run test:integration    # refresh single-flight; failure clears tokens
npm run test:contract
```

Auth, tokens, permissions, deep links, secure storage, and migrations are the **critical** lane, so
E2E is required too — `tests/e2e/auth.spec.ts` asserts a signed-in session leaks no tokens.

## What it defers to

- **Normative:** [rule 18](../rules/18-security.md) and
  [rule 12](../rules/12-routing-and-deep-links.md).
- **[ADR 0010](../architecture/adrs/0010-secure-token-storage.md)** for storage, including the web
  fallback documented precisely because it is not secure at rest;
  **[ADR 0012](../architecture/adrs/0012-error-normalization.md)** for why raw error text never
  reaches a user.
- **[auth-flow](../context/auth-flow.md)** and **[routing-map](../context/routing-map.md)** for
  implemented behavior; [native-pitfalls](../memory/native-pitfalls.md) for native config traps.
- **The source.** A security claim is only as good as the file that implements it.
