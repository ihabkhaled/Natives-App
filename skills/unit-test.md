# Skill: Write a unit test

**Use when:** any file under `src/` changes — the unit project is the default proof.

## Required reading

- [rules/22 — Testing and coverage](../rules/22-testing-and-coverage.md) — suites and thresholds.
- [ADR 0014 — per-file coverage](../architecture/adrs/0014-testing-and-per-file-coverage.md) — why
  per-file thresholds, not an aggregate number.
- [vitest.config.ts](../vitest.config.ts) — the four projects and the coverage policy.
- [health.mapper.test.ts](../src/modules/health/mappers/health.mapper.test.ts) — a pure test at
  100%.
- [health.gateway.test.ts](../src/modules/health/gateways/health.gateway.test.ts) — a test that
  proves a security property, not just a return value.

## Preconditions

- [ ] The file under test has one responsibility. A file that is hard to test is usually two files.
- [ ] You know the threshold: 95% per file, but **100%** for `*.helper.ts`, `*.utils.ts`,
      `*.mapper.ts`, `*.schema.ts`, `*.keys.ts`, `*.paths.ts`, `*.selectors.ts`, `*.migrations.ts`,
      `*.parser.ts`.
- [ ] Excluded from coverage entirely: `*.types.ts`, `*.interfaces.ts`, `index.ts`, `src/main.tsx`,
      `src/tests/**`. Do not write tests to pad those.

## Files

```text
src/<path>/<name>.<kind>.ts        the file under test
src/<path>/<name>.<kind>.test.ts   colocated, same stem
```

## Steps

1. Colocate as `<same-stem>.test.ts`. The unit project globs `src/**/*.test.{ts,tsx}` and
   `tests/unit/**`; anything under `tests/integration` or `tests/contract` is a different project.
2. Import explicitly — `globals: false` in `vitest.config.ts`. Every file starts with
   `import { describe, expect, it, vi } from 'vitest';`.
3. Name the test by the behavior, in the product's language. `health.keys.test.ts` says "returns a
   fresh array per call so callers cannot mutate the root" — that sentence is the reason the test
   exists.
4. Arrange with a factory, not a literal splat across cases. `buildProps(overrides)` in
   `health-status-card.component.test.tsx` and `mockHealthQuery(overrides)` in
   `use-health-card.hook.test.ts` keep each test to the one field it is about.
5. Mock the layer directly below, never further:
   `vi.mock('./use-health-query.hook', () => ({ useHealthQuery: vi.fn() }));` then
   `vi.mocked(useHealthQuery).mockReturnValue(...)`. Reset with
   `afterEach(() => { vi.clearAllMocks(); });`.
6. Prove the negative. The valuable assertions here are the ones that catch a regression nobody
   would notice: health's gateway asserts `seenHeaders['Authorization']` is `undefined`; its card
   hook asserts an `AppError` carrying `'ECONNREFUSED'` still renders translated offline copy.
7. Cover every branch of a pure file — a mapper with an `ok`/`error` split needs both cases or the
   100% gate fails. Reach for `it.each` when the cases are genuinely a table.
8. Test files relax some lint rules (`max-lines`, `max-statements`, `no-non-null-assertion`) but not
   the architecture rules. Keep imports honest.

## Tests

- This skill _is_ the test. What it must prove: the contract of the file, both sides of every
  branch, and the failure path — not the implementation's shape.
- Coverage is a floor, not a goal: `npm run test:coverage` then `npm run test:coverage:per-file`
  prints every file below its threshold by name.
- Run one file while iterating:
  `npx vitest run --project unit src/modules/health/mappers/health.mapper.test.ts`.

## Security / accessibility / native considerations

- Never commit a real credential or token in a fixture — use `MOCK_TOKENS` and `buildTokenPair()`.
  `npm run security:secrets` scans the tree, tests included.
- jsdom is not a browser: `matchMedia` is stubbed in `tests/setup/testing-library.setup.ts`, and
  Ionic web components do not upgrade. See [hook-test](hook-test.md) for the component-side facts.

## Documentation delta

- None. Tests document themselves; a test that needs prose to explain it is named wrong.

## Validation

```bash
npx vitest run --project unit
npm run test:coverage
npm run test:coverage:per-file
npm run lint
```

## Forbidden shortcuts

- Asserting on mock call counts as a substitute for asserting behavior — it passes while the feature
  is broken.
- Deleting a hard case to make the coverage gate green — `check-per-file-coverage.mjs` names the
  file, so the omission is visible anyway.
- `vi.mock` of the whole module under test — you would be testing the mock.
- Snapshot tests of component markup — Ionic markup churns; assert the behavior instead.
- Sharing mutable state between `it` blocks — `cleanup()` runs after each test, your globals do not.

## Definition of done

- [ ] The test is colocated, imports its Vitest globals, and names behaviors.
- [ ] Both sides of every branch are exercised; the failure path is asserted.
- [ ] Pure files sit at 100%; everything else clears 95%.
- [ ] `npm run test:coverage:per-file` reports no file below threshold.
