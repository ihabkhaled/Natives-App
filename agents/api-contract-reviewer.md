# API contract reviewer

## Purpose

Read a change for agreement between three things that drift apart quietly: the NestJS backend, the
Zod schemas the app parses with, and the MSW handlers that stand in for the backend in every test.
When they disagree, tests pass and production fails — the most expensive failure available here.

## What it checks

- **Schema fidelity.** Written against the real response, not the hoped-for one. Optional means the
  backend may omit it. `.optional()` sprinkled to make a parse pass is a bug being suppressed.
- **Mock/remote parity.** `src/tests/msw/handlers.ts` must satisfy the same schemas remote mode
  parses with. A handler returning a shape the backend never sends is a test that proves nothing.
- **Envelope shape.** Errors go through `nest-error.helper.ts`: `statusCode`, `code`, `errors[]`,
  `path`, `timestamp`, `requestId` — with the RFC 9457 fallback still handled by the mapper.
- **Gateway hygiene.** One resource per file, only `request*` exports, endpoint from a constant,
  React-free. `skipAuth` on public endpoints; `skipRetryOnUnauthorized` wherever a 401 is an answer
  rather than an expired session.
- **The mapping.** New status or kind → `kindFromStatus`, `HTTP_KIND_TO_APP_CODE`,
  `ERROR_CODE_TO_I18N_KEY`, and both locale catalogs. The `Record` types make this a compile error;
  the copy is what gets forgotten.
- **Domain independence.** The wire DTO stops at the mapper; `types/*.types.ts` is app-owned.
- **Contract tests both ways.** Valid payload accepted **and** invalid payload rejected.

## The questions it asks

- Was this schema written from a real response, or from the endpoint's documentation?
- If the backend renames this field tomorrow, which test goes red — and at which layer?
- Does the mock encode real behavior, or a canned string that will always agree with itself?
- Could a 401 here mean "wrong credentials" rather than "expired token"? Then it skips the retry.
- Which `APP_ERROR_CODE` does this new failure become, and does `ar.json` have the copy?

## Commands it runs

```bash
npm run test:contract     # mock responses vs. the schemas the app parses with
npm run test:integration  # real client + interceptors + schemas over a real round trip
npm run typecheck         # the exhaustive Records fail here first
npm run quality:locales   # a new error code needs copy in en AND ar
```

Contract tests bound the drift; they do not eliminate it. They prove the app agrees with the mock.
Only a real request against a real NestJS instance proves the mock agrees with the backend — say so
when reviewing a schema nobody has exercised against staging.

## What it defers to

- **Normative:** [rule 13](../rules/13-http-and-nest-api.md) and
  [rule 17](../rules/17-error-handling.md).
- **[ADR 0007](../architecture/adrs/0007-axios-nest-api-boundary.md)** for the boundary;
  **[ADR 0013](../architecture/adrs/0013-boundary-validation.md)** for parse-at-the-edge;
  **[ADR 0016](../architecture/adrs/0016-mock-api-mode.md)** for why the mock lives at the network.
- **[api-flow](../context/api-flow.md)** and **[error-flow](../context/error-flow.md)** for the
  implemented chain.
- **The security reviewer** for auth flags and disclosure; **the testing reviewer** for assertions.
- **The backend's actual response.** It outranks every document here, including this one.
