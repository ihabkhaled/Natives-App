# NestJS API contract

The client is written against this contract. Mock mode and remote mode are parsed by the _same_
Zod schemas, so a contract drift fails tests rather than surfacing as a runtime surprise.

## Base URL

```text
VITE_API_BASE_URL=https://api.example.com/api/v1
```

The version prefix belongs in the base URL. Endpoint constants are relative
(`/auth/login`, `/health`) and live in each module's `constants/*-api.constants.ts`.

## Success payloads

Resources are returned directly:

```json
{ "id": "user-1", "email": "ranger@example.com", "displayName": "Ranger One" }
```

An envelope is also supported where a resource needs metadata:

```json
{ "data": {}, "meta": { "requestId": "..." } }
```

Paginated collections:

```json
{
  "data": [],
  "meta": { "page": 1, "pageSize": 20, "total": 100, "pageCount": 5, "requestId": "..." }
}
```

## Error envelope

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": [{ "field": "email", "code": "INVALID_EMAIL", "message": "email must be an email" }],
  "path": "/api/v1/auth/login",
  "timestamp": "2026-07-16T00:00:00.000Z",
  "requestId": "..."
}
```

RFC 9457 problem-details responses are also accepted; see
[`src/packages/http/schemas/api-error.schema.ts`](../../src/packages/http/schemas/api-error.schema.ts).

`message` is developer-facing. It is **never** rendered: the client maps `code`/status to an
`AppError` code and then to an i18n key. This is enforced by `architecture/no-unsafe-error-display`
and proven by
[`tests/integration/health-error-state.integration.test.tsx`](../../tests/integration/health-error-state.integration.test.tsx),
which asserts the raw backend string is absent from the DOM.

## Status → application code

| Status          | `HttpError.kind`    | `AppError.code`                        | User sees            |
| --------------- | ------------------- | -------------------------------------- | -------------------- |
| network failure | `network`           | `NETWORK_OFFLINE`                      | offline copy         |
| timeout         | `timeout`           | `TIMEOUT`                              | retry copy           |
| 401             | `unauthorized`      | `UNAUTHORIZED` / `INVALID_CREDENTIALS` | sign-in copy         |
| 403             | `forbidden`         | `FORBIDDEN`                            | permission copy      |
| 404             | `not-found`         | `NOT_FOUND`                            | not-found copy       |
| 429             | `rate-limited`      | `RATE_LIMITED`                         | slow-down copy       |
| 400 / 422       | `validation`        | `VALIDATION_ERROR`                     | field errors         |
| >= 500          | `server`            | `SERVER_ERROR`                         | generic failure copy |
| schema mismatch | `response-contract` | `UNEXPECTED_ERROR`                     | generic failure copy |

## Authentication

- `POST /auth/login` → `{ tokens: { accessToken, refreshToken }, user }`
- `POST /auth/refresh` → `{ accessToken, refreshToken, refreshTokenExpiresAt, userId }`
- `POST /auth/logout` with `{ refreshToken }` → `{ message }`
- `GET /auth/me` → the same auth-user resource shape nested under login

Requirements the client depends on:

1. `401` on an expired access token. The client refreshes once (single-flight) and replays.
2. `/auth/refresh` must reject an invalid refresh token with `401` — the client then clears tokens
   and drops to anonymous. It never retries a refresh with the same token.
3. Rotating refresh tokens is supported: the client stores whatever the refresh response returns.

## Request headers

| Header                    | Value                                                         |
| ------------------------- | ------------------------------------------------------------- |
| `Authorization`           | `Bearer <accessToken>`, unless the call opts out (`skipAuth`) |
| `X-Request-Id`            | Per-request correlation id, generated client-side             |
| `Accept` / `Content-Type` | `application/json`                                            |

Preserve `X-Request-Id` in your logs: it is the only handle support has, and it is the one piece of
the request the client is allowed to show a user (`common.requestId`).

## Health

`GET /health` is public (`skipAuth`) and returns:

```json
{ "status": "ok", "version": "1.0.0", "timestamp": "2026-07-16T12:00:00.000Z" }
```
