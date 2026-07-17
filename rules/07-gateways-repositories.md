# 07 — Gateways and repositories

> Authority: normative. Conflicts resolve in favor of ADRs and the security policy.

## Mandatory

- MUST scope one `*.gateway.ts` to one backend resource, and MUST name every exported function
  `request*` — `requestHealth`, `requestLogin`, `requestRefresh`.
- MUST parse every response body through a Zod schema from the module's `*.schema.ts` before the
  value leaves the gateway, so unvalidated wire data never enters the app.
- MUST resolve the HTTP client lazily per call through `getAppHttpClient()`, never by capturing it
  at module scope.
- MUST pass endpoint paths as constants from the module's `*-api.constants.ts`.
- MUST declare request intent explicitly: `skipAuth` for public or credential-bearing endpoints,
  `skipRetryOnUnauthorized` for the refresh endpoint itself.
- MUST implement a `*.repository.ts` as a persistence port only — key in, value out — over a storage
  owner facade.
- MUST keep gateway and repository files free of React.

## Forbidden

- NEVER export anything but `request*` functions and types from a gateway; helpers, constants, and
  schemas belong in companion files.
- NEVER map, translate, retry, or interpret an error inside a gateway; that is the service's job.
- NEVER return a raw DTO to a component — a service maps it to a domain type first.
- NEVER let a repository choose its storage backend inline; it composes the owner facade.

## Rationale

Gateways are the only place a URL, a verb, and a schema meet, which makes the app's entire network
surface greppable as `request*`. Parsing at the boundary means a backend that changes shape fails at
one file with a schema error, not three screens later with `undefined`. Keeping interpretation out
of gateways is what allows the HTTP owner to normalize transport concerns once for everyone.

## Valid

```ts
// src/modules/auth/gateways/auth.gateway.ts
export function requestRefresh(refreshToken: string): Promise<AuthTokensDto> {
  return getAppHttpClient().post(AUTH_API_PATHS.refresh, { refreshToken }, authTokensSchema, {
    skipAuth: true,
    skipRetryOnUnauthorized: true,
  });
}
```

## Invalid

```ts
// src/modules/auth/gateways/auth.gateway.ts
export const AUTH_BASE = '/auth'; // non-request export, and an inline path

export async function requestRefresh(token: string) {
  try {
    return await getAppHttpClient().post('/auth/refresh', { token }); // literal, no schema
  } catch (error) {
    throw new AppError({ code: APP_ERROR_CODE.SessionExpired }); // interpretation in a gateway
  }
}
```

## Enforcement

| Mechanism                                          | Command                          |
| -------------------------------------------------- | -------------------------------- |
| `architecture/one-gateway-responsibility-per-file` | `npm run lint`                   |
| `architecture/no-react-in-gateways`                | `npm run lint`                   |
| `architecture/no-inline-api-endpoints`             | `npm run lint`                   |
| `architecture/no-inline-routes`                    | `npm run lint`                   |
| Wire contracts exercised against mock handlers     | `npm run test:contract`          |
| Schema files at 100% coverage                      | `npm run test:coverage:per-file` |

Manual review where mechanical enforcement is impossible: the linter checks that a schema argument
is passed, not that the schema is _right_. Only the contract tests plus a reviewer comparing the
schema to the NestJS DTO can catch a field typed `string` that the backend sends as `number`.

## Definition of done

- [ ] Every export is a `request*` function, and every response crosses a schema.
- [ ] `skipAuth` and `skipRetryOnUnauthorized` are set deliberately, not by default.
- [ ] A contract test covers the endpoint's success and failure envelopes.

## Related

[06-services-use-cases](06-services-use-cases.md) · [13-http-and-nest-api](13-http-and-nest-api.md) ·
[18-security](18-security.md) ·
[../docs/eslint/one-gateway-responsibility-per-file.md](../docs/eslint/one-gateway-responsibility-per-file.md)

ADR: [0013](../architecture/adrs/0013-boundary-validation.md).
