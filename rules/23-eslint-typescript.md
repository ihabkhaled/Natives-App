# 23 — ESLint and TypeScript

> Authority: normative. Conflicts resolve in favor of ADRs and the security policy.

## Mandatory

- MUST pass `eslint . --max-warnings=0`: there is no warning tier, so nothing accumulates.
- MUST typecheck twice — `npm run typecheck` on the TypeScript 7 toolchain and
  `npm run typecheck:toolchain` on the 5.9 baseline — because the repo builds with `typescript7`
  while the editor and `typescript-eslint` run on 5.9.
- MUST keep every strictness flag in `tsconfig.base.json` enabled:

| Flag                                 | What it buys                                                   |
| ------------------------------------ | -------------------------------------------------------------- |
| `strict`                             | The whole family below, on by default                          |
| `noImplicitAny`                      | No silent `any` from an unannotated parameter                  |
| `strictNullChecks`                   | `null` and `undefined` are values you must handle              |
| `strictFunctionTypes`                | Contravariant parameter checking                               |
| `strictBindCallApply`                | `bind`/`call`/`apply` are type-checked                         |
| `strictPropertyInitialization`       | No half-built class instances                                  |
| `useUnknownInCatchVariables`         | `catch (error: unknown)` — narrow before you touch it          |
| `noImplicitOverride`                 | `override` is explicit, so a renamed base method breaks loudly |
| `noImplicitReturns`                  | Every code path returns                                        |
| `noFallthroughCasesInSwitch`         | No accidental case fallthrough                                 |
| `noUncheckedIndexedAccess`           | `array[i]` is `T \| undefined` — the honest type               |
| `noPropertyAccessFromIndexSignature` | Index signatures are read with brackets, not dots              |
| `exactOptionalPropertyTypes`         | `{ a?: string }` never means `{ a: undefined }`                |
| `allowUnreachableCode: false`        | Dead code is an error                                          |
| `allowUnusedLabels: false`           | Stray labels are an error                                      |
| `noUnusedLocals`                     | No unused locals                                               |
| `noUnusedParameters`                 | No unused parameters (prefix `_` to opt out)                   |
| `erasableSyntaxOnly`                 | No `enum`, no parameter properties — types erase cleanly       |
| `verbatimModuleSyntax`               | Type imports are written as `import type`                      |

- MUST stay inside the complexity budget on `src/**/*.{ts,tsx}`: cognitive complexity 10,
  cyclomatic complexity 8, `max-depth` 3, `max-params` 4, `max-statements` 20,
  `max-lines-per-function` 50, `max-lines` 300, `max-nested-callbacks` 3 — plus `max-lines` 150 for
  `*.component.tsx` (function 120) and 200 for `*.hook.ts` (function 90).
- MUST run the whole plugin stack: `@eslint/js` recommended, `typescript-eslint`
  `strictTypeChecked` + `stylisticTypeChecked`, react, react-hooks, jsx-a11y, import-x, promise,
  regexp, security, sonarjs, unicorn, unused-imports, vitest, testing-library, playwright, and the
  50-rule local `architecture` plugin — with `eslint-config-prettier` last.

## Forbidden

- NEVER use `any`, a non-null assertion, or an unsafe cast to get past a type error in `src/`; the
  strict type-checked preset exists to make you model the real shape.
- NEVER raise a budget number to fit a function — extract until it fits.
- NEVER weaken a flag in `tsconfig.base.json` for one stubborn file.
- NEVER let a `console` call into `src/`; `no-console` is an error everywhere but Node tooling.

## Rationale

Every budget here is a proxy for reviewability: a function under 50 lines with complexity under 8
can be held in a reader's head, and a file over 300 lines is a module that has not admitted it yet.
Dual typechecking is not belt-and-braces — the two compilers disagree at the edges, and the build
uses the newer one, so verifying only 5.9 would ship untested type behaviour.

## Valid

```ts
// src/packages/http/http-error.mapper.ts
function kindFromStatus(status: number): HttpErrorKind {
  if (status === HTTP_STATUS.Unauthorized) {
    return HTTP_ERROR_KIND.Unauthorized;
  }
  return HTTP_ERROR_KIND.Unexpected;
}
```

## Invalid

```ts
// src/packages/http/http-error.mapper.ts
/* eslint-disable @typescript-eslint/no-explicit-any -- undocumented, and unnecessary */
export function mapError(error: any): any {
  return { kind: (error as any).response?.status ?? 'unexpected' };
}
```

## Enforcement

| Mechanism                                                    | Command                       |
| ------------------------------------------------------------ | ----------------------------- |
| Whole stack at zero warnings                                 | `npm run lint`                |
| `@typescript-eslint/no-explicit-any` and the strict preset   | `npm run lint`                |
| `sonarjs/cognitive-complexity`, `complexity`, `max-*` limits | `npm run lint`                |
| `unicorn/no-abusive-eslint-disable`                          | `npm run lint`                |
| TypeScript 7 build compiler                                  | `npm run typecheck`           |
| TypeScript 5.9 tooling compiler                              | `npm run typecheck:toolchain` |
| Formatting, deterministic and unarguable                     | `npm run format:check`        |

Manual review where mechanical enforcement is impossible: whether a function that _fits_ the budget
is actually simple. Complexity metrics count branches, not concepts — a 40-line function with five
unrelated responsibilities scores well and reads badly.

## Definition of done

- [ ] Lint passes with zero warnings and no new disables.
- [ ] Both typecheck commands pass.
- [ ] Nothing was silenced with `any`, `!`, or a raised budget.

## Related

[08-types-interfaces-enums-constants](08-types-interfaces-enums-constants.md) ·
[29-exceptions](29-exceptions.md) · [20-performance](20-performance.md) ·
[../docs/eslint/README.md](../docs/eslint/README.md)

ADR: [0011](../architecture/adrs/0011-typescript-7-toolchain-compatibility.md).
