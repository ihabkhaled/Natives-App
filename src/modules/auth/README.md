# Auth module

Owns authentication and account recovery: credentials in, a session out. It is the only module that
touches tokens. Beyond login/logout it owns public self-signup, invitation acceptance, forgot/reset
password, and device-session management.

## Screens

| Route                | Access     | Purpose                                                                 |
| -------------------- | ---------- | ----------------------------------------------------------------------- |
| `/login`             | PublicOnly | Sign in; links to forgot-password and to self-signup.                   |
| `/signup`            | PublicOnly | Request an account; ends in an explicit awaiting-approval state.        |
| `/forgot-password`   | PublicOnly | Request a reset link. Enumeration-safe: one confirmation for any email. |
| `/reset-password`    | PublicOnly | Set a new password from a `?token=` link; invalid/expired link states.  |
| `/accept-invitation` | PublicOnly | Look up an invitation by `?token=`, create a password, start a session. |
| `/sessions`          | Protected  | List active devices, revoke one, or sign out all other devices.         |

## Self-signup invariants

- `POST /auth/signup` (contract 1.7.0) answers `201 { message, state: 'pending' }` and **no tokens**.
  The flow therefore never authenticates: success renders the awaiting-approval panel, and neither
  the session store nor the token repository is touched.
- Client validation in `schemas/signup-form.schema.ts` mirrors the backend `SignupRequestDto`
  exactly — email up to 320 characters, displayName 1–120, password 12–72 plus the same
  strong-password rules the reset and invitation flows enforce.
- A duplicate email answers 409. `helpers/signup-error.helper.ts` words that one case as "already
  registered or waiting for approval" instead of the generic conflict copy; every other code falls
  through to the shared error catalog.
- An account that reaches the app while still `pending` resolves to `GUARD_STATUS.AccountPending` —
  its own designed state with awaiting-approval copy — never to `AccountBlocked`, which means
  suspended.

## Recovery invariants

- Reset and invitation links carry an opaque token read from the URL through `@/packages/router`
  (`useSearchParam`); a missing, used, or expired link resolves to a single `LinkInvalidOrExpired`
  code via `services/map-auth-link-error.helper.ts`, never a raw backend message.
- Invitation inspection consumes exactly `{ email, role, inviterName, expiresAt }`. Team context is
  not invented. A missing inviter renders branded Ultimate Natives copy, and role labels are
  localized in English and Arabic.
- Invitation acceptance posts `{ token, password }` to `/invitations/accept`, securely persists the
  flat session response, then loads `/auth/me`. If that hydration fails, the newly issued tokens are
  cleared instead of fabricating a user.
- New passwords use the strong policy in `schemas/set-password-form.schema.ts` (12+ chars, mixed case,
  a digit, matching confirmation), with a visibility toggle, Caps Lock signal, and accessible summary.
- Forgot-password is enumeration-safe: the backend responds identically whether the account exists.
- Revoking a device never touches the current session's tokens; signing out the current device stays
  a plain logout.
- Session list parsing includes the backend `total`, `limit`, and `offset` metadata even though the
  current screen renders the returned page only.

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
  [self-signup flow](../../../tests/integration/auth-signup-flow.integration.test.ts),
  [token refresh](../../../tests/integration/token-refresh.integration.test.ts).
- Contract: [auth wire contract](../../../tests/contract/auth.contract.test.ts).

## Related

- Rules: [13-http-and-nest-api](../../../rules/13-http-and-nest-api.md),
  [18-security](../../../rules/18-security.md), [14-state-management](../../../rules/14-state-management.md).
- ADRs: [0010-secure-token-storage](../../../architecture/adrs/0010-secure-token-storage.md).
- Context: [auth-flow](../../../context/auth-flow.md).
