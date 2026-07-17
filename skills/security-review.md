# Skill: Run a security review

**Use when:** a change touches auth, tokens, storage, permissions, deep links, URLs, or secrets.

## Required reading

- [rules/18 — Security](../rules/18-security.md) — the normative obligations.
- [ADR 0010 — Secure token storage](../architecture/adrs/0010-secure-token-storage.md) and
  [ADR 0012 — Error normalization](../architecture/adrs/0012-error-normalization.md) — the two
  decisions most reviews turn on.
- [docs/security/token-storage](../docs/security/token-storage.md) — the tiers and the fallback.
- [url-policy.parser.ts](../src/platform/security/url-policy.parser.ts) — the outbound URL policy.
- [redact.helper.ts](../src/shared/security/redact.helper.ts) — what redaction actually covers.

## Preconditions

- [ ] The change is classified **critical** — the `.ai/risk-lanes.md` definition covers
      authentication, token handling, permissions, deep links, secure storage, native release,
      destructive migration, secrets, and privacy.
- [ ] You have the diff, not a description of it.
- [ ] You will report what you ran, and only what you ran.

## Files

```text
(review — writes nothing but the record)
src/modules/auth/**            tokens, session, refresh
src/packages/secure-storage/** the secret tier
src/packages/http/**           interceptors, refresh coordinator, error mapping
src/platform/security/**       outbound URL policy
src/app/router/**              guards and the deep-link allowlist
```

## Steps

1. **Tokens.** Do they live only behind `@/packages/secure-storage`, reached through
   `token.repository.ts`? Any `localStorage`, `Preferences`, query key, URL, log field, or analytics
   property carrying a token is a finding. `architecture/no-direct-storage-api-outside-platform` and
   `architecture/no-inline-storage-keys` catch the mechanical half.
2. **Auth posture on every request.** `skipAuth` on an authenticated endpoint silently drops the
   bearer; `skipRetryOnUnauthorized` missing from the refresh call causes a refresh loop. Check the
   gateway options against the backend's guard — see [gateway](gateway.md).
3. **Error leakage.** Does any backend text reach the UI? The chain must be `HttpError` →
   `mapHttpErrorToAppError` → `AppError.code` → `mapErrorCodeToI18nKey` → `t()`.
   `architecture/no-unsafe-error-display` catches raw errors in JSX; a `message` passed through a
   hook as copy is the leak it cannot see.
4. **Guards.** Every new route's `access` is an authorization decision — `Protected`, `PublicOnly`,
   `Public`. A container that guards itself instead of declaring `access` is a finding.
5. **URLs.** Anything outbound goes through `isAllowedExternalUrl`, which enforces `https:`, rejects
   embedded credentials (`url.username !== ''`), and honors `blockedHosts`. Anything inbound goes
   through `parseDeepLink` against `APP_DEEP_LINK_POLICY` — check for a widened allowlist and demand
   a reason. See [deep-link](deep-link.md).
6. **Environment.** Only `src/packages/environment` reads `import.meta.env`
   (`architecture/no-import-meta-env-outside-environment`), and `rawEnvironmentSchema` parses it. No
   `process.env` in app source (`architecture/no-process-env-outside-tooling`). No secret belongs in
   a `VITE_*` var — it ships to the client.
7. **New dependencies.** Registered owner, pinned version, audit clean, and a real reason. A
   permission-heavy Capacitor plugin needs this review _before_ it is installed — see
   [permission-flow](permission-flow.md).
8. **Suppressions.** Every `eslint-disable` must cite an `EXC-nnnn`
   (`architecture/no-undocumented-eslint-disable`). A new exception in a security path is itself the
   finding — see [exception](exception.md).
9. **Native posture.** `cleartext: false`, `androidScheme: 'https'`, and no `server.url` in
   `capacitor.config.ts`.
10. **Run the gates and record the output**: `npm run security:audit`, `npm run security:secrets`,
    `npm run security:scan`, plus `test:integration`, `test:contract` and `test:e2e`.

## Tests

- The standing security proofs must still pass: `tests/e2e/auth.spec.ts` asserts no token in
  `localStorage` and that a locked account never shows the word "locked";
  `tests/integration/health-error-state.integration.test.tsx` asserts the raw backend stacktrace is
  absent from `document.body.textContent`; `tests/integration/token-refresh.integration.test.ts`
  asserts single-flight rotation.
- A finding without a failing test is an opinion. Add the regression test with the fix.

## Security / accessibility / native considerations

- Trivy needs to be installed; if it is not, `security:scan` cannot run and you must say so rather
  than skip silently.
- `npm audit --audit-level=high` passes on medium findings by design — read the full report before
  concluding "no vulnerabilities".
- Threats this review will not catch: backend authorization, rate limiting, and anything
  server-side. Scope the claim to the client.

## Documentation delta

- `rules/18` if a new obligation is discovered.
- `docs/security/token-storage.md` if the storage story changes.
- The ADR record when a security decision is actually reversed — not a comment in a diff.

## Validation

```bash
npm run security:audit
npm run security:secrets
npm run security:scan
npm run test:integration && npm run test:contract
npm run test:e2e
```

## Forbidden shortcuts

- Approving because the gates are green — the gates catch the mechanical half; the design half is
  yours.
- "It is only the web dev fallback" — the fallback is not secure at rest, and that is the point of
  reviewing what reaches it.
- Widening the deep-link allowlist to make a link work — that is the vulnerability, arriving as a
  fix.
- Adding an `EXC-nnnn` to pass lint in an auth path — document the exception, then ask why it
  exists.
- Reporting a gate you did not run. If Trivy is missing, the honest line is "security:scan not run".

## Definition of done

- [ ] Tokens, auth posture, error leakage, guards, URLs, environment and native posture all reviewed
      against the diff.
- [ ] Every finding has a regression test, or an explicit accepted-risk record.
- [ ] All three security gates were run, and the report names any that could not be.
- [ ] The standing E2E and integration security proofs still pass.
- [ ] The claim in the PR matches exactly what was executed.
