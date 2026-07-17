# Skill: Write an integration test

**Use when:** a behavior only exists when real layers are wired together — client, MSW, UI.

## Required reading

- [ADR 0016 — Mock API mode](../architecture/adrs/0016-mock-api-mode.md) — mock at the network,
  never in app code.
- [msw-server.setup.ts](../tests/setup/msw-server.setup.ts) — `mockApiServer`, and the
  `onUnhandledRequest: 'error'` policy.
- [health card failure](../tests/integration/health-error-state.integration.test.tsx) — real
  client, real MSW, real component, sanitized copy.
- [token-refresh.integration.test.ts](../tests/integration/token-refresh.integration.test.ts) — the
  single-flight refresh proof.
- [handlers.ts](../src/tests/msw/handlers.ts) — the shared mock API.

## Preconditions

- [ ] A unit test cannot prove it. If mocks would carry the assertion, the test belongs in `unit`.
- [ ] The behavior spans layers: interceptor + service + query + component, or a multi-request flow.
- [ ] The scenario has (or needs) a deterministic mock — see `MOCK_SCENARIO_EMAILS`.

## Files

```text
tests/integration/<flow>.integration.test.ts     or .tsx when it renders
src/tests/msw/handlers.ts                        edit: a default handler for the endpoint
src/tests/msw/mock-data.constants.ts             edit: deterministic payloads and scenarios
```

## Steps

1. Put the file in `tests/integration/` with the `.integration.test.ts(x)` suffix — the project
   globs exactly that and loads two setup files: `testing-library.setup.ts` and
   `msw-server.setup.ts`.
2. **The server is already running.** `mockApiServer` listens in `beforeAll`, resets handlers and
   calls `resetMockAuthState()` in `afterEach`, closes in `afterAll`. Do not start your own.
3. **Unhandled requests fail.** `onUnhandledRequest: 'error'` means any endpoint you call without a
   handler throws — that is the feature. Add the default handler to `src/tests/msw/handlers.ts`.
4. **Wire the real HTTP client** in `beforeEach`, exactly as the health test does — first
   `resetAppHttpClientForTesting()`, then:

   ```ts
   configureAppHttpClient(
     createHttpClient({
       config: { baseUrl: getEnvironment().apiBaseUrl, timeoutMs: 2000 },
       tokenStore: createMemoryTokenStore(null),
     }),
   );
   ```

   No `adapter` — that is the difference from a gateway unit test: real Axios, real interceptors,
   MSW underneath.

5. **Override per test** with
   `mockApiServer.use(http.get(url, () => HttpResponse.json(body, { status })))`. Build the URL from
   `getEnvironment().apiBaseUrl` so it matches what the client actually requests.
   `mockApiServer.resetHandlers()` mid-test returns to the default — the health test uses that to
   simulate the backend healing.
6. **Render through providers**: `renderWithProviders(<HealthCardContainer />)` after
   `await initTestI18n()`. You are asserting the real container, not a stub.
7. **Assert what only integration can see.** The health test's payload carries
   `RAW_BACKEND_MESSAGE = 'raw upstream stacktrace at /var/app/server.js:42'` and then asserts
   `expect(document.body.textContent).not.toContain(RAW_BACKEND_MESSAGE)` — the whole document, not
   just the element. That is the ADR 0012 guarantee, proved end to end.
8. Use generous `findBy` timeouts for real interceptor round-trips:
   `await screen.findByTestId(TEST_IDS.errorState, {}, { timeout: 5000 })`.

## Tests

- What this suite must prove, by example:
  - **error mapping**: a 500 with a raw message renders "Something went wrong on our side." only.
  - **status differentiation**: 429 renders its own copy, not the generic one.
  - **recovery**: after `resetHandlers()`, clicking retry reaches the operational state.
  - **refresh single-flight**: concurrent 401s trigger exactly one refresh, and the replayed
    requests carry the rotated token (`token-refresh.integration.test.ts`).
- Run: `npm run test:integration`, or one file with
  `npx vitest run --project integration tests/integration/<flow>.integration.test.tsx`.

## Security / accessibility / native considerations

- This suite is where token rotation and error sanitization are actually verified. Auth changes are
  the **critical** lane — this suite plus contract plus E2E, every time.
- Use `MOCK_TOKENS` values; never a real token, even in an override handler.
- `MOCK_SCENARIO_EMAILS` gives deterministic failures — `forbidden`, `rateLimited`, `serverError`,
  `timeout` — so a scenario needs no ad-hoc handler.

## Documentation delta

- The module README's tests section — auth links its two integration tests by name.
- `context/api-flow.md` or `context/error-flow.md` when the flow itself changes shape.

## Validation

```bash
npm run test:integration
npm run test:contract
npm run test:coverage:per-file
npm run lint
```

## Forbidden shortcuts

- `vi.mock` of the HTTP client — that deletes the interceptors, which is the only thing this suite
  exists to exercise.
- `createTestAdapter` here — it bypasses Axios internals; keep it in gateway unit tests.
- A handler that ignores the request body — then a wrong payload passes.
- Asserting only on the visible element — assert `document.body.textContent` for leak checks.
- Leaving a `mockApiServer.use` override to bleed into the next test — `resetHandlers()` runs in
  `afterEach`, so do not defeat it with module-level state.

## Definition of done

- [ ] The test lives in `tests/integration/` and uses the real client over MSW.
- [ ] Every endpoint it touches has a handler; no unhandled request fires.
- [ ] It asserts something no unit test could: mapping, recovery, or a multi-request invariant.
- [ ] Raw backend text is proven absent from the whole document.
- [ ] `npm run test:integration` passes with no ordering dependence.
