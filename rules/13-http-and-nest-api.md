# 13 — HTTP and the NestJS API

> Authority: normative. Conflicts resolve in favor of ADRs and the security policy.

## Mandatory

- MUST perform every network call through `@/packages/http`, whose `HttpClient` exposes `get`,
  `post`, `put`, `patch`, `delete`, `postMultipart`, and `download`.
- MUST pass a response schema to every body-returning method; the client parses before returning.
- MUST wire the client once at startup via `configureAppHttpClient(createHttpClient({...}))` with
  the validated base URL and timeout, the auth module's token store, its refresh executor, the
  auth-failure handler, and a scoped logger.
- MUST let the request interceptor own cross-cutting headers: a fresh `X-Request-Id` per request,
  `Accept: application/json`, and the bearer token unless `skipAuth` is set.
- MUST normalize every failure into `HttpError` with a `kind` from `HTTP_ERROR_KIND` — `network`,
  `timeout`, `cancelled`, `unauthorized`, `forbidden`, `not-found`, `rate-limited`, `validation`,
  `server`, `response-contract`, `unexpected`.
- MUST parse the NestJS error envelope (`statusCode`, `code`, `message`, `errors[]`, `path`,
  `timestamp`, `requestId`) and fall back to RFC 9457 problem details, carrying `requestId` and
  field errors onto the `HttpError`.
- MUST refresh through the single-flight `TokenRefreshCoordinator`: concurrent 401s await one
  refresh promise, replay once with the fresh token, and a failed refresh clears tokens and fires
  the auth-failure handler.
- MUST set `skipAuth` and `skipRetryOnUnauthorized` on login and refresh calls, so the endpoints
  that produce tokens can never be retried by the interceptor that consumes them.

## Forbidden

- NEVER import `axios` outside `src/packages/http`.
- NEVER pass an endpoint string literal to a client method; pass an api-path constant.
- NEVER hand-roll a retry, a refresh queue, or a 401 handler in a module — the coordinator owns it.
- NEVER return an unparsed body to feature code, and never surface an `HttpError` to a component.

## Rationale

Concurrent 401s are the classic mobile failure: three queries expire together, three refreshes race,
two of them invalidate the winner's token, and the user is logged out mid-session. Single-flight
refresh with one replay per request removes the race by construction. Normalizing every transport
outcome into one `HttpError` shape is what lets services map to `AppError` with a total, exhaustive
table instead of guessing at Axios internals.

## Valid

```ts
// src/modules/auth/services/login.service.ts
export async function loginUser(credentials: LoginCredentials): Promise<AuthUser> {
  try {
    const dto = await requestLogin(credentials); // gateway sets skipAuth + skipRetryOnUnauthorized
    await getAuthTokenRepository().setTokens({
      accessToken: dto.accessToken,
      refreshToken: dto.refreshToken,
    });
    return buildAuthUser(dto.user);
  } catch (error) {
    throw isHttpError(error) ? mapHttpErrorToAppError(error) : toAppError(error);
  }
}
```

## Invalid

```ts
// src/modules/auth/gateways/auth.gateway.ts
import axios from 'axios'; // owner is @/packages/http

export async function requestLogin(body: LoginCredentials) {
  const response = await axios.post('/auth/login', body); // literal path, no schema, no flags
  return response.data; // unparsed body into the domain
}
```

## Enforcement

| Mechanism                                           | Command                             |
| --------------------------------------------------- | ----------------------------------- |
| `architecture/no-direct-axios-import-outside-owner` | `npm run lint`                      |
| `architecture/no-inline-api-endpoints`              | `npm run lint`                      |
| `architecture/one-gateway-responsibility-per-file`  | `npm run lint`                      |
| Refresh coordinator and client unit tests           | `npm run test:unit`                 |
| Concurrent-401 replay against MSW                   | `npm run test:integration`          |
| Wire envelopes, success and error                   | `npm run test:contract`             |
| Axios owner dir matches the registry                | `npm run quality:package-ownership` |

Manual review where mechanical enforcement is impossible: whether a schema matches the NestJS DTO it
claims to mirror. Contract tests only prove the app agrees with its own mocks — the mocks and the
backend must be compared by a person, or by a generated client.

## Definition of done

- [ ] The call goes through the HTTP owner with a path constant and a response schema.
- [ ] Token-producing endpoints set `skipAuth` and `skipRetryOnUnauthorized`.
- [ ] Failures leave the service as `AppError`; `requestId` survives for support.

## Related

[07-gateways-repositories](07-gateways-repositories.md) · [17-error-handling](17-error-handling.md) ·
[18-security](18-security.md) · [../src/modules/auth/README.md](../src/modules/auth/README.md)

ADR: [0007](../architecture/adrs/0007-axios-nest-api-boundary.md).
