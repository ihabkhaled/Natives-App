# Skill: Write a contract test

**Use when:** an endpoint's wire shape must be pinned — new endpoint, or a backend change.

## Required reading

- [ADR 0007 — Axios/Nest API boundary](../architecture/adrs/0007-axios-nest-api-boundary.md) — the
  contract suite is named as its enforcement.
- [ADR 0016 — Mock API mode](../architecture/adrs/0016-mock-api-mode.md) — mock mode _is_ the
  declared remote contract.
- [health.contract.test.ts](../tests/contract/health.contract.test.ts) — the whole pattern in two
  tests.
- [auth.contract.test.ts](../tests/contract/auth.contract.test.ts) — the four auth endpoints and
  their failure envelopes.
- [mock-data.constants.ts](../src/tests/msw/mock-data.constants.ts) — the deterministic dataset.

## Preconditions

- [ ] The schema exists and is exported from the module's `index.ts` — health exports
      `healthResponseSchema` for exactly this reason.
- [ ] The MSW handler serves the endpoint from `src/tests/msw/handlers.ts`.
- [ ] You understand what this suite claims: that the app's schema and the mock agree. It cannot
      prove the real backend agrees — only a live check or a shared OpenAPI artifact can.

## Files

```text
tests/contract/<module>.contract.test.ts    the proof
src/modules/<module>/index.ts               edit: export the schema
src/tests/msw/handlers.ts                   the endpoint under test
```

## Steps

1. Place the file in `tests/contract/` as `<module>.contract.test.ts`. The project runs in the
   **node** environment with only `msw-server.setup.ts` — no jsdom, no testing-library. A `.tsx`
   file here is a mistake.
2. Call the endpoint with plain `fetch` against the mock, building the URL from
   `getEnvironment().apiBaseUrl`. No Axios, no client, no interceptors — the point is the payload,
   stripped of the app's machinery.
3. Assert the transport first: `expect(response.status).toBe(200);`.
4. **Parse with the production schema**, not a copy:
   `const parsed = safeParseWithSchema(healthResponseSchema, await response.json());` then
   `expect(parsed.success).toBe(true);`. Importing the schema from `@/modules/health` is what makes
   this a contract test rather than a mock test.
5. Narrow inside the success branch so TypeScript keeps the types:
   `if (parsed.success) { expect(parsed.data.version).toBe(MOCK_HEALTH.version); }`. Assert against
   `MOCK_*` constants, not literals — a changed fixture then fails here instead of somewhere
   confusing.
6. Assert semantics the schema cannot: health checks
   `expect(Number.isNaN(Date.parse(parsed.data.timestamp))).toBe(false)` — the schema proves the
   format, the test proves it is a real instant.
7. **Prove the schema rejects too.** The second health test parses
   `{ status: 'degraded', version: '', timestamp: 'not-a-date' }` and expects `success` to be
   `false`. Without it, a schema loosened to `z.any()` would keep the suite green.
8. For auth-shaped endpoints, cover the failure envelopes as well: the shapes behind
   `MOCK_SCENARIO_EMAILS.forbidden`, `rateLimited` and `serverError` must match
   `nestErrorEnvelopeSchema` — that is what lets the owner map them to `HTTP_ERROR_KIND`.
9. When the **backend changes**, work in this order: update the schema
   ([nest-dto-integration](nest-dto-integration.md)) and watch this suite fail; update the MSW
   handler and `mock-data.constants.ts` until it passes; only then touch the mapper and domain type,
   and only if the app needs the new field.

## Tests

- The contract suite is itself the test. It must prove: the mock satisfies the schema; the schema
  rejects a violation; and the key fields match the declared fixtures.
- Run: `npm run test:contract`, or one file with
  `npx vitest run --project contract tests/contract/<module>.contract.test.ts`.

## Security / accessibility / native considerations

- Never assert a real token value; `MOCK_TOKENS` exists so `security:secrets` stays clean.
- A weakened schema is a security regression: it is the parse step that stops an unexpected payload
  from reaching the app (ADR 0013). The rejection test is the guard on the guard.
- None beyond that: this suite renders nothing and touches no native surface.

## Documentation delta

- `context/api-flow.md` — the endpoint and its contract.
- `docs/api/nest-error-contract.md` when the failure envelope changes.
- The module README's tests section — health links its contract test by name.

## Validation

```bash
npm run test:contract
npm run typecheck
npm run quality:exports
```

## Forbidden shortcuts

- Re-declaring the shape inside the test — then the test proves the mock matches the test, which is
  a tautology. Import the module's schema.
- Skipping the rejection case — the suite passes forever afterwards, including when the schema stops
  checking anything.
- Using the Axios client here — interceptors and normalization belong to
  [integration-test](integration-test.md).
- Hard-coding `'1.0.0-mock'` instead of `MOCK_HEALTH.version` — the next fixture change fails in the
  wrong place.
- Claiming the real backend is verified. It is not. Say "mock mode matches the app schema".

## Definition of done

- [ ] The test lives in `tests/contract/`, runs in node, and uses `fetch`.
- [ ] It parses with the module's exported schema, imported through `@/modules/<module>`.
- [ ] A violating payload is proven to reject.
- [ ] Assertions reference `MOCK_*` constants.
- [ ] `npm run test:contract` passes and the claim made in the PR is scoped to mock mode.
