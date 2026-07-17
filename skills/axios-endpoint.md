# Skill: Wire a new API endpoint

**Use when:** the backend exposes an operation the app does not call yet.

## Required reading

- [rules/13 — HTTP and the NestJS API](../rules/13-http-and-nest-api.md) — the owner, the envelope,
  single-flight refresh.
- [ADR 0007 — Axios/Nest API boundary](../architecture/adrs/0007-axios-nest-api-boundary.md) — why
  only `src/packages/http` may see Axios.
- [ADR 0013 — Boundary validation](../architecture/adrs/0013-boundary-validation.md) — parse at the
  edge.
- [http.interfaces.ts](../src/packages/http/interfaces/http.interfaces.ts) — the seven `HttpClient`
  verbs available to you.
- [context/api-flow](../context/api-flow.md) — how a call travels today.

## Preconditions

- [ ] You have the real request/response shape — an OpenAPI entry, a DTO, or a captured payload. See
      [nest-dto-integration](nest-dto-integration.md).
- [ ] The owning module is decided; a new resource may mean a new module
      ([new-feature-module](new-feature-module.md)).
- [ ] The auth posture is known: public, authenticated, or refresh-adjacent.

## Files

```text
src/modules/<module>/constants/<module>-api.constants.ts   edit: the path
src/modules/<module>/schemas/<module>.schema.ts            edit: the response contract
src/modules/<module>/gateways/<module>.gateway.ts          edit: the request* function
src/tests/msw/handlers.ts                                  edit: serve it in mock mode
src/tests/msw/mock-data.constants.ts                       edit: deterministic payload
tests/contract/<module>.contract.test.ts                   the wire-contract proof
```

## Steps

1. Pick the verb from the `HttpClient` interface: `get`, `post`, `put`, `patch`, `delete`,
   `postMultipart`, `download`. Do not add an eighth without changing the owner and ADR 0007.
2. Add the path to the module's `*-api.constants.ts` `as const` object. Paths are relative to the
   versioned base URL from `getEnvironment().apiBaseUrl` — `'/health'`, not
   `'http://api.test/api/v1/health'`. `architecture/no-inline-api-endpoints` enforces the constant.
3. Write the schema for the response — see [nest-dto-integration](nest-dto-integration.md). Every
   verb except `delete` and `download` takes one and parses before returning.
4. Add the `request*` function to the module gateway — see [gateway](gateway.md). Options carry the
   auth posture: `{ skipAuth: true }` for a public probe;
   `{ skipAuth: true, skipRetryOnUnauthorized: true }` for login and refresh.
5. Understand what the owner already does for you, and do not re-do it in the module:
   - bearer injection and a single-flight refresh-and-replay on 401 (`TokenRefreshCoordinator`);
   - an `X-Request-Id` correlation header (`createCorrelationId`);
   - normalization of every failure into `HttpError` with an `HTTP_ERROR_KIND`;
   - sanitized request logging through the injected `AppLogger`.
6. Add query parameters through `options.params`, never by string-concatenating the path — the
   constant must stay a constant.
7. Consume it from a service, which maps `HttpError` → `AppError` — see [service](service.md).
8. Teach mock mode the endpoint: add a handler to `src/tests/msw/handlers.ts` using `MOCK_*` values
   from `src/tests/msw/mock-data.constants.ts`.
   `mockApiServer.listen({ onUnhandledRequest: 'error' })` means an unmocked call fails the
   integration suite loudly (ADR 0016).

## Tests

- Gateway unit test with `createTestAdapter` — deterministic, no network. Assert the exact
  `{ method, url }` the adapter matched, so a path typo fails here.
- Contract test in `tests/contract/` — `fetch` the endpoint against MSW and parse with the very
  schema the app uses. See [contract-test](contract-test.md).
- Integration test when the endpoint drives UI —
  `tests/integration/health-error-state.integration.test.tsx` is the model: real client, real MSW,
  real component.
- Run: `npx vitest run --project contract`, then
  `npx vitest run --project unit src/modules/<module>/gateways`.

## Security / accessibility / native considerations

- Never send credentials or tokens in a query string; they land in logs and history.
- An authenticated endpoint that sets `skipAuth` fails open-looking and closed-behaving — the
  request simply goes unauthenticated. Double-check the flag against the backend's guard.
- New hosts are not allowed by accident: `VITE_API_BASE_URL` is parsed by `rawEnvironmentSchema`
  (`schemaBuilder.url()`); nothing else may read `import.meta.env`
  (`architecture/no-import-meta-env-outside-environment`).

## Documentation delta

- `context/api-flow.md` — the new endpoint and its auth posture.
- `docs/api/nest-error-contract.md` if the failure envelope differs from the documented one.
- The module README's anatomy and invariants.

## Validation

```bash
npm run test:contract
npm run test:integration
npm run quality:package-ownership
npm run typecheck
```

## Forbidden shortcuts

- `axios.get(...)` in a module — `architecture/no-direct-axios-import-outside-owner` plus
  `npm run quality:package-ownership`.
- `fetch(...)` in a hook — `architecture/no-direct-browser-api-outside-platform`.
- Building the URL with a template literal in the gateway — `architecture/no-inline-api-endpoints`;
  use `options.params`.
- Retrying 401 by hand — the coordinator already single-flights refresh; a manual retry causes the
  refresh storm the `skipRetryOnUnauthorized` flag exists to prevent.

## Definition of done

- [ ] The path is a constant; the verb comes from `HttpClient`; the response is schema-parsed.
- [ ] The auth posture matches the backend guard and is asserted in the gateway test.
- [ ] MSW serves the endpoint so mock mode and integration tests stay green.
- [ ] A contract test parses the mock payload with the production schema.
- [ ] `npm run test:contract` and `npm run quality:package-ownership` pass.
