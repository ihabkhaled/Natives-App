# Skill: Write an end-to-end test

**Use when:** a user-visible journey must be proven in a real browser against the mock API.

## Required reading

- [playwright.config.ts](../playwright.config.ts) — five projects, the web server, and the mock env.
- [app.fixture.ts](../tests/e2e/fixtures/app.fixture.ts) — `gotoApp`, `fillIonInput`, `login`,
  `setOffline`, `APP_ROUTES`.
- [auth.spec.ts](../tests/e2e/auth.spec.ts) — the reference journey, including the token-leak
  assertion.
- [offline.spec.ts](../tests/e2e/offline.spec.ts) — driving the network through the browser context.
- [rules/19 — Accessibility](../rules/19-accessibility.md) — E2E and axe share the same fixtures.

## Preconditions

- [ ] The journey is a user's, not a unit's. Layer wiring belongs in
      [integration-test](integration-test.md).
- [ ] Every element you will touch has a `TEST_IDS` entry — see [component](component.md).
- [ ] The scenario is reachable from `MOCK_CREDENTIALS` or `MOCK_SCENARIO_EMAILS`.
- [ ] Chromium is installed: `npm run test:e2e:install`.

## Files

```text
tests/e2e/<journey>.spec.ts        the journey
tests/e2e/fixtures/app.fixture.ts  edit: only when a helper is genuinely reusable
src/shared/config/test-ids.constants.ts   edit: ids the journey needs
```

## Steps

1. Create `tests/e2e/<journey>.spec.ts`. The `webServer` block starts Vite with
   `VITE_API_MODE: 'mock'` and `VITE_ENABLE_QUERY_DEVTOOLS: 'false'` on `http://127.0.0.1:4173` —
   MSW's browser worker serves the API, so no backend is needed and the run is deterministic.
2. **Always enter through `gotoApp(page, APP_ROUTES.login)`.** It navigates and then waits for
   `TEST_IDS.appShell` to be visible — the single signal that MSW, i18n and session bootstrap have
   all settled. A bare `page.goto` races them.
3. **Select through `TEST_IDS`**, never a CSS class or text: `page.getByTestId(TEST_IDS.homePage)`.
   The fixture's comment says why — a renamed id then fails typecheck instead of silently skipping
   the assertion.
4. **Fill Ionic inputs through `fillIonInput`.** It reaches the shadow input:
   `page.getByTestId(testId).locator('input').fill(value)`. `getByTestId(id).fill(...)` targets the
   `ion-input` host and does nothing useful.
5. **Reuse `login(page)`** for anything past the guard; pass credentials to drive a scenario:
   `await login(page, { email: MOCK_SCENARIO_EMAILS.forbidden, password: 'Whatever#1234' });`.
6. **Assert with web-first matchers** — `await expect(locator).toBeVisible()` retries; `toHaveText`
   is exact and `toContainText` is not. Never `waitForTimeout`.
7. **Drive the network through the context**, as `setOffline(page, true)` does: `context.setOffline`
   plus a dispatched `offline` event, because the Capacitor Network shim reads `navigator` and
   listens for the window event.
8. Tag an RTL journey `@rtl` — the `e2e-desktop-ar` project greps for it and runs with
   `locale: 'ar'`. The other projects run every spec on Desktop Chrome and Pixel 7.
9. Keep specs independent: `fullyParallel: true`, and CI retries twice. Any ordering assumption
   surfaces as a flake.

## Tests

- Prove the journey and the guarantees around it. `auth.spec.ts` is the bar: sign-in reaches home;
  bad credentials show sanitized copy and stay on login; a locked account shows the permission
  message and **not** the word "locked"; the schema blocks submission; an authenticated visitor
  bounces off `/login`; logout returns to the public flow; and no token ever reaches `localStorage`.
- Run: `npm run test:e2e`, or one file with `npx playwright test tests/e2e/<journey>.spec.ts`.
- Debug with `npx playwright test --ui`; on failure the config already captures trace, screenshot
  and video.

## Security / accessibility / native considerations

- Keep the storage assertion pattern alive for any secret-adjacent journey:

  ```ts
  const dump = await page.evaluate(() => JSON.stringify(globalThis.localStorage));
  expect(dump).not.toContain('mock-access-token');
  ```

- Assert on sanitized copy, never on backend text — the E2E suite is the last place a leak is caught
  before a user sees it.
- Playwright runs a browser. Native behavior — deep-link cold start, permissions, hardware back — is
  **not** covered here. See [native-test](native-test.md) and be honest about the gap.

## Documentation delta

- None for a routine journey. The fixture's helpers are the documentation; add to them rather than
  writing prose.

## Validation

```bash
npm run test:e2e:install
npm run test:e2e
npm run test:a11y
npm run test:visual
```

## Forbidden shortcuts

- `page.waitForTimeout(500)` — the fixture's `gotoApp` exists so you never need it; timeouts are how
  a suite becomes flaky.
- `page.goto('/home')` directly — no shell wait, and the guard may still be resolving.
- `page.locator('.some-ionic-class')` — Ionic's internals are not your API.
- `getByTestId(TEST_IDS.loginEmailInput).fill(...)` — fills the host element, not the input.
- Sharing state between specs to "save a login" — `fullyParallel` makes that a coin flip.

## Definition of done

- [ ] The spec enters through `gotoApp` and selects only through `TEST_IDS`.
- [ ] Ionic inputs are filled with `fillIonInput`; no arbitrary waits appear.
- [ ] Assertions are web-first matchers on sanitized, translated copy.
- [ ] The spec passes standalone and in parallel, on desktop and Pixel 7.
- [ ] `npm run test:e2e` is green and any native gap is stated, not implied.
