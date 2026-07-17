# Skill: Add a gateway

**Use when:** a module needs to call an HTTP endpoint and hand back a parsed payload.

## Required reading

- [rules/07 — Gateways and repositories](../rules/07-gateways-repositories.md) — what a `request*`
  function may and may not do.
- [rules/13 — HTTP and the NestJS API](../rules/13-http-and-nest-api.md) — the boundary this sits
  on.
- [ADR 0007 — Axios/Nest API boundary](../architecture/adrs/0007-axios-nest-api-boundary.md) — why
  `src/packages/http` is the only door.
- [health.gateway.ts](../src/modules/health/gateways/health.gateway.ts) — one public endpoint.
- [auth.gateway.ts](../src/modules/auth/gateways/auth.gateway.ts) — four endpoints with the
  `skipAuth` / `skipRetryOnUnauthorized` flags that keep refresh from recursing.

## Preconditions

- [ ] The wire schema exists and is exported from `schemas/<module>.schema.ts`.
- [ ] The endpoint path is (or will be) a key in `constants/<module>-api.constants.ts`.
- [ ] You know whether the endpoint is public, authenticated, or the refresh endpoint itself.

## Files

```text
src/modules/<module>/constants/<module>-api.constants.ts   edit or create: the paths object
src/modules/<module>/gateways/<module>.gateway.ts          the request* functions
```

## Steps

1. Add the path to the `as const` paths object, relative to the versioned base URL —
   `HEALTH_API_PATHS.health` is `'/health'`, `AUTH_API_PATHS.currentUser` is `'/auth/me'`. A literal
   at the call site fails `architecture/no-inline-api-endpoints`.
2. Export functions named `request*` only. `architecture/one-gateway-responsibility-per-file`
   rejects any other export from a `*.gateway.ts`; several `request*` functions for one resource are
   fine, which is why auth keeps login, refresh, logout and me together.
3. Resolve the client lazily inside each call: `getAppHttpClient()` from `@/packages/http`. It is
   configured once in `src/app/startup/start-app.ts`; capturing it at module scope would break tests
   that reconfigure it.
4. Always pass the schema.
   `getAppHttpClient().get(HEALTH_API_PATHS.health, healthResponseSchema, …)` parses before the
   value returns, so an off-contract payload rejects at the boundary (ADR 0013).
5. Type the return as `Promise<SchemaOutput<typeof <name>Schema>>` — never a hand-written duplicate
   of the schema shape.
6. Set the request options honestly:
   - public endpoint → `{ skipAuth: true }` (health).
   - login / refresh → `{ skipAuth: true, skipRetryOnUnauthorized: true }`; without the second flag
     a 401 from refresh would call refresh again.
   - authenticated read → no options; the interceptor attaches the bearer token.
7. Keep it React-free and mapping-free. `architecture/no-react-in-gateways` covers the first; the
   second is convention — DTO in, DTO out, and the [service](service.md) maps.

## Tests

- `<module>.gateway.test.ts`, colocated. Wire a real client over a canned adapter, and call
  `resetAppHttpClientForTesting()` in `afterEach`:

  ```ts
  configureAppHttpClient(
    createHttpClient({
      config: { baseUrl: 'http://api.test/api/v1', timeoutMs: 1000 },
      tokenStore: createMemoryTokenStore(buildTokenPair()),
      adapter: createTestAdapter(routes),
    }),
  );
  ```

- Prove three things, as `health.gateway.test.ts` does: the parsed payload comes back; the auth
  posture is right (health asserts `seenHeaders['Authorization']` is `undefined` while
  `X-Request-Id` is set); and a contract violation rejects.
- `createTestAdapter` and `createMemoryTokenStore` come from `@/packages/http` and
  `tests/factories/http.factory.ts` — no MSW, no sockets, no jsdom.
- Run: `npx vitest run --project unit src/modules/<module>/gateways`.

## Security / accessibility / native considerations

- `skipAuth` on an authenticated endpoint silently drops the token and turns a 401 into a mystery;
  `skipRetryOnUnauthorized` on a normal endpoint disables transparent refresh. Both are security
  decisions — state them in the module README's invariants.
- Never put a secret in a query string; the correlation-id header is added for you.

## Documentation delta

- `context/api-flow.md` gains the endpoint.
- `docs/api/nest-error-contract.md` if the backend's failure envelope changes shape.
- The module README's anatomy line for the gateway.

## Validation

```bash
npm run quality:package-ownership
npx vitest run --project unit src/modules/<module>/gateways
npm run test:contract
```

## Forbidden shortcuts

- `import axios from 'axios'` for one call — `architecture/no-direct-axios-import-outside-owner` and
  `npm run quality:package-ownership`.
- `fetch()` in a module — `architecture/no-direct-browser-api-outside-platform`.
- Skipping the schema argument "because the backend is trusted" — that is the boundary ADR 0013
  exists for.
- Exporting a `mapX` helper from the gateway file —
  `architecture/one-gateway-responsibility-per-file`.

## Definition of done

- [ ] Every export is a `request*` returning `SchemaOutput<typeof …>`.
- [ ] Paths live in the constants file; options reflect the real auth posture.
- [ ] Tests cover success, auth headers, and a contract violation.
- [ ] `npm run quality:package-ownership` and `npx vitest run --project unit` pass.
