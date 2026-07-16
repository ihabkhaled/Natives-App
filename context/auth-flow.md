# Auth flow

Login, refresh, failure, and logout — with the real file for every step. The storage decision is
[ADR 0010](../architecture/adrs/0010-secure-token-storage.md); the transport is
[api-flow](./api-flow.md).

## Wiring (once, at startup)

`src/app/startup/start-app.ts` is the only place the auth module and the HTTP owner meet:

```ts
configureAppHttpClient(
  createHttpClient({
    config: { baseUrl: environment.apiBaseUrl, timeoutMs: environment.apiTimeoutMs },
    tokenStore: getAuthTokenRepository(), // auth/repositories/token.repository.ts
    refreshExecutor: createRefreshExecutor(), // auth/services/refresh-session.service.ts
    onAuthFailure: handleAuthFailure, // auth/services/auth-failure.service.ts
    logger: getPlatformLogger('http'),
  }),
);
```

`src/packages/http` never imports the auth module — it declares the `TokenStore` interface and the
`RefreshExecutor` type, and the app injects implementations. That is what keeps the layer direction
intact while giving the interceptor everything it needs.

Then `bootstrapSessionFromStoredTokens()` reads the stored access token and sets the session store
to `authenticated` or `anonymous` — before the first render, so the route guard never flashes.

## Login

1. `login.container.tsx` renders `login-form.component.tsx`; `use-login-form.hook.ts` validates
   against `schemas/login-form.schema.ts`, whose messages are i18n **keys** the hook translates.
2. `use-login-mutation.hook.ts` calls `loginUser()` (`services/login.service.ts`).
3. `requestLogin()` (`gateways/auth.gateway.ts`) POSTs `/auth/login` with **both**
   `skipAuth: true` and `skipRetryOnUnauthorized: true`.
4. On success: `mapLoginResponseToSession()` → `getAuthTokenRepository().setTokens(...)` →
   `trackEvent(loginSucceeded)`.
5. On failure: `toLoginError()` maps a 401 specifically to `INVALID_CREDENTIALS`; everything else
   goes through the shared `mapHttpErrorToAppError`. The backend's own message never reaches the
   screen — see [error-flow](./error-flow.md).

Both flags on the login call matter. `skipAuth` prevents sending a stale bearer token to the login
endpoint; `skipRetryOnUnauthorized` prevents a wrong password (a legitimate 401) from being
misread as an expired session and triggering a refresh.

## Token storage

`repositories/token.repository.ts` implements `TokenStore` over `@/packages/secure-storage`, keyed
by `STORAGE_KEYS.authAccessToken` / `authRefreshToken`. Native gets hardware-backed storage; web
gets the documented in-memory + `sessionStorage` development fallback that warns once and is not
secure at rest. `getAuthTokenRepository()` memoizes one shared instance.

## 401 → single-flight refresh → replay

The coordinator is `src/packages/http/token-refresh.coordinator.ts`, constructed by the factory only
when a `refreshExecutor` was injected.

```text
request A ─┐                      ┌─ 401 ─┐
request B ─┼─ expired token ──────┼─ 401 ─┼─→ getFreshAccessToken()
request C ─┘                      └─ 401 ─┘        │
                                                   ├─ #inFlight ??= #refresh()   ← ONE call
                                                   ├─ POST /auth/refresh
                                                   ├─ tokenStore.setTokens(pair)
                                                   └─→ all three replay with the fresh token
```

`getFreshAccessToken()` assigns
`#inFlight ??= this.#refresh().finally(() => { #inFlight = null; })`, so concurrent callers await
one promise and exactly one refresh goes out. `createUnauthorizedRetryHandler` then sets
`appRetried = true`, rewrites the `Authorization` header, and re-issues the original request.
`appRetried` is the loop guard: a replay that 401s again is not retried.

## Refresh failure → clear + anonymous

`#refresh()` fails when there is no refresh token or the executor throws. Either way
`#handleFailure()` runs: `tokenStore.clearTokens()` then `onAuthFailure?.()` → `handleAuthFailure()`
→ `useSessionStore.getState().markAnonymous()`. The original request's `HttpError` still propagates
and maps to `UNAUTHORIZED`, so the caller sees a real failure while the guard redirects to `/login`.

`tests/integration/token-refresh.integration.test.ts` proves all of it against MSW: three concurrent
`getCurrentUser()` calls produce exactly one `/auth/refresh`, and a rejected refresh yields the
error code, the anonymous status, and a null refresh token.

## Logout

`logout.service.ts` calls `requestLogout()` (with `skipRetryOnUnauthorized: true`) inside a
try/catch that intentionally swallows the error, then **always** clears tokens and tracks
`logoutCompleted`. A logout must not fail because the network did. `use-logout-mutation.hook.ts`
clears cached server state afterwards; the session store returns to `anonymous` and the guard
redirects.

## Invariants worth re-checking

- The session store holds status only — never tokens, never the profile (that is server state,
  `use-current-user-query.hook.ts`).
- `/auth/login` and `/auth/refresh` always set both skip flags; `/auth/refresh` triggering its own
  refresh would be an infinite loop.
- Tokens never appear in logs (`sanitizeHeadersForLog`), in Preferences, or in `localStorage` —
  `tests/e2e/auth.spec.ts` asserts the last one against a real signed-in session.
