# ADR 0007: Axios / NestJS API boundary

- Status: Accepted
- Date: 2026-07-16
- Deciders: Architecture owner

## Context

The backend is NestJS, which has its own error envelope, its own validation-pipe field errors, and
a habit of also being fronted by proxies that emit RFC 9457 problem details. The client is Axios,
whose errors are a union of "no response", "timeout", "cancelled", and "HTTP status" that every
caller would otherwise re-discriminate by hand. If both shapes leak into feature code, every service
grows the same `error.response?.data?.message` ladder — and each copy is subtly different.

Two further forces: responses must be validated before use (a backend field rename should fail at
the boundary, not three layers later as `undefined`), and 401 handling must be centralized or
concurrent requests each start their own refresh.

## Decision

`src/packages/http` is the only Axios owner and the app's whole API boundary.

- `http-client.factory.ts` builds the instance and installs both interceptors. The request
  interceptor stamps `X-Request-Id` from `helpers/correlation-id.helper.ts`, sets `Accept`, and
  attaches the bearer token unless the request opted out with `skipAuth`. The response error
  interceptor maps failures, drives the 401 replay, and logs through the injected logger with
  headers redacted by `helpers/http-log.helper.ts`.
- `AxiosHttpClient` (`http-client.ts`) exposes `get/post/put/patch/delete/postMultipart/download`,
  and **every** JSON response crosses a Zod schema via `helpers/parse-response.helper.ts`; a
  contract violation raises `HttpError` with kind `response-contract`.
- `http-error.mapper.ts` normalizes: cancellation, `ECONNABORTED`/`ETIMEDOUT`, missing response, and
  then the status code — parsing the body first as the NestJS envelope
  (`schemas/api-error.schema.ts`, keeping `requestId` and field errors) and falling back to problem
  details.
- `http-client.facade.ts` is the composition seam. `start-app.ts` calls `configureAppHttpClient`
  once; gateways resolve the client lazily with `getAppHttpClient()`.
- Feature modules reach HTTP through a `gateways/*.gateway.ts` file only — one resource per file,
  endpoints from a constants file, React-free.

## Consequences

**Positive:** Backend shape changes land in one mapper and one schema. Every caller handles the same
`HttpError` union, and a wire drift fails loudly at the boundary with the offending path named.

**Negative / cost:** Every endpoint needs a schema before it can be called, which is real up-front
work for a throwaway request. The facade is a module-level singleton, so tests must call
`resetAppHttpClientForTesting()`; forgetting it produces cross-test bleed.

**Enforcement:** `architecture/no-direct-axios-import-outside-owner`,
`architecture/no-inline-api-endpoints`, `architecture/one-gateway-responsibility-per-file`,
`architecture/no-react-in-gateways`; proven by `npm run test:contract`.

## Alternatives considered

- `fetch` with a thin helper — rejected: interceptors, timeout, and cancellation would be rebuilt
  by hand, and Axios' adapter seam is what makes `adapters/test.adapter.ts` possible.
- Generating a client from an OpenAPI document — rejected for now because it couples the frontend
  build to backend spec publishing; the hand-written schemas are the contract instead.
- Validating responses only in development — rejected: a contract violation in production is
  exactly when a loud, mapped failure is worth most.

## Supersession

The backend now publishes the stable artifact adopted by
[ADR 0017](./0017-canonical-openapi-contract.md). Generated types constrain gateway signatures,
while this ADR remains authoritative for the Axios owner, interceptors, Zod parsing, and error
normalization.
