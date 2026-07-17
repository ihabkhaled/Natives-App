# 22 — Testing and coverage

> Authority: normative. Conflicts resolve in favor of ADRs and the security policy.

## Mandatory

- MUST hold **95%** statements, branches, functions, and lines **per file** for every production
  file under `src/**` — the threshold is per file, so a well-covered neighbour cannot carry a bare
  one.
- MUST hold **100%** on the pure-logic globs, which have no excuse for an untested branch:
  `*.helper.ts`, `*.utils.ts`, `*.mapper.ts`, `*.schema.ts`, `*.keys.ts`, `*.paths.ts`,
  `*.selectors.ts`, `*.migrations.ts`, `*.parser.ts`.
- MUST run `npm run test:coverage` and then `npm run test:coverage:per-file`, which reads
  `coverage/coverage-final.json` and names every file below its threshold.
- MUST put each test in the suite that matches its seam: colocated `*.test.ts(x)` unit tests beside
  the code, `tests/integration/**` for flows across modules with MSW, `tests/contract/**` for wire
  envelopes in Node, `tests/e2e/**`, `tests/accessibility/**`, and `tests/visual/**` for Playwright.
- MUST import test APIs explicitly — `globals: false`, so `describe`, `it`, and `expect` come from
  `vitest`.
- MUST test behavior through the public surface: render a container, assert what a user sees, and
  select by `TEST_IDS` or accessible role.
- MUST cover the failure path, not only the happy one: every mapped error code, every rejected deep
  link, every migration from a corrupt payload.
- MUST add a valid/invalid fixture pair for any new architecture ESLint rule and run
  `npm run quality:architecture-rules`.

## Forbidden

- NEVER commit a focused or skipped test — `vitest/no-focused-tests`, `vitest/no-disabled-tests`,
  and `playwright/no-focused-test` are errors.
- NEVER write a test with no assertion; `vitest/expect-expect` rejects it.
- NEVER lower a threshold, widen the coverage `exclude` list, or delete a test to make a gate pass.
- NEVER assert on implementation details — internal state, private helpers, or call counts of things
  the user cannot observe.

## Rationale

Aggregate coverage lies: 95% overall routinely hides a 40% file that happens to be the one handling
money or tokens. Per-file thresholds make the number mean what people think it means. The pure globs
are held to 100% because they are total functions with no I/O — every branch is reachable in a test
with two lines of setup, so anything less is a choice not to test.

## Valid

```ts
// src/modules/settings/store/settings.migrations.test.ts
import { describe, expect, it } from 'vitest';

describe('migratePersistedSettings', () => {
  it('falls back to defaults for a corrupt payload', () => {
    expect(migratePersistedSettings({ theme: 42 }, 1, defaults)).toEqual(defaults);
  });
});
```

## Invalid

```ts
// src/modules/settings/store/settings.migrations.test.ts
describe.skip('migratePersistedSettings', () => {
  // skipped suite on a 100% pure glob, using implicit globals and asserting nothing
  it.only('migrates', () => {
    migratePersistedSettings({}, 0, defaults);
  });
});
```

## Enforcement

| Mechanism                                               | Command                                                        |
| ------------------------------------------------------- | -------------------------------------------------------------- |
| Vitest thresholds (`perFile: true`, 95, pure globs 100) | `npm run test:coverage`                                        |
| Per-file report naming each offending file              | `npm run test:coverage:per-file`                               |
| Suite projects: unit, integration, contract             | `npm run test`                                                 |
| Architecture plugin fixtures                            | `npm run quality:architecture-rules`                           |
| `vitest/*` and `testing-library/*` rule sets            | `npm run lint`                                                 |
| Browser journeys, axe, and screenshots                  | `npm run test:e2e`, `npm run test:a11y`, `npm run test:visual` |

Manual review where mechanical enforcement is impossible: test _value_. 100% coverage of a mapper
proves every line ran, not that the assertions would fail if the mapping were wrong. Reviewers
should mentally mutate the code and ask which test goes red.

## Definition of done

- [ ] `npm run test:coverage && npm run test:coverage:per-file` passes with no threshold edits.
- [ ] New pure-logic files are at 100%, including their error branches.
- [ ] No `.only`, no `.skip`, and no assertion-free test in the diff.

## Related

[06-services-use-cases](06-services-use-cases.md) · [30-release-gates](30-release-gates.md) ·
[23-eslint-typescript](23-eslint-typescript.md) · [29-exceptions](29-exceptions.md)

ADR: [0014](../architecture/adrs/0014-testing-and-per-file-coverage.md).
