# 06 — Services and use cases

> Authority: normative. Conflicts resolve in favor of ADRs and the security policy.

## Mandatory

- MUST express one use case per `*.service.ts` file, exported as one function named for the action:
  `getHealthStatus`, `loginUser`, `logoutUser`, `refreshSession`.
- MUST keep services and every pure layer — helper, utils, mapper, schema, constants, enums, keys,
  paths, migrations, selectors, parser — free of React imports.
- MUST let a service orchestrate only: call a gateway, run a mapper, touch a repository, and return
  a domain type.
- MUST translate transport failure into domain failure at this boundary — catch `HttpError`, return
  or throw an `AppError` — so nothing above a service ever handles a transport concern.
- MUST complete the local side of an operation even when the remote side fails, where the invariant
  demands it: `logoutUser` clears stored tokens whether or not the server call succeeds.
- MUST keep the mapping from wire DTO to domain type in a `*.mapper.ts` file, not inline.

## Forbidden

- NEVER export a second use case from a service file; a second use case is a second file.
- NEVER import `react` or `react-dom` from a service, mapper, helper, schema, or selector.
- NEVER let an `HttpError` escape a service into a hook, container, or component.
- NEVER read or write component state, context, or a store from a service.

## Rationale

A use case per file makes the module's capability list readable from the directory listing, and
keeps each unit small enough for exhaustive tests. Framework-free services are testable with no
renderer and portable if the UI layer ever changes. Converting `HttpError` to `AppError` exactly
here is what lets [17-error-handling](17-error-handling.md) promise that the UI only ever sees codes
it can translate.

## Valid

```ts
// src/modules/health/services/get-health.service.ts
export async function getHealthStatus(): Promise<HealthStatus> {
  try {
    const dto = await requestHealth();
    return mapHealthResponseToStatus(dto);
  } catch (error) {
    throw isHttpError(error) ? mapHttpErrorToAppError(error) : toAppError(error);
  }
}
```

## Invalid

```ts
// src/modules/health/services/get-health.service.ts
import { useQueryClient } from '@tanstack/react-query'; // React-land inside a service

export async function getHealthStatus(): Promise<HealthStatus> {
  const dto = await requestHealth(); // no HttpError → AppError translation
  return { isHealthy: dto.status === 'ok', version: dto.version, checkedAtIso: dto.timestamp };
}

export async function pingHealth(): Promise<void> {} // second use case in one service file
```

## Enforcement

| Mechanism                                         | Command                          |
| ------------------------------------------------- | -------------------------------- |
| `architecture/one-service-use-case-per-file`      | `npm run lint`                   |
| `architecture/no-react-in-services`               | `npm run lint`                   |
| `architecture/no-react-in-pure-layers`            | `npm run lint`                   |
| Mapper files at 100% coverage                     | `npm run test:coverage:per-file` |
| `sonarjs/cognitive-complexity` 10, `complexity` 8 | `npm run lint`                   |

Manual review where mechanical enforcement is impossible: "one use case" is judged by the export
count, so a single exported function that quietly does three things passes. Watch for services whose
name contains "and", or whose body reads as a sequence of unrelated steps.

## Definition of done

- [ ] The service exports one function whose name says what it does.
- [ ] Every throw path leaves as an `AppError` with a code the UI can translate.
- [ ] No React, no store access, and no inline DTO mapping in the file.

## Related

[07-gateways-repositories](07-gateways-repositories.md) · [17-error-handling](17-error-handling.md) ·
[08-types-interfaces-enums-constants](08-types-interfaces-enums-constants.md) ·
[../src/modules/auth/README.md](../src/modules/auth/README.md)
