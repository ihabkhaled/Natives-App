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
| `visual`              | Screenshot diffs against container-generated Linux baselines.                                                                               |
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

## Visual regression baselines

Screenshot baselines are **platform-specific**: Playwright names them `welcome-light-visual-linux.png`,
`…-win32.png`, and so on. A baseline recorded on Windows will never match Linux rendering — the font
rasterization differs — so committing only Windows baselines would leave the CI job permanently red
for an environmental reason. That trains people to ignore red, which is worse than having no gate.

Both sets are therefore committed, and the `linux` ones are generated in the **same container image
the runner uses**:

```bash
docker run --rm -v "$PWD:/w" -w /w -e CI=true \
  mcr.microsoft.com/playwright:v1.61.1-noble \
  bash -c 'npm ci && npx playwright test tests/visual --update-snapshots'
```

Keep the image tag in step with the `@playwright/test` version in `package.json`; a mismatched
browser build renders differently and will produce false diffs.

Note that `npm ci` inside the container replaces `node_modules/` with Linux binaries. Re-run
`npm ci` on your workstation afterwards.

Because the baselines match the runner, the job is a **real gate** — no `continue-on-error`. A red
visual job means the UI changed: review the diff artifact, then either fix the regression or
regenerate the baselines with the command above and commit them.

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
