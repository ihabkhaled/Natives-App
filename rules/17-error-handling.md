# 17 — Error handling

> Authority: normative. Conflicts resolve in favor of ADRs and the security policy.

## Mandatory

- MUST use exactly two error types: `HttpError` inside `@/packages/http`, and `AppError` everywhere
  above a service. Nothing else crosses a layer boundary toward the UI.
- MUST tag every `AppError` with an `APP_ERROR_CODE` member: `NETWORK_OFFLINE`, `TIMEOUT`,
  `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `RATE_LIMITED`, `VALIDATION_ERROR`, `SERVER_ERROR`,
  `UNEXPECTED_ERROR`, `INVALID_CREDENTIALS`, `SESSION_EXPIRED`, `DEEP_LINK_REJECTED`.
- MUST convert at the service boundary with `mapHttpErrorToAppError` for transport failures and
  `toAppError` for anything else, so no `catch` block invents its own taxonomy.
- MUST resolve user-facing copy from the code through `mapErrorCodeToI18nKey`, keeping the mapping
  total: every code has a key, checked by `Record<AppErrorCode, I18nKey>`.
- MUST treat an `AppError.message` as developer-facing only, and MUST carry `requestId` through so
  a user-visible failure can be correlated with a backend log.
- MUST catch render-time failures in `AppErrorBoundary`, which reports the error, logs its name, and
  renders a sanitized `ErrorState` with a reload action.
- MUST keep `catch` parameters `unknown` and narrow them explicitly —
  `useUnknownInCatchVariables` is on.

## Forbidden

- NEVER render an error object or `error.message` in JSX; the linter rejects `{error}` and
  `{error.message}` in a container.
- NEVER show a backend string to a user: wrong credentials surface as `INVALID_CREDENTIALS` copy,
  not as whatever the API wrote.
- NEVER swallow an error silently; map it, surface it, or log it deliberately with a reason.
- NEVER add a new error code without extending both the HTTP-kind mapping and the i18n mapping.

## Rationale

Raw error text is the easiest way to leak server internals — stack fragments, table names, upstream
URLs — into a screenshot. Mapping codes to keys also makes failure states translatable, which raw
messages never are. Keeping the two mapping tables exhaustive via `Record<...>` means adding a code
is a compile error until it is handled everywhere, instead of a silent fallthrough to "something
went wrong".

## Valid

```ts
// src/modules/health/hooks/use-health-card.hook.ts
errorMessage:
  healthQuery.error === null ? undefined : t(mapErrorCodeToI18nKey(healthQuery.error.code)),
```

## Invalid

```tsx
// src/modules/health/containers/health-card.container.tsx
export function HealthCardContainer(): React.JSX.Element {
  const view = useHealthCard();
  return <IonNote>{view.error.message}</IonNote>; // raw error text rendered to the user
}
```

## Enforcement

| Mechanism                                                          | Command                          |
| ------------------------------------------------------------------ | -------------------------------- |
| `architecture/no-unsafe-error-display`                             | `npm run lint`                   |
| `@typescript-eslint/no-unsafe-*` on the strict type-checked preset | `npm run lint`                   |
| `useUnknownInCatchVariables` in `tsconfig.base.json`               | `npm run typecheck`              |
| `Record<AppErrorCode, …>` totality in the mappers                  | `npm run typecheck`              |
| Mapper files at 100% coverage                                      | `npm run test:coverage:per-file` |
| Error envelopes end to end                                         | `npm run test:contract`          |

Manual review where mechanical enforcement is impossible: code _choice_. Mapping a 500 to
`NETWORK_OFFLINE` type-checks, passes every gate, and tells the user a lie. Reviewers own the
semantics of the mapping tables.

## Definition of done

- [ ] Every new failure path produces an `AppError` with a deliberate code.
- [ ] The code has an i18n key, and both mapping tables still compile as total.
- [ ] Nothing in the diff renders an error object, a message, or a status code to a user.

## Related

[13-http-and-nest-api](13-http-and-nest-api.md) · [06-services-use-cases](06-services-use-cases.md) ·
[27-observability](27-observability.md) ·
[../docs/eslint/no-unsafe-error-display.md](../docs/eslint/no-unsafe-error-display.md)

ADR: [0012](../architecture/adrs/0012-error-normalization.md).
