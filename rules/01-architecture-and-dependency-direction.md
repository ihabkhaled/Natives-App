# 01 — Architecture and dependency direction

> Authority: normative. Conflicts resolve in favor of ADRs and the security policy.

## Mandatory

- MUST place every source file in exactly one of five layers: `src/app`, `src/modules`,
  `src/platform`, `src/shared`, `src/packages`.
- MUST respect the one-way graph — `app → modules → platform → shared → packages` — where each
  layer may import itself and anything to its right, and nothing to its left.
- MUST keep `src/app` as composition only: routing, providers, boundaries, lifecycle, startup.
- MUST keep `src/platform` as the single home for device and browser capability facades.
- MUST keep `src/shared` generic: primitives usable by any module, coupled to none.
- MUST keep `src/packages` as vendor wrappers that know nothing about this application's domain.
- MUST move a shared piece down a layer, or a feature piece up into its module, when a boundary
  fights you — that fight is the signal the piece is in the wrong layer.

## Forbidden

- NEVER import `src/app` from a layer below it: modules, platform, shared, and packages must run
  headless without the composition root.
- NEVER let a package owner import `@/modules/*`, `@/shared/*`, `@/platform/*`, or `@/app/*`.
- NEVER put a `*.service.ts`, `*.gateway.ts`, `*.repository.ts`, `*.store.ts`, `*.query.ts`, or
  `*.mutation.ts` file under `src/app` or `src/shared`.
- NEVER reach around a boundary with a relative path such as `../../modules/auth/store`.

## Rationale

Layer direction is what makes the codebase mechanically checkable: because dependency edges only
point one way, any file's blast radius is a function of its layer, and cycles cannot form. Packages
stay vendor-only so a library swap is a change in one directory rather than a migration. The app
layer stays composition-only so features can be tested and reasoned about without booting the shell.

## Valid

```ts
// src/modules/settings/store/settings.store.ts
import { createPersistedAppStore } from '@/packages/state';
import { createPreferencesStorageAdapter } from '@/platform';
import { STORAGE_KEYS } from '@/shared/config';
```

## Invalid

```ts
// src/shared/ui/toast/use-app-toast.hook.ts
import { useSession } from '@/modules/auth'; // shared → modules: shared must not know features
```

## Enforcement

| Mechanism                                            | Command                        |
| ---------------------------------------------------- | ------------------------------ |
| `architecture/no-restricted-layer-imports`           | `npm run lint`                 |
| `architecture/no-app-imports-below-app`              | `npm run lint`                 |
| `architecture/no-feature-imports-in-shared`          | `npm run lint`                 |
| `architecture/no-module-imports-in-package-owners`   | `npm run lint`                 |
| `architecture/no-feature-business-logic-in-app`      | `npm run lint`                 |
| `architecture/no-feature-business-logic-in-shared`   | `npm run lint`                 |
| Whole-tree import scan plus canonical-layer presence | `npm run quality:architecture` |
| Cycle detection across the resolved import graph     | `npm run quality:circular`     |

Manual review where mechanical enforcement is impossible: whether a file sits in the _right_ layer.
The linter proves `src/shared/foo.helper.ts` imports nothing illegal; only a reviewer can tell that
it is really auth logic wearing a generic name.

## Definition of done

- [ ] Every new file's layer is deliberate, and its imports point rightward only.
- [ ] No relative path escapes its module or layer.
- [ ] `npm run quality:architecture` and `npm run quality:circular` pass.

## Related

[02-feature-modules](02-feature-modules.md) · [09-package-ownership](09-package-ownership.md) ·
[11-capacitor-native-boundaries](11-capacitor-native-boundaries.md) ·
[../docs/eslint/no-restricted-layer-imports.md](../docs/eslint/no-restricted-layer-imports.md)

ADR: [0001](../architecture/adrs/0001-module-first-architecture.md).
