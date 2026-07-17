# 00 — Non-negotiable rules

> Authority: normative. Conflicts resolve in favor of ADRs and the security policy.

## Mandatory

1. Imports MUST flow one way only: `app → modules → platform → shared → packages`.
   [01-architecture-and-dependency-direction](01-architecture-and-dependency-direction.md)
2. Package owners MUST NOT import app, platform, shared, or module code.
   [01](01-architecture-and-dependency-direction.md)
3. `src/shared` MUST stay ignorant of every feature module.
   [01](01-architecture-and-dependency-direction.md)
4. Business-logic kinds (service, gateway, repository, store, query, mutation) MUST live in a
   module, never in `src/app` or `src/shared`. [01](01-architecture-and-dependency-direction.md)
5. Cross-module access MUST go through `@/modules/<name>` and nothing deeper.
   [02-feature-modules](02-feature-modules.md)
6. Every module MUST ship an `index.ts` public surface and a `README.md`.
   [02](02-feature-modules.md), [24-documentation](24-documentation.md)
7. Application source MUST export by name; default exports are rejected.
   [02](02-feature-modules.md)
8. Every third-party package MUST have exactly one registered owner directory.
   [09-package-ownership](09-package-ownership.md)
9. Feature code MUST reach a vendor through its owner facade, never by importing it.
   [09](09-package-ownership.md)
10. Ionic MUST enter the app only through `@/packages/ionic` and `@/packages/router`.
    [10-ionic-boundaries](10-ionic-boundaries.md)
11. Each `@capacitor/*` plugin MUST have its own owner package.
    [11-capacitor-native-boundaries](11-capacitor-native-boundaries.md)
12. Every native listener registration MUST return a captured cleanup handle. [11](11-capacitor-native-boundaries.md)
13. Presentational components MUST NOT call hooks or branch on control-flow statements.
    [03-components](03-components.md)
14. A UI file MUST declare exactly one component, in a folder named after it. [03](03-components.md)
15. Containers MUST do nothing but wire one hook to one component. [04-containers](04-containers.md)
16. React hooks MUST be invoked only inside `*.hook.ts`, one primary hook per file.
    [05-hooks-and-effects](05-hooks-and-effects.md)
17. A service file MUST export one use case and stay React-free.
    [06-services-use-cases](06-services-use-cases.md)
18. A gateway MUST export only `request*` functions and parse every response through a schema.
    [07-gateways-repositories](07-gateways-repositories.md)
19. The TypeScript `enum` keyword MUST NOT appear; use as-const objects with derived unions.
    [08-types-interfaces-enums-constants](08-types-interfaces-enums-constants.md)
20. Module-scope literal configuration MUST live in a declaration-home file. [08](08-types-interfaces-enums-constants.md)
21. Raw route strings MUST exist only in `*.paths.ts` and `*.constants.ts`.
    [12-routing-and-deep-links](12-routing-and-deep-links.md)
22. Endpoint literals MUST NOT reach the HTTP client; pass an api-path constant.
    [13-http-and-nest-api](13-http-and-nest-api.md)
23. Query keys MUST come from a module `*.keys.ts` builder.
    [15-server-state-and-queries](15-server-state-and-queries.md)
24. Client stores MUST NOT import gateways, queries, or mutations.
    [14-state-management](14-state-management.md)
25. Tokens MUST live only behind `@/packages/secure-storage`. [18-security](18-security.md)
26. Persisted keys MUST come from `STORAGE_KEYS`. [18](18-security.md)
27. `import.meta.env` MUST be read only in `@/packages/environment`; `process.env` never in `src/`.
    [18](18-security.md)
28. Errors MUST reach users as copy translated from an `AppErrorCode`, never as raw messages.
    [17-error-handling](17-error-handling.md)
29. User-visible text MUST arrive through the i18n pipeline, with `en`/`ar` catalogs at parity.
    [21-i18n-rtl](21-i18n-rtl.md)
30. `console` MUST NOT be called outside `@/packages/logger`. [27-observability](27-observability.md)
31. Every production file MUST hold 95% per-file coverage; pure-logic globs MUST hold 100%.
    [22-testing-and-coverage](22-testing-and-coverage.md)
32. Lint MUST pass at zero warnings under the strict TypeScript and complexity budgets.
    [23-eslint-typescript](23-eslint-typescript.md)
33. Every `eslint-disable` MUST cite a documented `EXC-nnnn` identifier.
    [29-exceptions](29-exceptions.md)
34. `npm run validate` MUST pass before a release; no gate may be weakened to make it pass.
    [30-release-gates](30-release-gates.md)

## Forbidden

- NEVER add a rule to this corpus without naming the mechanism that enforces it, or admitting there
  is none.
- NEVER relax a threshold, delete a gate from a `validate` chain, or ignore a file to make a red
  build green.
- NEVER treat the generated `.ai/` plane as authority: it is a summary of these files, not a source.

## Rationale

A boilerplate is only strict if strictness survives contact with a deadline. Every invariant above
is enforced by a rule or a script that fails the build, so the cost of breaking one is immediate and
impersonal rather than a debate in review. The index exists so a reader — human or agent — can find
the governing rule for any change in one hop.

## Valid

```ts
// src/modules/health/gateways/health.gateway.ts
import { getAppHttpClient } from '@/packages/http';

import { HEALTH_API_PATHS } from '../constants/health-api.constants';
import { healthResponseSchema } from '../schemas/health.schema';

export function requestHealth() {
  return getAppHttpClient().get(HEALTH_API_PATHS.health, healthResponseSchema, { skipAuth: true });
}
```

## Invalid

```ts
// src/packages/http/http-client.facade.ts
import { getAuthTokenRepository } from '@/modules/auth'; // packages → modules inverts direction

export function getAppHttpClient() {
  return createHttpClient({ tokenStore: getAuthTokenRepository() });
}
```

## Enforcement

| Mechanism                                                              | Command                        |
| ---------------------------------------------------------------------- | ------------------------------ |
| The 50 rules of the local `architecture` ESLint plugin, all at `error` | `npm run lint`                 |
| Structural layer, module-surface, and README scan                      | `npm run quality:architecture` |
| The full aggregate of every gate in this corpus                        | `npm run validate`             |

Manual review where mechanical enforcement is impossible: whether a new invariant belongs in this
index at all, and whether an invariant has quietly stopped matching the code it describes.

## Definition of done

- [ ] The change violates none of the 34 invariants above.
- [ ] Any new invariant is listed here, defined in a rule file, and enforced by a named mechanism.
- [ ] No gate was weakened, skipped, or scoped away to land the change.
