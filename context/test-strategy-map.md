# Test strategy map

Six layers, what each one actually proves, and the commands that run them. The coverage decision is
[ADR 0014](../architecture/adrs/0014-testing-and-per-file-coverage.md).

## The layers

| Layer         | Runner     | Environment    | Location                                | Proves                                           |
| ------------- | ---------- | -------------- | --------------------------------------- | ------------------------------------------------ |
| Unit          | Vitest     | jsdom          | colocated `src/**/*.test.ts(x)`         | One file's logic in isolation                    |
| Integration   | Vitest     | jsdom + MSW    | `tests/integration/`                    | Real client + interceptors + schemas together    |
| Contract      | Vitest     | node + MSW     | `tests/contract/`                       | The wire matches the schemas the app parses with |
| Architecture  | Vitest     | node           | `eslint/architecture-plugin/tests/`     | The rules themselves accept/reject correctly     |
| E2E           | Playwright | Chromium/Pixel | `tests/e2e/`                            | User journeys against a mock-mode build          |
| A11y + Visual | Playwright | Chromium       | `tests/accessibility/`, `tests/visual/` | WCAG 2.2 AA; rendered appearance                 |

Vitest's four projects (`unit`, `integration`, `contract`, `architecture-plugin`) are declared in
`vitest.config.ts` so each gets the right environment: jsdom distorts a wire-contract check and node
cannot render.

## What each layer is for

**Unit** — colocated with the file it tests, so a moved file moves its test. Pure logic first:
mappers, schemas, key builders, path builders, parsers.

**Integration** — the layer that catches what unit tests structurally cannot.
`tests/integration/token-refresh.integration.test.ts` builds a **real** `createHttpClient` against
MSW and asserts three things no mock could: an expired token is refreshed and the request replayed,
three concurrent 401s collapse into exactly one `/auth/refresh` call, and a rejected refresh clears
tokens and marks the session anonymous. `tests/integration/auth-login-flow.integration.test.ts`
covers the login path the same way.

**Contract** — narrow and specific: the mock is the app's model of the backend, so it must satisfy
the same schemas remote mode uses. `tests/contract/health.contract.test.ts` fetches the mock and
parses it with the module's own `healthResponseSchema`, then asserts a bad payload is rejected —
both directions, because a schema that accepts everything passes the first half.

**Architecture** — the rules are code, so they get tests. Every rule has valid/invalid fixtures in
`eslint/architecture-plugin/fixtures/`, run by `npm run quality:architecture-rules`.

**E2E** — journeys against `VITE_API_MODE: 'mock'` (set in `playwright.config.ts`'s
`webServer.env`), across five projects: desktop, mobile (Pixel 7), and an Arabic RTL project that
greps for `@rtl`. Real specs cover login and sign-out, sanitized error copy for bad credentials and
locked accounts, guard redirects both ways, the offline banner, theme and locale persistence across
reloads, list virtualization, and one security assertion — a signed-in session exposes no tokens to
`localStorage`.

**A11y and visual** — `tests/accessibility/a11y.spec.ts` runs axe over welcome, login (including its
error state), settings, workbench, and authenticated home, plus the dark palette, the Arabic RTL
layout, and a 44px minimum target size. `tests/visual/visual.spec.ts` snapshots five surfaces with
`maxDiffPixelRatio: 0.02` and animations disabled.

## Coverage policy

Per-file, not aggregate — an average hides the file that matters.

- **95%** statements/branches/functions/lines for every file under `src/`.
- **100%** for pure-logic kinds: `*.helper.ts`, `*.utils.ts`, `*.mapper.ts`, `*.schema.ts`,
  `*.keys.ts`, `*.paths.ts`, `*.selectors.ts`, `*.migrations.ts`, `*.parser.ts`. Input in, output
  out — there is no excuse.
- Excluded: `*.types.ts`, `*.interfaces.ts`, `index.ts` barrels, `src/tests/**`, `src/main.tsx`.
  No branches, nothing to prove.

`vitest.config.ts` enforces it during the run; `scripts/quality/check-per-file-coverage.mjs`
re-checks `coverage/coverage-final.json` afterwards and prints every failing file with its
shortfall and whether the pure-file rule applied. Both read the globs from
`scripts/quality/coverage-policy.mjs`, so the config and the checker cannot drift apart.

## Commands

```bash
npm test                        # all Vitest projects
npm run test:unit               # one project at a time
npm run test:integration
npm run test:contract
npm run test:coverage           # writes coverage/
npm run test:coverage:per-file  # the named-file gate; needs the run above
npm run quality:architecture-rules
npm run test:e2e                # needs: npm run test:e2e:install
npm run test:a11y
npm run test:visual
```

## Test infrastructure

`tests/setup/` holds the shared rig: `testing-library.setup.ts`, `msw-server.setup.ts`,
`render-with-providers.helper.tsx`, `i18n-test.helper.ts`, and `ionic-events.helper.ts`.
`tests/factories/http.factory.ts` and `src/modules/auth/factories/auth.factory.ts` build
deterministic data shared by MSW handlers and tests, so the mock and the assertions cannot disagree.
E2E selectors go through `TEST_IDS` (`tests/e2e/fixtures/app.fixture.ts`), so a renamed test id
fails typecheck instead of silently matching nothing. Two jsdom facts worth knowing first — Ionic
booleans are DOM properties, not attributes, and Ionic events need the helper — are recorded in
[known-pitfalls](../memory/known-pitfalls.md).
