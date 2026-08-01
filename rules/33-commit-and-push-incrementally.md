# 33 — Commit and push incrementally

> Authority: normative. Conflicts resolve in favor of ADRs and the security policy.

**Non-negotiable rule 38** in this repository. Work is committed **and pushed** in small,
self-contained, **green** increments — one coherent unit at a time, as each unit reaches green —
never accumulated for a single mega-commit or one final push at the end of a session. This rule
composes with [32-ci-gates-before-commit-and-push](32-ci-gates-before-commit-and-push.md): each
increment independently passes the full gate set before it is committed and before it is pushed. It
does **not** license committing red or partial work — "small" never means "unfinished".

## Mandatory

- MUST commit each coherent, independently-green unit of work as soon as it reaches green, then push
  it — do not wait for later work to pile on top of it.
- MUST keep every commit self-contained: it builds, its gates pass, and it can be reviewed, reverted,
  or bisected on its own. [31-review-checklist](31-review-checklist.md)
- MUST run the full local gate set green **before** each commit and again **before** each push, per
  rule 37. [32-ci-gates-before-commit-and-push](32-ci-gates-before-commit-and-push.md)
- MUST rebuild `.ai` (`npm run knowledge:build`) and include the regenerated `.ai/**` in the **same**
  increment whenever that increment changed `src/**` or the corpus.
- MUST push after each green commit so `origin/main` never trails local work by a large, unreviewed
  batch.
- MUST split work that spans independent concerns (e.g. a shared groundwork change and a feature that
  uses it) into separate green increments in dependency order when each can stand green on its own.

## Forbidden

- NEVER batch an entire task, module, or session into one commit at the very end. End-of-work
  batching loses work on interruption, cannot be reviewed or bisected, and hides which change broke
  a gate.
- NEVER hold green, committable work uncommitted "until the rest is done".
- NEVER let a local branch accumulate many commits and push them all at the end when each could have
  been pushed as it went green.
- NEVER commit a red, half-built, or non-compiling increment to make progress "look" incremental —
  smallness is not an excuse to ship broken code. [00-non-negotiable-rules](00-non-negotiable-rules.md)
- NEVER use `--no-verify` to force an increment through; the hooks re-run gates you already observed
  green, and are bypassed only under the narrow allowance in rule 37.

## What counts as one increment

A single increment is the smallest change that is both coherent and independently green:

- a shared groundwork change (a new constant table, a permission, an i18n key file) that compiles and
  passes on its own, committed **before** the feature that consumes it;
- one feature slice — a module's data layer, or a screen with its hook, component, container, tests,
  and locale entries — that reaches 95%/100% per-file coverage and passes every gate;
- a corpus or documentation change with its regenerated `.ai/**`.

If a unit cannot be made green on its own, it is not yet an increment — finish it, do not commit it
early.

## Rationale

End-of-work batching optimizes for the author's convenience at the cost of everyone downstream. A
long-lived pile of uncommitted or unpushed work is invisible: an interruption erases it, a reviewer
cannot reason about it, and `git bisect` cannot locate the one line inside it that broke a gate.
Small green increments make progress durable, reviewable, and recoverable — the same reasons a red
`main` is forbidden apply to a large unshared batch.

## Enforcement

| Mechanism                                                      | Command / signal                       |
| -------------------------------------------------------------- | -------------------------------------- |
| Each increment passes the full gate set before commit and push | `npm run validate`                     |
| `.ai` staleness inside the increment                           | `npm run knowledge:build` + `git diff` |
| Aggregate CI signal every pushed increment must satisfy        | `all-gates-green` job                  |

Manual review where mechanical enforcement is impossible: whether work that was green was in fact
committed and pushed when it reached green, rather than held back for a final batch. Nothing in the
repository can prove how long a green change sat uncommitted — the rule exists so that hoarding it is
a stated violation rather than a habit.

## Definition of done

- [ ] Each coherent green unit was committed as it reached green, not batched to the end.
- [ ] Every commit is self-contained: builds, gates pass, reviewable and revertible on its own.
- [ ] The full gate set was green before each commit and before each push (rule 37).
- [ ] `.ai/**` was rebuilt and committed inside any increment that touched `src/**` or the corpus.
- [ ] Each green commit was pushed promptly; `origin/main` does not trail by a large batch.

## Related

[00-non-negotiable-rules](00-non-negotiable-rules.md) ·
[32-ci-gates-before-commit-and-push](32-ci-gates-before-commit-and-push.md) ·
[30-release-gates](30-release-gates.md) · [31-review-checklist](31-review-checklist.md) ·
[../memory/known-pitfalls.md](../memory/known-pitfalls.md) ·
[../docs/operations/ci.md](../docs/operations/ci.md)
