# ADR 0012: Error normalization

- Status: Accepted
- Date: 2026-07-16
- Deciders: Architecture owner

## Context

An unnormalized error reaches the UI as whatever threw it: an `AxiosError`, a Zod issue list, a
NestJS `message` array, a `TypeError`. Rendering that is three separate problems at once. It is a
security problem — backend messages disclose internals such as `ACCOUNT_LOCKED` or a stack frame.
It is a localization problem — a server string cannot be translated into Arabic. And it is a
correctness problem, because every screen writes its own `error?.response?.data?.message ?? 'Oops'`
ladder and each one is differently wrong.

## Decision

A one-way pipeline, with a named type at each stage and a mapper between them.

1. **Transport → `HttpError`.** `src/packages/http/http-error.mapper.ts` collapses every Axios
   failure into one of eleven `HTTP_ERROR_KIND` values, keeping `status`, `requestId`, and NestJS
   field errors. A response that fails its Zod schema also arrives here, as `response-contract`.
2. **`HttpError` → `AppError`.** `src/shared/mappers/http-app-error.mapper.ts` maps kind to
   `APP_ERROR_CODE` through a total `Record`, so a new kind fails to compile until it is mapped.
   `AppError` (`src/shared/errors/app.errors.ts`) is the only error type allowed to travel toward
   the UI. Services do this conversion: `get-health.service.ts` maps generically, while
   `login.service.ts` first specializes 401 into `INVALID_CREDENTIALS`.
3. **`AppError` → i18n key.** `src/shared/mappers/error-i18n.mapper.ts` maps code to key, also
   through a total `Record`.
4. **Key → copy.** The hook translates; the component renders a string it was handed.

`AppError.message` is developer-facing and belongs in logs, never on screen. The last-resort
boundary, `src/app/error-boundaries/app-error-boundary.boundary.tsx`, follows the same rule: it
renders translated copy, reports the error, and offers a reload.

## Consequences

**Positive:** Users see localized, sanitized copy in both `en` and `ar`. Adding an error kind or
code is a compile error until every mapper handles it — the taxonomy cannot drift.

**Negative / cost:** Four hops from wire to screen, and a backend that offers a genuinely useful
message cannot show it verbatim. The taxonomy is coarse by design: two different 500s look
identical to the user, so `requestId` is what makes support tractable.

**Enforcement:** `architecture/no-unsafe-error-display` (no raw error text in JSX),
`architecture/no-raw-i18n-text`, `architecture/no-raw-vendor-types-in-domain`, the exhaustive
`Record` types, `npm run quality:locales` for `en`/`ar` key parity, and 100% coverage on
`*.mapper.ts` under the pure-file policy.

## Alternatives considered

- Rendering `error.message` directly — rejected on all three grounds above; it is the default
  behavior this ADR exists to prevent.
- One error type across all layers — rejected: `HttpError` is transport vocabulary and `AppError` is
  domain vocabulary, and merging them drags Axios semantics into feature code.
- Mapping codes to copy in the component — rejected: it scatters the taxonomy across the view layer.

## Supersession

Revisit if the backend adopts stable, localized, client-safe error codes with translations — the
`AppError` stage would remain, but the code table could then be generated from the contract.
