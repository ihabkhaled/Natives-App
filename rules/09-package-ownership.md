# 09 — Package ownership

> Authority: normative. Conflicts resolve in favor of ADRs and the security policy.

## Mandatory

- MUST register every third-party runtime dependency in `eslint/package-ownership.config.mjs` with
  the directories allowed to import it, before the first import of it is written.
- MUST wrap the vendor behind a package owner in `src/packages/<owner>/` that exposes an app-shaped
  facade, hook, or component through its `index.ts`.
- MUST consume the vendor everywhere else through that owner: `@/packages/http`, not `axios`.
- MUST keep the owner list per vendor to one directory, except the two infrastructure vendors that
  are deliberately shared — see the registry below.
- MUST re-export any vendor type a caller needs from the owner, so callers never name the vendor.
- MUST delete the registry entry in the same change that removes the dependency.

## Forbidden

- NEVER import a registered vendor from outside its `ownerDirs`; the only legal home is the owner.
- NEVER import an unregistered package: an unknown vendor fails lint and the ownership gate rather
  than silently acquiring an owner by accident.
- NEVER let a package owner import application code — an owner that knows the domain is not an owner
  but a feature in disguise.

`react` and `react-dom` are the only foundational vendors: they are exempt from ownership because
every layer of a React app legitimately depends on them.

## Owner registry

| Vendor                                | Owner directories                                     |
| ------------------------------------- | ----------------------------------------------------- |
| `@ionic/react`                        | `src/packages/ionic`, `src/packages/router`           |
| `@ionic/react-router`                 | `src/packages/router`                                 |
| `react-router`                        | `src/packages/router`                                 |
| `react-router-dom`                    | `src/packages/router`                                 |
| `ionicons`                            | `src/packages/icons`                                  |
| `axios`                               | `src/packages/http`                                   |
| `@tanstack/react-query`               | `src/packages/query`                                  |
| `@tanstack/react-query-devtools`      | `src/packages/query`                                  |
| `zustand`                             | `src/packages/state`                                  |
| `zod`                                 | `src/packages/schema`                                 |
| `react-hook-form`                     | `src/packages/forms`                                  |
| `@hookform/resolvers`                 | `src/packages/forms`                                  |
| `dayjs`                               | `src/packages/date`                                   |
| `react-virtuoso`                      | `src/packages/virtual-list`                           |
| `i18next`                             | `src/packages/i18n`                                   |
| `react-i18next`                       | `src/packages/i18n`                                   |
| `i18next-browser-languagedetector`    | `src/packages/i18n`                                   |
| `class-variance-authority`            | `src/packages/ui-classes`                             |
| `clsx`                                | `src/packages/ui-classes`                             |
| `tailwind-merge`                      | `src/packages/ui-classes`                             |
| `socket.io-client`                    | `src/packages/realtime`                               |
| `@sentry/react`                       | `src/packages/error-reporting`                        |
| `@sentry/capacitor`                   | `src/packages/error-reporting`                        |
| `@aparajita/capacitor-secure-storage` | `src/packages/secure-storage`                         |
| `@capacitor/core`                     | `src/platform/runtime`, `src/packages/secure-storage` |
| `@capacitor/app`                      | `src/packages/capacitor-app`                          |
| `@capacitor/browser`                  | `src/packages/capacitor-browser`                      |
| `@capacitor/device`                   | `src/packages/capacitor-device`                       |
| `@capacitor/haptics`                  | `src/packages/capacitor-haptics`                      |
| `@capacitor/keyboard`                 | `src/packages/capacitor-keyboard`                     |
| `@capacitor/network`                  | `src/packages/capacitor-network`                      |
| `@capacitor/preferences`              | `src/packages/capacitor-preferences`                  |
| `@capacitor/share`                    | `src/packages/capacitor-share`                        |
| `@capacitor/splash-screen`            | `src/packages/capacitor-splash-screen`                |
| `@capacitor/status-bar`               | `src/packages/capacitor-status-bar`                   |
| `msw`                                 | `src/tests/msw`                                       |

Type-only imports of an unowned vendor are tolerated inside `src/packages/**` and `src/platform/**`
only, because they erase at build time and let an infrastructure file speak a vendor's contract
without depending on it. Everywhere else, a type import is an import.

## Rationale

One owner per vendor turns an upgrade or a replacement into a bounded diff: swapping Axios touches
`src/packages/http` and nothing else. It also gives the codebase a truthful dependency graph — you
can read which vendor powers which capability from the registry instead of grepping imports. The
registry is machine-readable precisely so the rule and the gate cannot drift from the documentation.

## Valid

```ts
// src/modules/settings/hooks/use-runtime-info.hook.ts
import { getRuntimePlatform } from '@/platform';
import { useAppTranslation } from '@/packages/i18n';
```

## Invalid

```ts
// src/modules/settings/hooks/use-runtime-info.hook.ts
import { Capacitor } from '@capacitor/core'; // owner is src/platform/runtime
import { useTranslation } from 'react-i18next'; // owner is src/packages/i18n
```

## Enforcement

| Mechanism                                          | Command                             |
| -------------------------------------------------- | ----------------------------------- |
| `architecture/no-raw-package-imports`              | `npm run lint`                      |
| `architecture/no-raw-vendor-types-in-domain`       | `npm run lint`                      |
| `architecture/no-module-imports-in-package-owners` | `npm run lint`                      |
| Registry ↔ `package.json` ↔ tree cross-check       | `npm run quality:package-ownership` |
| Owner-directory existence and dead owners          | `npm run quality:dead-code`         |

Manual review where mechanical enforcement is impossible: whether the facade is a real abstraction
or a pass-through re-export that leaks the vendor's shape. An owner that re-exports the vendor's own
types verbatim satisfies every rule while providing none of the insulation they exist to buy.

## Definition of done

- [ ] The vendor has a registry entry, an owner directory, and an `index.ts` facade.
- [ ] No file outside `ownerDirs` names the vendor.
- [ ] `npm run quality:package-ownership` passes.

## Related

[10-ionic-boundaries](10-ionic-boundaries.md) ·
[11-capacitor-native-boundaries](11-capacitor-native-boundaries.md) ·
[25-dependencies](25-dependencies.md) ·
[../docs/eslint/no-raw-package-imports.md](../docs/eslint/no-raw-package-imports.md)

ADR: [0004](../architecture/adrs/0004-package-ownership.md).
