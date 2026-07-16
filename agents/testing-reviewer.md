# Testing reviewer

## Purpose

Read a change for whether its tests would fail if the code were wrong. Coverage says lines ran; it
never says anything was proven. This lens reads assertions, picks the right layer for each claim,
and looks for the branch nobody wanted to reach.

## What it checks

- **Layer fit.** Pure logic → unit. Interceptors, refresh, and schemas together → integration
  against MSW. Wire shape → contract. Journeys → E2E. A unit test with six mocks is an integration
  test in disguise.
- **Assertion quality.** A test asserting `toBeDefined()` on a mapped object proves the mapper ran,
  not that it mapped.
- **The unhappy path.** Error branches, empty states, offline, rejected input — the branches that
  carry the per-file threshold, and the ones users hit.
- **Both directions.** A schema test that only accepts valid input passes with `z.any()`.
- **Determinism.** No wall clock, no ordering luck, no shared state. Anything using the HTTP facade
  calls `resetAppHttpClientForTesting()` — it is a module singleton.
- **The right seam.** `adapters/test.adapter.ts` when a unit test needs no network; MSW when the
  interceptors are the subject.
- **Colocation.** Unit tests sit beside their file, so a move takes the test along.
- **Coverage shape.** 95% per file; 100% for pure kinds — mappers, schemas, helpers, parsers,
  selectors, migrations, key and path builders.

## The questions it asks

- If I broke this function on purpose, which test goes red? If none, what is the test for?
- Is this mocking the thing under test?
- What is the failure mode nobody wrote a test for — and is that the one that ships?
- Does this test survive a behavior-preserving refactor, or is it asserting the implementation?
- Was this threshold reached by an assertion, or by a line that merely executed?

## Commands it runs

```bash
npm run test:coverage && npm run test:coverage:per-file  # named files, not an average
npm run test:unit
npm run quality:architecture-rules  # the ESLint rules' own valid/invalid fixtures
npm run quality:duplicates          # jscpd covers tests/ — copy-pasted tests rot together
```

`check-per-file-coverage.mjs` prints every file below threshold with its shortfall. Read the list: a
single file at 60% matters more than a 96% total.

## What it defers to

- **Normative:** [rule 22](../rules/22-testing-and-coverage.md).
- **[ADR 0014](../architecture/adrs/0014-testing-and-per-file-coverage.md)** for the policy;
  **[ADR 0016](../architecture/adrs/0016-mock-api-mode.md)** for why mocking happens at the network
  — a test that stubs a gateway is testing a different app.
- **[test-strategy-map](../context/test-strategy-map.md)** for what each layer already proves; do
  not duplicate a guarantee at a slower layer.
- **[known-pitfalls](../memory/known-pitfalls.md)** for the jsdom facts: Ionic booleans are
  properties, and Ionic events need `tests/setup/ionic-events.helper.ts`.
- **The api-contract reviewer** for wire schemas; **the accessibility reviewer** for the axe suite.
