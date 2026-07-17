# ADR 0010: Secure token storage

- Status: Accepted
- Date: 2026-07-16
- Deciders: Architecture owner

## Context

Tokens are the app's most valuable secret and the easiest thing to leave lying around.
`localStorage` is readable by any injected script; Capacitor Preferences is plain unencrypted
storage on both platforms; and a token that reaches a log line, a URL, or an error report has
already leaked. Native platforms do offer real protection — the iOS Keychain and the Android
Keystore — but only through a plugin, and only on device. The web dev server has no equivalent, so
the honest options are to break web development or to admit the fallback in writing.

## Decision

`src/packages/secure-storage` is the sole owner of `@aparajita/capacitor-secure-storage`, and
`src/modules/auth/repositories/token.repository.ts` is the only caller in the app.

- On native (`Capacitor.isNativePlatform()`), values go to hardware-backed secure storage.
- On web, a documented development fallback keeps tokens in an in-memory `Map` with a
  `sessionStorage` mirror so a dev-server reload preserves the session. It logs a warning exactly
  once and is **not** secure at rest. This is a development affordance, not a production posture.
- The repository implements the HTTP owner's `TokenStore` interface, so `src/packages/http` depends
  on a contract, not on the auth module — the direction that keeps
  [ADR 0004](./0004-package-ownership.md) intact.
- Storage keys come from `STORAGE_KEYS` in `src/shared/config/storage-keys.constants.ts`.
- Tokens never enter Preferences, never enter a Zustand store (the session store holds status only),
  and never enter logs: `sanitizeHeadersForLog` redacts `authorization`, `cookie`, `set-cookie`, and
  `x-api-key`, and Sentry initializes with `sendDefaultPii: false`.

## Consequences

**Positive:** One file to audit for token persistence. The `TokenStore` interface makes tokens
injectable and testable without touching a device.

**Negative / cost:** The web fallback is genuinely less safe than native, and writing that down does
not make it safe — it makes it known. Web-mode security depends on the app not shipping the dev
fallback anywhere real. Every token read is async, so the request interceptor must await it on
every request.

**Enforcement:** `architecture/no-raw-capacitor-imports`,
`architecture/no-direct-storage-api-outside-platform`, `architecture/no-inline-storage-keys`,
`npm run quality:package-ownership`, and `npm run security:secrets` (Trivy secret scanning).
`tests/e2e/auth.spec.ts` asserts that a signed-in session never exposes tokens to `localStorage`.

## Alternatives considered

- `localStorage` / Preferences for tokens — rejected: unencrypted at rest and script-readable.
- Refresh token in an httpOnly cookie — rejected: cookie handling is unreliable across the
  Capacitor `https://` custom scheme on Android and `capacitor://` on iOS.
- Access token in memory only — rejected: every cold start would force a re-login, and the refresh
  token still needs a secure home regardless.

## Supersession

Revisit if the backend moves to a cookie/DPoP-style session, or if a web deployment becomes a
first-class production target — the fallback would then need replacing, not documenting.
