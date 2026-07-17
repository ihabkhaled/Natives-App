# Mock mode

The app runs with **no backend**. `VITE_API_MODE=mock` starts an MSW worker that serves a
deterministic, NestJS-shaped API.

This is not a stub layer bolted onto the side: mock and remote mode share the same Axios client,
the same gateways, and the same Zod schemas. The only difference is who answers the request.

## Starting

Mock mode starts only when all of these hold ([`start-app.ts`](../../src/app/startup/start-app.ts)):

- `VITE_API_MODE === 'mock'`, and
- the build is not production (`isProduction === false`).

The worker is a **dynamic import**, so it is never in the production bundle:

```ts
const { startMockWorker } = await import('@/tests/msw/browser');
```

## Identities

| Email                                | Result                                   |
| ------------------------------------ | ---------------------------------------- |
| `ranger@example.com` / `Ranger#1234` | Success                                  |
| any other password                   | `401 INVALID_CREDENTIALS`                |
| `locked@example.com`                 | `403 ACCOUNT_LOCKED`                     |
| `ratelimit@example.com`              | `429 RATE_LIMITED`                       |
| `server@example.com`                 | `500 INTERNAL_ERROR`                     |
| `timeout@example.com`                | hangs 60s → client timeout               |
| missing fields                       | `400 VALIDATION_ERROR` with field errors |

Defined in [`src/tests/msw/mock-data.constants.ts`](../../src/tests/msw/mock-data.constants.ts) and
[`handlers.ts`](../../src/tests/msw/handlers.ts).

## Token behavior

The mock issues `mock-access-token` / `mock-refresh-token` and rotates to `*-rotated` on refresh.
`GET /auth/me` checks the bearer against the set of tokens it actually issued, so the refresh
path is exercised honestly: present a stale token and you get a real 401, which drives a real
single-flight refresh and replay.

## Where it is used

| Consumer                    | How                                                                                          |
| --------------------------- | -------------------------------------------------------------------------------------------- |
| `npm run dev`               | Browser service worker (`public/mockServiceWorker.js`).                                      |
| Vitest integration/contract | `setupServer` in [`tests/setup/msw-server.setup.ts`](../../tests/setup/msw-server.setup.ts). |
| Playwright                  | The dev server runs in mock mode, so E2E needs no backend.                                   |

## Determinism

Fixed timestamps and versions, no randomness, no clock dependence. `resetMockAuthState()` clears
issued tokens between tests. Deterministic mocks are the point: a flaky mock teaches people to
re-run CI until it passes.

## Caveat: Playwright cannot intercept mock-mode responses

MSW's service worker answers before Playwright's `page.route` sees the request, so
`page.route('**/api/v1/health', ...)` never fires in mock mode. Backend-failure rendering is
therefore proven at the integration layer
([`tests/integration/health-error-state.integration.test.tsx`](../../tests/integration/health-error-state.integration.test.tsx)),
where handlers are directly controllable — the right layer for it anyway.

## Adding a handler

1. Add the endpoint constant to the module's `constants/*-api.constants.ts`.
2. Add the wire schema to `schemas/*.schema.ts` — the same schema parses remote mode.
3. Add the handler to `src/tests/msw/handlers.ts`, reusing the module's factory for the payload.
4. Add a contract test asserting the mock satisfies the schema the app parses with.
