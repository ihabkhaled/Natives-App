# CI

[`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) runs on pushes and pull requests to
`main`. Jobs are independent and parallel; `all-gates-green` aggregates them.

## Jobs

| Job                   | Proves                                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `knowledge`           | `.ai` is regenerable and matches canonical docs; no broken links, contradictions, duplicates, or orphans; the resolver meets its benchmark. |
| `format`              | Prettier is clean.                                                                                                                          |
| `lint`                | Zero warnings, **and** `--fix` changes nothing (no unformatted autofixable code).                                                           |
| `typecheck`           | TypeScript 7 (primary compiler).                                                                                                            |
| `typecheck-toolchain` | TypeScript 5.9 parser compatibility; also reports when the dual compiler can retire.                                                        |
| `architecture-rules`  | All 50 architecture rules behave (fixtures + RuleTester).                                                                                   |
| `coverage`            | Unit/integration coverage with per-file thresholds.                                                                                         |
| `build`               | Production build.                                                                                                                           |
| `e2e`                 | Playwright: desktop, mobile emulation, Arabic RTL.                                                                                          |
| `accessibility`       | axe, WCAG 2.2 AA, light + dark + RTL.                                                                                                       |
| `visual`              | Screenshot diffs (see the caveat below).                                                                                                    |
| `static-analysis`     | Dead code (knip), cycles (madge), duplication (jscpd).                                                                                      |
| `architecture-gates`  | Structure, ownership, exports, filenames, locales, docs, agent entrypoints.                                                                 |
| `security`            | `npm audit` + Trivy (vuln, secret, misconfig).                                                                                              |
| `capacitor-sync`      | Native tree matches a fresh sync; identity matches.                                                                                         |
| `android`             | Gradle lint, unit tests, debug build on a real JDK.                                                                                         |
| `ios`                 | `xcodebuild` on `macos-latest` — the only place iOS is genuinely verified.                                                                  |
| `all-gates-green`     | Fails if **any** of the above failed or was cancelled.                                                                                      |

`all-gates-green` uses `if: always()` and inspects `needs.*.result`, so a skipped or cancelled job
cannot be mistaken for a pass.

## The `.ai` drift check

The `knowledge` job regenerates `.ai` and then runs `git diff --exit-code -- .ai`. If you changed a
rule or ADR without rebuilding, this fails. Fix: `npm run knowledge:build`, then commit.

## Visual regression caveat (read before trusting it)

Screenshot baselines are **platform-specific**. Playwright names them `*-win32.png`,
`*-linux.png`, etc. Baselines committed from a Windows or macOS workstation will not match Linux
rendering in CI — different font rasterization, not a real regression.

The `visual` job is therefore `continue-on-error: true`. It surfaces diffs as artifacts without
blocking. Pick one before relying on it as a gate:

1. **Generate Linux baselines in a container** matching CI, commit them, and drop
   `continue-on-error`. This is the correct fix.
2. Run visual tests only locally as a review aid.

This is documented rather than hidden because a gate that fails for environmental reasons trains
people to ignore red — which costs more than having no gate.

## Artifacts on failure

Coverage reports, Playwright HTML reports with traces and video, and Android lint/test reports
upload on failure with 7-day retention. Traces are `on-first-retry`.

## Local equivalents

```bash
npm run quality        # format, lint, typechecks, coverage, build, architecture gates
npm run validate:web   # quality + e2e + a11y + visual + security + knowledge
npm run validate:native
npm run validate       # everything available in this environment
```

`npm run validate` is honest about its limits: `ios:verify` reports UNVERIFIED off macOS rather
than passing.
