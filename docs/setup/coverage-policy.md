# Coverage policy

Coverage here is a **per-file floor**, not a project average. A project-wide percentage lets a
well-tested utility subsidize an untested payment path; a per-file floor does not.

## Thresholds

| Scope                 | Statements | Branches | Functions | Lines |
| --------------------- | ---------- | -------- | --------- | ----- |
| Every production file | 95%        | 95%      | 95%       | 95%   |
| Pure logic (below)    | 100%       | 100%     | 100%      | 100%  |

Pure-logic globs — helpers, utilities, mappers, schemas, query-key builders, route builders,
selectors, migrations, and parsers:

```text
**/*.helper.ts  **/*.utils.ts   **/*.mapper.ts     **/*.schema.ts   **/*.keys.ts
**/*.paths.ts   **/*.selectors.ts  **/*.migrations.ts  **/*.parser.ts
```

These files have no I/O and no framework. There is no excuse for an untested branch in one, so the
bar is 100%.

Configured twice, on purpose:

- [`vitest.config.ts`](../../vitest.config.ts) — `thresholds.perFile: true` plus per-glob overrides.
- [`scripts/quality/check-per-file-coverage.mjs`](../../scripts/quality/check-per-file-coverage.mjs)
  — parses `coverage/coverage-final.json` and prints **every** failing file and metric, rather than
  aborting on the first. Run it after `npm run test:coverage`:

```bash
npm run test:coverage
npm run test:coverage:per-file
```

## Exclusions, and why each is legitimate

| Excluded                              | Why                                                                                                                                     |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `src/main.tsx`                        | Entry bootstrap. Its lines run before the instrumenter attaches; everything it calls lives in `src/app/startup/`, which **is** covered. |
| `src/vite-env.d.ts`                   | Type-only.                                                                                                                              |
| `**/*.types.ts`, `**/*.interfaces.ts` | Type-only: erased at build, nothing to execute.                                                                                         |
| `**/index.ts`                         | Re-export surfaces. Covered transitively by whatever imports them.                                                                      |
| `src/tests/**`                        | Test infrastructure (MSW handlers), not production code.                                                                                |
| `**/*.test.{ts,tsx}`                  | Tests.                                                                                                                                  |

**"Hard to test" is not on this list.** A file that is hard to test is telling you it has too many
responsibilities or reaches a boundary it should not. Split it or inject the boundary — do not
exclude it. If you believe you have found a genuine exception, it needs an `EXC-nnnn` entry in
[`docs/exceptions/README.md`](../exceptions/README.md) with alternatives considered.

## What the layers prove

| Layer            | Proves                                                             | Command                    |
| ---------------- | ------------------------------------------------------------------ | -------------------------- |
| Unit (colocated) | One file's behavior, including its error branches.                 | `npm run test:unit`        |
| Integration      | Real modules against MSW: login, refresh, replay, error rendering. | `npm run test:integration` |
| Contract         | Mock mode and remote mode share one wire shape.                    | `npm run test:contract`    |
| E2E              | The app a user actually gets: routing, auth, RTL, offline.         | `npm run test:e2e`         |
| Accessibility    | WCAG 2.2 AA, light/dark/LTR/RTL.                                   | `npm run test:a11y`        |
| Visual           | Rendering drift.                                                   | `npm run test:visual`      |

High coverage with weak assertions is worse than honest low coverage: it reports safety you do not
have. Assert behavior and error paths, not that a function was called.
