# Skill: Add a service (use case)

**Use when:** a business operation must run outside React — fetch, map, persist, normalize failure.

## Required reading

- [rules/06 — Services and use cases](../rules/06-services-use-cases.md) — one React-free use case
  per file.
- [rules/17 — Error handling](../rules/17-error-handling.md) — the `HttpError` → `AppError`
  contract.
- [ADR 0012 — Error normalization](../architecture/adrs/0012-error-normalization.md) — why services
  are the translation point.
- [get-health.service.ts](../src/modules/health/services/get-health.service.ts) — the minimal shape.
- [login.service.ts](../src/modules/auth/services/login.service.ts) — a use case with a
  status-specific error, secure persistence, and analytics.

## Preconditions

- [ ] The gateway exists and returns parsed DTOs — see [gateway](gateway.md).
- [ ] The mapper exists, or the DTO is already the domain shape.
- [ ] You can name the use case as a verb phrase: `getHealthStatus`, `loginUser`, `logoutUser`.

## Files

```text
src/modules/<module>/services/<verb>-<noun>.service.ts
```

## Steps

1. One file, one exported use case — `architecture/one-service-use-case-per-file`. Auth has six
   service files, not one `auth.service.ts`.
2. Keep it React-free. `architecture/no-react-in-services` rejects any React import; that is what
   lets the same function run under Vitest's node environment.
3. Body: call the gateway, map to domain, return. `getHealthStatus` is
   `const dto = await requestHealth(); return mapHealthResponseToStatus(dto);`.
4. Wrap in `try/catch` and normalize on the way out:
   `throw isHttpError(error) ? mapHttpErrorToAppError(error) : toAppError(error)`.
   `mapHttpErrorToAppError` comes from `@/shared/mappers`, `toAppError` from
   `@/shared/errors/app-error.helper`.
5. When one status deserves its own code, branch on `error.kind` before the generic mapper.
   `login.service.ts` turns `HTTP_ERROR_KIND.Unauthorized` into
   `new AppError({ code: APP_ERROR_CODE.InvalidCredentials, cause: error })`, which is why a wrong
   password reads "The email or password is incorrect." and never the backend's text.
6. Add a new code to `src/shared/errors/error-codes.constants.ts` if none fits — then extend
   `ERROR_CODE_TO_I18N_KEY` in `src/shared/mappers/error-i18n.mapper.ts` and both locale catalogs.
   The `Record<AppErrorCode, I18nKey>` makes an omission a typecheck failure.
7. Side effects belong here, not in hooks: `loginUser` persists through
   `getAuthTokenRepository().setTokens(...)` and fires
   `trackEvent(AUTH_ANALYTICS_EVENTS.loginSucceeded)`. Event names come from a constants file —
   `architecture/no-inline-event-names`.
8. Decide the failure posture deliberately. `logoutUser` swallows the server error and still clears
   local tokens; the comment in that file states why. Say it in a comment when it is not obvious.

## Tests

- `<verb>-<noun>.service.test.ts`, colocated, node-friendly. Mock the gateway with
  `vi.mock('../gateways/<module>.gateway')`.
- Prove: the happy path returns mapped domain; an `HttpError` becomes an `AppError` with the right
  `code`; a non-HTTP throw becomes `APP_ERROR_CODE.Unexpected`; and the raw message never survives
  as user-facing text.
- For auth-shaped services also prove the side effect: tokens stored on success, cleared on logout
  even when the server call rejects.
- Run: `npx vitest run --project unit src/modules/<module>/services`.

## Security / accessibility / native considerations

- Never log credentials or tokens. `@/shared/security` exposes redaction; the logger sanitizes
  fields via `sanitizeLogFields`.
- Auth-adjacent services are the **critical** risk lane: they also need the integration and contract
  suites and `npm run security:secrets`.

## Documentation delta

- The module README's invariants when the failure posture is surprising — auth documents
  "`logoutUser` clears local tokens even when the server call fails".
- `context/error-flow.md` if a new `AppErrorCode` joins the taxonomy.

## Validation

```bash
npm run lint
npx vitest run --project unit src/modules/<module>/services
npm run quality:locales
npm run test:integration
```

## Forbidden shortcuts

- Letting `HttpError` escape to a hook — the UI would render a transport concept;
  `architecture/no-unsafe-error-display` catches the render, but the design breaks earlier.
- Importing `axios` to inspect a status — `architecture/no-direct-axios-import-outside-owner`; use
  `HTTP_ERROR_KIND`.
- A `use*` import for "just a toast" — `architecture/no-react-in-services`; return the outcome and
  let the mutation hook toast.
- Two use cases in one file — `architecture/one-service-use-case-per-file`.

## Definition of done

- [ ] One exported use case, React-free, in a `*.service.ts`.
- [ ] Every throw path exits as an `AppError` with a code that maps to an i18n key.
- [ ] Side effects and their failure posture are intentional and tested.
- [ ] The file clears 95% per-file coverage including the catch branches.
- [ ] `npm run lint` and `npx vitest run --project unit` pass.
