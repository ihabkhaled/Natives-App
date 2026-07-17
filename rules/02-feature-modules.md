# 02 — Feature modules

> Authority: normative. Conflicts resolve in favor of ADRs and the security policy.

## Mandatory

- MUST give every feature its own directory under `src/modules/<name>/` holding the whole vertical
  slice: constants, schemas, mappers, gateways, repositories, services, store, queries, mutations,
  hooks, components, containers, routes.
- MUST expose an `index.ts` that is a re-export surface and nothing else — no logic, no `const`, no
  side effects (a package owner's side-effect style import is the only exception, and only there).
- MUST publish the smallest surface that callers need: containers, route definitions, query keys,
  wire schemas, domain types. Everything else stays internal.
- MUST accompany each module with a `README.md` covering its public surface, anatomy, and
  invariants.
- MUST use named exports throughout application source.
- MUST re-export a vendor type through its owner package when a module needs one.

## Forbidden

- NEVER deep-import another module: `@/modules/auth/store/session.store` is rejected, only
  `@/modules/auth` is legal.
- NEVER import a vendor type directly inside `src/modules/**`, even as `import type` — the domain
  speaks app-owned types.
- NEVER default-export from application source.
- NEVER let two modules import each other's internals to "share" something; promote the shared piece
  to `src/shared` or a package owner instead.

## Rationale

A module is a contract, not a folder: the `index.ts` is the only thing other code may depend on, so
everything behind it can be refactored freely. Blocking deep imports is what keeps that promise
mechanically true rather than aspirational. Banning raw vendor types in the domain means a library
upgrade cannot ripple through feature code that never chose that library.

## Valid

```ts
// src/modules/health/index.ts
export { HealthCardContainer } from './containers/health-card.container';
export { healthQueryKeys } from './queries/health.keys';
export { healthResponseSchema } from './schemas/health.schema';
export type { HealthStatus } from './types/health.types';
```

## Invalid

```ts
// src/modules/home/containers/home.container.tsx
import { useSessionStore } from '@/modules/auth/store/session.store'; // deep import
import type { AxiosError } from 'axios'; // raw vendor type inside a feature module
```

## Enforcement

| Mechanism                                      | Command                        |
| ---------------------------------------------- | ------------------------------ |
| `architecture/no-cross-module-deep-imports`    | `npm run lint`                 |
| `architecture/require-module-public-surface`   | `npm run lint`                 |
| `architecture/no-raw-vendor-types-in-domain`   | `npm run lint`                 |
| `architecture/no-default-export-in-app-source` | `npm run lint`                 |
| Index-is-re-exports-only surface gate          | `npm run quality:exports`      |
| Module `index.ts` + `README.md` presence       | `npm run quality:architecture` |
| Unused public exports and dead files           | `npm run quality:dead-code`    |

Manual review where mechanical enforcement is impossible: surface _size_. Nothing stops a module
from exporting all of its internals one export at a time; a reviewer must ask whether each new
export is a contract or a leak.

## Definition of done

- [ ] The module's `index.ts` exports only what callers genuinely need.
- [ ] No caller reaches past `@/modules/<name>`.
- [ ] The module `README.md` matches the surface the code actually exports.
- [ ] `npm run quality:exports` and `npm run quality:dead-code` pass.

## Related

[01-architecture-and-dependency-direction](01-architecture-and-dependency-direction.md) ·
[09-package-ownership](09-package-ownership.md) · [24-documentation](24-documentation.md) ·
[../src/modules/health/README.md](../src/modules/health/README.md)
