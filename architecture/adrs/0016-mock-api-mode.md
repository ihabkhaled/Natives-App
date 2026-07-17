# ADR 0016: Mock API mode

- Status: Accepted
- Date: 2026-07-16
- Deciders: Architecture owner

## Context

A frontend boilerplate that only runs against a live NestJS instance is a frontend boilerplate
nobody can run. Cloning it should produce a working app, and E2E tests should not need a database.
But the usual escape hatch — an `if (isMock)` branch inside the gateway — poisons the thing it is
meant to help: the code exercised in tests stops being the code that ships, and the mock drifts from
the wire until it proves nothing at all.

Failure paths make this worse. Offline states, 401 replay, rate limiting, and server errors are the
hardest paths to trigger against a real backend and the ones most worth testing.

## Decision

Mock at the **network** layer, never in application code. `VITE_API_MODE=mock` starts an MSW worker;
the app above the socket is byte-for-byte identical.

- `src/tests/msw/handlers.ts` serves the NestJS wire contract — the same Zod schemas parse mock and
  remote responses, and `nest-error.helper.ts` emits the real error envelope with `statusCode`,
  `code`, `errors[]`, `path`, `timestamp`, and `requestId`.
- Handlers hold real behavior, not canned strings: `/auth/refresh` rotates the token pair,
  `/auth/me` checks the bearer against issued tokens, and scenario emails in
  `MOCK_SCENARIO_EMAILS` trigger 403, 429, 500, and timeout paths on demand.
- Startup is fenced twice in `startMockModeIfEnabled()` (`src/app/startup/start-app.ts`): the worker
  starts only when `apiMode === 'mock'` **and** `!isProduction`, and it is a dynamic `import()`, so
  MSW is not in the production bundle.
- `msw` is registered in the ownership registry to `src/tests/msw` — the mock layer is an owner like
  any other, and no feature file may import it.
- Playwright runs the whole suite with `VITE_API_MODE: 'mock'`, set in `playwright.config.ts`'s
  `webServer.env`.
- A separate seam exists for unit tests: `src/packages/http/adapters/test.adapter.ts` is a
  deterministic Axios adapter with no sockets, no MSW, and no jsdom.

## Consequences

**Positive:** `npm install && npm run dev` gives a working app. Integration and contract suites
exercise the real Axios client, real interceptors, and real schemas over a real HTTP round trip.
Failure paths are reachable by typing an email address.

**Negative / cost:** The handlers are a hand-maintained fiction and will drift from the backend —
`tests/contract/*.contract.test.ts` narrows that gap but only proves the app agrees with the mock.
Mock mode can flatter: a screen that works here can still fail against a real NestJS instance whose
envelope differs.

**Enforcement:** the environment schema restricts `VITE_API_MODE` to `mock | remote`; the ownership
registry pins `msw`; the production fence lives in `start-app.ts`; `npm run test:contract` asserts
mock responses satisfy the schemas the app parses with.

## Alternatives considered

- `if (mock)` branches in gateways — rejected: it means tests exercise different code than ships.
- A local JSON server or fixture files — rejected: no status codes, no headers, no error envelopes,
  so the interceptor and mapper paths stay untested.
- Recorded HTTP cassettes — rejected: they need a live backend to record and go stale silently.

## Supersession

Revisit if the backend publishes a contract that can generate handlers, or if a shared staging
environment makes hand-written mocks redundant for E2E.
