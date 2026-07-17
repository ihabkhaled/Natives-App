# API flow

One request, end to end, through the layers that actually exist. The boundary decision is
[ADR 0007](../architecture/adrs/0007-axios-nest-api-boundary.md); the mock layer is
[ADR 0016](../architecture/adrs/0016-mock-api-mode.md).

## The chain

```text
container            health-card.container.tsx        renders the view model
   ↓
hook                 use-health-query.hook.ts          query → view model, AppError
   ↓
query                health.query.ts + health.keys.ts  options + hierarchical key
   ↓
service              get-health.service.ts             use case; HttpError → AppError
   ↓
gateway              health.gateway.ts                 one resource; endpoint constant
   ↓
http owner           getAppHttpClient() → AxiosHttpClient
   ↓
axios instance       request interceptor → adapter → response/error interceptor
   ↓
network              MSW worker (mock mode)  |  NestJS (remote mode)
```

Each hop has one job, and the file suffix names it. Nothing skips a hop: a hook never calls a
gateway, a service never touches Axios, a component never sees any of it.

## Request lifecycle through the interceptors

Built in `src/packages/http/http-client.factory.ts` when `start-app.ts` calls
`createHttpClient(...)` once at startup.

**Outbound** — `createRequestInterceptor`:

1. Stamp `X-Request-Id` from `createCorrelationId()` (`crypto.randomUUID()` with a timestamp+random
   fallback). It travels to NestJS and comes back in the error envelope, which is what makes a
   support ticket traceable.
2. Set `Accept: application/json`.
3. Unless the caller passed `skipAuth`, `await deps.tokenStore.getAccessToken()` and set
   `Authorization: Bearer …`. The token is read per request, so a refresh mid-session is picked up
   without rebuilding the client.
4. Debug-log method, URL, and headers — through `sanitizeHeadersForLog`, which redacts
   `authorization`, `cookie`, `set-cookie`, and `x-api-key`.

The per-request flags (`skipAuth`, `skipRetryOnUnauthorized`) reach the interceptor because
`helpers/axios-config.helper.ts` copies them onto the Axios config as `appSkipAuth` /
`appSkipRetryOnUnauthorized`, alongside the internal `appRetried` marker.

**Inbound, success** — the response passes through untouched, then `AxiosHttpClient` parses the body
with `parseResponseWithSchema`. A schema violation throws `HttpError` with kind `response-contract`
and the failing path in the message. Feature code never receives an unvalidated body.

**Inbound, failure** — `createErrorInterceptor`:

1. `mapUnknownToHttpError(error)` normalizes: already-`HttpError` passes through; `isCancel` →
   `cancelled`; `ECONNABORTED`/`ETIMEDOUT` → `timeout`; no response → `network`; otherwise map the
   status, parsing the body as the NestJS envelope first and RFC 9457 problem details second.
2. If the kind is `unauthorized`, hand the config to the retry handler — see
   [auth-flow](./auth-flow.md) for the single-flight refresh and replay.
3. If the replay is impossible and the request had already been retried, call `onAuthFailure`.
4. Log kind + status at warn level (cancellations are silent), then throw the `HttpError`.

## Where the two modes diverge

Nowhere above the socket. `startMockModeIfEnabled()` starts the MSW worker when
`VITE_API_MODE=mock` and the build is not production; `src/tests/msw/handlers.ts` answers with the
NestJS envelope. The same Zod schemas parse both modes — which is exactly what
`tests/contract/health.contract.test.ts` asserts by fetching the mock and parsing it with the
module's own `healthResponseSchema`.

For unit tests that want no network at all, `src/packages/http/adapters/test.adapter.ts` swaps the
Axios adapter for a route table: no sockets, no MSW, no jsdom, and unmatched requests return 404.
`http-client.factory.test.ts` uses it to prove interceptor behavior directly.

## Adding an endpoint

Path into `constants/<name>-api.constants.ts` → schema → mapper → `request*` in the gateway →
service → query key + options → hook. Public endpoints pass `skipAuth: true` (as `health.gateway.ts`
does). Endpoints that must never trigger the refresh interceptor pass `skipRetryOnUnauthorized:
true` — the auth endpoints do, for the reason given in [auth-flow](./auth-flow.md).
