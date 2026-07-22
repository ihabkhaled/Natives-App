# 32 — CI gates before commit and push

> Authority: normative. Conflicts resolve in favor of ADRs and the security policy.

**Non-negotiable rule 37** in this repository, and the same standing rule the backend records as its
rule 52. Every CI gate must be green **before** you commit and **before** you push. A red gate on
`main` is an outage of the engineering system: it hides the next real defect behind noise, and it
teaches the team to ignore the signal that is supposed to stop bad code.

## Mandatory

- MUST run the full local gate set and see it pass **before** `git commit`.
- MUST run it again **before** `git push` if anything changed after the commit.
- MUST fix a red gate at its root cause, in the correct layer.
- MUST rebuild `.ai` with `npm run knowledge:build` and commit the regenerated `.ai/**` in the same
  commit whenever anything under `src/**` or the canonical corpus (`rules`, `skills`, `context`,
  `memory`, `agents`, `architecture`, `docs`) changed.
- MUST report a gate that genuinely cannot run in this environment as **UNVERIFIED with the exact
  reason** — never as passing.

## Forbidden

- NEVER push knowing a gate is red. "CI will tell me" is not a plan — CI telling you _is_ the
  failure.
- NEVER merge, tag, or release while a required check is failing.
- NEVER weaken or delete a rule, threshold, or coverage floor to turn a gate green.
- NEVER add an undocumented `eslint-disable` or `@ts-ignore`; a suppression needs an `EXC-nnnn`
  entry. [29-exceptions](29-exceptions.md)
- NEVER delete, skip, or `.only` a test, and never exclude a logic file from coverage.
- NEVER mark a required check optional or `continue-on-error` to get a green run.
- NEVER treat a red `all-gates-green` as flake — open the specific job that failed and read its log.

## The gate set

Local aggregates run the same commands the workflow runs.

| Gate                        | Command                                                                                             | CI job                |
| --------------------------- | --------------------------------------------------------------------------------------------------- | --------------------- |
| OpenAPI contract drift      | `npm run contract:check`                                                                            | `contract`            |
| Formatting                  | `npm run format:check`                                                                              | `format`              |
| Lint (0 errors, 0 warnings) | `npm run lint`                                                                                      | `lint`                |
| TypeScript 7 typecheck      | `npm run typecheck`                                                                                 | `typecheck`           |
| Toolchain typecheck         | `npm run typecheck:toolchain`                                                                       | `typecheck-toolchain` |
| Architecture plugin tests   | `npm run quality:architecture-rules`                                                                | `architecture-rules`  |
| Coverage + per-file floors  | `npm run test:coverage`, `test:coverage:per-file`                                                   | `coverage`            |
| Production build            | `npm run build`                                                                                     | `build`               |
| Structure and ownership     | `npm run quality:architecture`, `quality:package-ownership`, `quality:exports`, `quality:filenames` | `architecture-gates`  |
| Locale parity               | `npm run quality:locales`                                                                           | `architecture-gates`  |
| Docs and agent entrypoints  | `npm run quality:docs`, `quality:agent-docs`                                                        | `architecture-gates`  |
| Dead code, cycles, clones   | `npm run quality:dead-code`, `quality:circular`, `quality:duplicates`                               | `static-analysis`     |
| E2E (desktop, mobile, RTL)  | `npm run test:e2e`                                                                                  | `e2e`                 |
| Accessibility (axe)         | `npm run test:a11y`                                                                                 | `accessibility`       |
| Visual regression           | `npm run test:visual`                                                                               | `visual`              |
| Security                    | `npm run security:audit`, `security:secrets`, `security:scan`                                       | `security`            |
| Knowledge build + validate  | `npm run knowledge:build`, `knowledge:validate`, `knowledge:benchmark`                              | `knowledge`           |
| Capacitor sync drift        | `npm run cap:sync:check`                                                                            | `capacitor-sync`      |
| Android lint/test/build     | `npm run android:verify`                                                                            | `android`             |
| iOS build verification      | `npm run ios:verify`                                                                                | `ios`                 |
| **All gates green**         | every job above                                                                                     | `all-gates-green`     |

```bash
npm run quality        # every static, test, coverage, build, and structure gate
npm run validate:web   # quality + e2e + a11y + visual + security + knowledge
npm run validate       # validate:web + validate:native
```

## The `.ai` plane is a gate, not a formality

The `knowledge` job runs `npm run knowledge:build` and then `git diff --exit-code -- .ai`. A dirty
diff means the generated routing plane no longer matches the corpus it summarizes — a **real
staleness defect**, because `.ai/` is what the next contributor (human or agent) reads to orient
itself. A stale manifest routes them to the wrong file with full confidence.

**Therefore: after ANY change under `src/**` or the corpus, run `npm run knowledge:build` and commit
the regenerated `.ai/**` in the same commit.**

## Two honest exceptions, both already documented

- **`visual`** runs `continue-on-error` because Playwright screenshot baselines are OS-specific and
  the hosted runner rasterizes dense full-page captures slightly differently from the container the
  baselines were generated in. It is a **reviewed** gate: the diff report is always uploaded and a
  human inspects it. See [../docs/operations/ci.md](../docs/operations/ci.md). This is the one check
  whose result is read rather than enforced — and it is never the reason a change ships.
- **`ios`** can only compile on macOS with Xcode. `npm run ios:verify` reports UNVERIFIED anywhere
  else, and that is the correct answer. [26-native-release-readiness](26-native-release-readiness.md)

Neither exception may be extended to any other job.

## `--no-verify`

Permitted **only** for a batched commit whose gates were already run and observed green in the same
session — the hooks would re-run work that just passed. It is never a way past a red gate.

## Rationale

Gates are cheap to run and expensive to skip. The cost of a red `main` is not the broken build; it
is every subsequent contributor who cannot tell whether their own change broke something, and who
therefore stops trusting the signal. Making "green before commit, green before push" an invariant
means the question "is `main` healthy?" always has the same answer.

## Enforcement

| Mechanism                                             | Command                                                   |
| ----------------------------------------------------- | --------------------------------------------------------- |
| The full local aggregate of every gate                | `npm run validate`                                        |
| The aggregate CI signal a merge or release depends on | `all-gates-green` job                                     |
| `.ai` staleness after a corpus or source change       | `npm run knowledge:build` + `git diff --exit-code -- .ai` |
| Suppressions need a documented exception              | `npm run lint`                                            |

Manual review where mechanical enforcement is impossible: whether the person who pushed actually ran
the gates, and whether an UNVERIFIED claim is honest. Nothing in the repository can prove a command
was run on a workstation — the rule exists so that skipping it is a stated violation rather than a
habit.

## Definition of done

- [ ] The full gate set was run and observed green before the commit.
- [ ] It was green again before the push, if anything changed after committing.
- [ ] `.ai/**` was rebuilt and committed alongside any `src/**` or corpus change.
- [ ] No rule, threshold, coverage floor, test, or required check was weakened to get there.
- [ ] Every gate that could not run here is reported UNVERIFIED with its exact reason.

## Related

[00-non-negotiable-rules](00-non-negotiable-rules.md) · [30-release-gates](30-release-gates.md) ·
[31-review-checklist](31-review-checklist.md) · [29-exceptions](29-exceptions.md) ·
[26-native-release-readiness](26-native-release-readiness.md) ·
[../memory/known-pitfalls.md](../memory/known-pitfalls.md) ·
[../docs/operations/ci.md](../docs/operations/ci.md)
