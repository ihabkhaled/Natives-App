# Error flow

From an Axios rejection to the words a user reads, with the real mapper at each hop. The decision
and its rationale are [ADR 0012](../architecture/adrs/0012-error-normalization.md).

## The pipeline

```text
AxiosError / cancel / timeout / bad body
   ↓  packages/http/http-error.mapper.ts        mapUnknownToHttpError()
HttpError { kind, status, requestId, fieldErrors }
   ↓  shared/mappers/http-app-error.mapper.ts   mapHttpErrorToAppError()
AppError { code, requestId, fieldErrors }
   ↓  shared/mappers/error-i18n.mapper.ts       mapErrorCodeToI18nKey()
I18nKey
   ↓  packages/i18n use-app-translation.hook.ts t(key)
"You are offline." / "لا يوجد اتصال بالإنترنت."
```

Two `Record` types make the pipeline total: `HTTP_KIND_TO_APP_CODE` is
`Record<HttpErrorKind, AppErrorCode>` and `ERROR_CODE_TO_I18N_KEY` is
`Record<AppErrorCode, I18nKey>`. Add a kind or a code and the build breaks until every mapper
handles it — the taxonomy cannot drift silently.

## Stage 1 — transport → `HttpError`

`mapUnknownToHttpError` discriminates in a fixed order: an existing `HttpError` passes through;
`isCancel` → `cancelled`; `ECONNABORTED`/`ETIMEDOUT` → `timeout`; no `response` → `network`;
otherwise `mapResponseToHttpError(status, body)`.

Status mapping (`kindFromStatus`): 401 → `unauthorized`, 403 → `forbidden`, 404 → `not-found`,
429 → `rate-limited`, 400/422 → `validation`, ≥500 → `server`, anything else → `unexpected`.

The body is parsed twice, in order (`parseErrorBody`): first as the NestJS envelope
(`schemas/api-error.schema.ts`), which yields `requestId`, `code`, and the `errors[]` field list;
if that fails, as RFC 9457 problem details, which yields a `title`. If neither parses, the error is
still well-formed — just without detail. A body that cannot be understood never becomes a crash.

There is one more producer: `parse-response.helper.ts` throws `HttpError` with kind
`response-contract` when a **successful** response fails its schema. A backend that silently renames
a field surfaces here, at the boundary, naming the path.

## Stage 2 — `HttpError` → `AppError`

Services own this conversion, and they may specialize before delegating:

- `get-health.service.ts` — the general shape: `isHttpError(error) ? mapHttpErrorToAppError(error)
: toAppError(error)`.
- `login.service.ts` — specializes first: a 401 from `/auth/login` means wrong credentials, not an
  expired session, so it becomes `INVALID_CREDENTIALS` rather than `UNAUTHORIZED`.

`AppError` (`src/shared/errors/app.errors.ts`) is the only error type allowed to travel toward the
UI. It carries `code`, `requestId`, and `fieldErrors`. Its `message` is developer-facing: it belongs
in logs and error reports, never on screen. `toAppError()` is the catch-all for non-HTTP throws.

The twelve codes in `APP_ERROR_CODE`: `NETWORK_OFFLINE`, `TIMEOUT`, `UNAUTHORIZED`, `FORBIDDEN`,
`NOT_FOUND`, `RATE_LIMITED`, `VALIDATION_ERROR`, `SERVER_ERROR`, `UNEXPECTED_ERROR`,
`INVALID_CREDENTIALS`, `SESSION_EXPIRED`, `DEEP_LINK_REJECTED`.

## Stage 3 and 4 — code → key → copy

`mapErrorCodeToI18nKey` returns an `I18nKey` from `src/shared/i18n/i18n-keys.constants.ts`. The
hook translates; the component receives a finished string and renders it. Both catalogs (`en.json`,
`ar.json`) must define every key — `npm run quality:locales` proves key-tree parity in both
directions and rejects orphan copy that no `I18N_KEYS` leaf claims.

## Where errors surface

| Surface                | Owner                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| Inline screen failure  | `src/shared/ui/error-state/` with a retry action                                          |
| Offline                | `src/shared/ui/offline-state/`, plus the global banner in `src/app/shell/offline-banner/` |
| Field-level validation | `src/shared/ui/form-field/`, fed by schema keys                                           |
| Transient notice       | `useAppToast()` — e.g. a rejected deep link                                               |
| Unhandled render error | `src/app/error-boundaries/app-error-boundary.boundary.tsx`                                |

The boundary follows the same rule as everything else: it renders `translateNow(...)` copy, reports
through `@/packages/error-reporting`, logs the error _name_ only, and offers `reloadApplication`.
Sentry runs with `sendDefaultPii: false` and stays disabled entirely without a DSN.

## The guardrails

`architecture/no-unsafe-error-display` rejects raw error text in JSX.
`architecture/no-raw-i18n-text` rejects untranslated literals.
`architecture/no-raw-vendor-types-in-domain` keeps `AxiosError` out of feature code. The pure-file
coverage policy requires 100% on every `*.mapper.ts`, so an unmapped branch fails the build.
`tests/e2e/auth.spec.ts` closes the loop from the outside: a locked account must show a permission
message, never the backend's `ACCOUNT_LOCKED` text.
