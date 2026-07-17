# 08 — Types, interfaces, enums, constants

> Authority: normative. Conflicts resolve in favor of ADRs and the security policy.

## Mandatory

- MUST model closed sets as an as-const object plus a derived union type, and MUST name the object
  in `SCREAMING_SNAKE_CASE` with `PascalCase` members:
  `const THEME_MODE = { Light: 'light' } as const; type ThemeMode = (typeof THEME_MODE)[keyof typeof THEME_MODE];`
- MUST put type aliases and interfaces for a UI-family file (component, container, provider, guard,
  boundary, routes) in a companion `*.types.ts` or `*.interfaces.ts`.
- MUST keep module-scope literal configuration in a declaration-home kind: constants, errors, enums,
  variants, keys, paths, schema, mapper, helper, utils, factory, facade, adapter, coordinator,
  parser, listener, migrations, selectors, types, interfaces.
- MUST centralize cross-cutting literals in `src/shared/config`: `APP_PATHS`, `STORAGE_KEYS`,
  `TEST_IDS`, `APP_IDENTITY`.
- MUST mark shared literal objects `as const` and derive types from them rather than restating them.
- MUST use `import type` for type-only imports; `verbatimModuleSyntax` makes the distinction load
  bearing.

## Forbidden

- NEVER write the TypeScript `enum` keyword — `erasableSyntaxOnly` rejects it at compile time and
  the architecture plugin rejects it at lint time.
- NEVER declare a `type` or `interface` inside a component, container, provider, guard, boundary, or
  routes file.
- NEVER hide a module-scope literal inside a hook, service, gateway, repository, store, query, or
  mutation file.
- NEVER duplicate a union's members in a hand-written type; derive them.

## Rationale

`enum` emits runtime code and breaks `isolatedModules`-style erasure, so an as-const object gives
the same ergonomics with a plain object and zero emit. Forcing declarations into named homes means
that "where is this configured?" has a filename answer, and that a constants file diff is a
reviewable inventory of the app's magic values instead of a scavenger hunt across screens.

## Valid

```ts
// src/shared/errors/error-codes.constants.ts
export const APP_ERROR_CODE = {
  NetworkOffline: 'NETWORK_OFFLINE',
  Unauthorized: 'UNAUTHORIZED',
  InvalidCredentials: 'INVALID_CREDENTIALS',
} as const;

export type AppErrorCode = (typeof APP_ERROR_CODE)[keyof typeof APP_ERROR_CODE];
```

## Invalid

```ts
// src/modules/auth/hooks/use-login-screen.hook.ts
export enum SessionStatus {
  // enum keyword is banned outright
  Anonymous = 'anonymous',
}

const RETRY_DELAYS = [1000, 2000]; // module-scope literal hidden in a hook file
```

## Enforcement

| Mechanism                                                 | Command                     |
| --------------------------------------------------------- | --------------------------- |
| `architecture/no-typescript-enum`                         | `npm run lint`              |
| `architecture/no-types-outside-type-files`                | `npm run lint`              |
| `architecture/no-interfaces-outside-interface-files`      | `npm run lint`              |
| `architecture/no-module-constants-outside-constant-files` | `npm run lint`              |
| `@typescript-eslint/consistent-type-imports`              | `npm run lint`              |
| `erasableSyntaxOnly` in `tsconfig.base.json`              | `npm run typecheck`         |
| Kind-suffix taxonomy for every `src/` file                | `npm run quality:filenames` |

Manual review where mechanical enforcement is impossible: a constants file can still be a junk
drawer. The rule guarantees literals are _somewhere named_; a reviewer decides whether that name is
the one a future reader would search for.

## Definition of done

- [ ] No `enum`; every closed set is an as-const object with a derived union.
- [ ] Types and literals sit in their declaration homes, not in UI or logic files.
- [ ] Cross-cutting literals were added to `src/shared/config`, not re-invented locally.

## Related

[28-file-naming](28-file-naming.md) · [23-eslint-typescript](23-eslint-typescript.md) ·
[03-components](03-components.md) ·
[../docs/eslint/no-typescript-enum.md](../docs/eslint/no-typescript-enum.md)
