# ADR 0014: Testing and per-file coverage

- Status: Accepted
- Date: 2026-07-16
- Deciders: Architecture owner

## Context

Aggregate coverage is a number that hides its own distribution. A project at 95% overall routinely
means the mappers are at 100% and the auth service is at 40% — the average is carried by the code
that was easy to test, which is rarely the code that hurts when it breaks. Meanwhile a single
`vitest run` cannot serve every purpose: a jsdom environment is wrong for a wire-contract check, and
a node environment is wrong for rendering.

## Decision

**Per-file thresholds, not aggregate.** `vitest.config.ts` sets `thresholds.perFile: true` at 95%
statements/branches/functions/lines for every file under `src/`, and 100% for pure-logic file kinds
matched by glob: `*.helper.ts`, `*.utils.ts`, `*.mapper.ts`, `*.schema.ts`, `*.keys.ts`,
`*.paths.ts`, `*.selectors.ts`, `*.migrations.ts`, `*.parser.ts`. Pure files have no excuse — they
take input and return output.

`scripts/quality/check-per-file-coverage.mjs` re-checks the same policy from
`coverage/coverage-final.json` and prints every failing file with its shortfall, because a
threshold failure should name the file rather than a total. Both sides read the globs from
`scripts/quality/coverage-policy.mjs` so they cannot diverge.

**Four Vitest projects, each with the right environment.** `unit` (jsdom, colocated `*.test.ts(x)`),
`integration` (jsdom + MSW server), `contract` (node + MSW server), and `architecture-plugin` (node,
running the ESLint rules' own valid/invalid fixtures). Playwright covers `e2e`, `accessibility`
(axe), and `visual` against a mock-mode dev server.

Types-only files (`*.types.ts`, `*.interfaces.ts`), barrels (`index.ts`), `src/tests/**`, and
`src/main.tsx` are excluded — they contain no branches to prove.

## Consequences

**Positive:** A weakly tested file cannot hide behind well-tested neighbours. The layered projects
mean an integration test proves real interceptor behavior against MSW, not a mocked client — as in
`tests/integration/token-refresh.integration.test.ts`, which asserts three concurrent 401s collapse
into exactly one refresh call.

**Negative / cost:** 95% per file is a hard floor that makes some genuinely awkward code (early
error branches, platform forks) expensive to reach, and pushes authors toward extracting a pure
helper mainly to satisfy the gate. The suite is slower than one flat run. A new file with a single
untested branch fails the whole build.

**Enforcement:** `npm run test:coverage` then `npm run test:coverage:per-file`, both inside
`npm run quality`; `npm run quality:architecture-rules` proves the architecture rules themselves.

## Alternatives considered

- Aggregate 90% — rejected: it is satisfiable while the riskiest file is untested.
- 100% everywhere — rejected: it buys assertion-free tests written to reach lines.
- One Vitest environment for all suites — rejected: jsdom distorts a wire-contract test and node
  cannot render.

## Supersession

Revisit if mutation testing is adopted, which measures assertion quality directly and would make
line thresholds a secondary signal.
