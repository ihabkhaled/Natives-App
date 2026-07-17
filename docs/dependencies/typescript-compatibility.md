# TypeScript dual-compiler arrangement

**This is temporary scaffolding with an automated removal trigger.** It exists for exactly one
reason and disappears the moment that reason does.

## The arrangement

| Package                                  | Version | Role                                                                                   |
| ---------------------------------------- | ------- | -------------------------------------------------------------------------------------- |
| `typescript7` (npm alias → `typescript`) | 7.0.2   | **Primary.** Type-checks the app, tests, and Node tooling; gates the production build. |
| `typescript`                             | 5.9.3   | **Parser compatibility only.** Nothing but `typescript-eslint` uses it.                |

```jsonc
// package.json
"typescript": "5.9.3",
"typescript7": "npm:typescript@7.0.2"
```

The primary compiler is invoked explicitly because it is not the package named `typescript`:

```bash
node node_modules/typescript7/bin/tsc -b --pretty false   # npm run typecheck
tsc -b --pretty false                                     # npm run typecheck:toolchain
```

Both run in CI. The primary one is the source of truth; the toolchain one proves the ESLint parser
still understands the codebase.

## Why

`typescript-eslint@8.64.0` declares:

```text
peerDependencies.typescript: ">=4.8.4 <6.1.0"
```

TypeScript 7 is outside that range. Installing only TS 7 would leave the type-aware lint rules —
the ones that catch real bugs, and the foundation the architecture plugin builds on — running on an
unsupported parser. Downgrading to TS 5 as the primary compiler would forfeit TS 7. So: both,
with one clearly primary.

## Removal trigger (automated)

```bash
node scripts/quality/check-toolchain-compatibility.mjs
```

It reads `typescript-eslint`'s declared peer range and **fails** as soon as that range covers the
primary major. The failure message is the checklist:

1. Drop the `typescript` 5.x devDependency.
2. Point `typescript` at 7.x.
3. Delete the `typescript7` alias.
4. Repoint `typecheck` at plain `tsc`; delete `typecheck:toolchain` and its CI job.
5. Update ADR-0011 and this page.

CI runs it as `continue-on-error` so it reports opportunity without blocking unrelated work.

## Known TS 7 migration facts

- **`baseUrl` was removed** (error `TS5102`). Path aliases now resolve relative to the tsconfig, so
  `tsconfig.base.json` declares `paths` with no `baseUrl`. This bites on any tsconfig copied from a
  TS 5 project.
- `erasableSyntaxOnly` is enabled, which pairs naturally with the ban on TypeScript `enum`.

## Config layout

| File                   | Scope                                        |
| ---------------------- | -------------------------------------------- |
| `tsconfig.base.json`   | All strictness flags and path aliases.       |
| `tsconfig.app.json`    | `src/` minus tests.                          |
| `tsconfig.test.json`   | Tests + test infrastructure.                 |
| `tsconfig.node.json`   | Vite/Vitest/Playwright/Capacitor configs.    |
| `tsconfig.eslint.json` | Widest include, for type-aware linting only. |
