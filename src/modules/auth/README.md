# Auth module

Owns authentication: credentials in, a session out. It is the only module that touches tokens.

## Public surface (`index.ts`)

| Export                                                                       | Purpose                                                         |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `useSession`                                                                 | Session status for guards and screens (never tokens).           |
| `useCurrentUserQuery`                                                        | The authenticated profile, owned by TanStack Query.             |
| `useLogoutMutation`                                                          | Ends the session and clears cached server state.                |
| `getAuthTokenRepository` / `createAuthTokenRepository`                       | Secure token storage, injected into the HTTP owner.             |
| `createRefreshExecutor`                                                      | Refresh gateway call, wired into the single-flight coordinator. |
| `bootstrapSessionFromStoredTokens`                                           | Derives the startup session status.                             |
| `handleAuthFailure`                                                          | Unrecoverable-auth callback for the HTTP owner.                 |
| `getAuthRouteDefinitions`                                                    | `/login` route definition.                                      |
| `authQueryKeys`, `buildAuthUser`, wire schemas, `SESSION_STATUS`, `AuthUser` | Contracts and test factories.                                   |

Everything else is internal. Cross-module imports use `@/modules/auth` only.

## Anatomy

```text
constants → schemas → mappers → gateways → repositories → services → store
  → queries/mutations → hooks → components → containers → routes
```

- `gateways/auth.gateway.ts` — the four NestJS endpoints, schema-parsed.
- `repositories/token.repository.ts` — tokens through `@/packages/secure-storage` only.
- `services/*.service.ts` — one use case per file; React-free; maps `HttpError` to `AppError`.
- `store/session.store.ts` — status only: never profile data (that is server state), never tokens.

## Invariants

- Login and refresh calls set `skipAuth` and `skipRetryOnUnauthorized`: they must never trigger the
  refresh interceptor that calls them.
- `logoutUser` clears local tokens even when the server call fails.
- Validation messages in `schemas/login-form.schema.ts` are i18n **keys**; hooks translate them.
- Wrong credentials surface as `INVALID_CREDENTIALS`, never a raw backend message.

## Tests

- Unit: colocated `*.test.ts(x)`.
- Integration: [auth login flow](../../../tests/integration/auth-login-flow.integration.test.ts),
  [token refresh](../../../tests/integration/token-refresh.integration.test.ts).
- Contract: [auth wire contract](../../../tests/contract/auth.contract.test.ts).

## Related

- Rules: [13-http-and-nest-api](../../../rules/13-http-and-nest-api.md),
  [18-security](../../../rules/18-security.md), [14-state-management](../../../rules/14-state-management.md).
- ADRs: [0010-secure-token-storage](../../../architecture/adrs/0010-secure-token-storage.md).
- Context: [auth-flow](../../../context/auth-flow.md).
