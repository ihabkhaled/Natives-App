# Skill: Refactor safely

**Use when:** structure must change without behavior changing — splitting, renaming, relocating.

## Required reading

- [rules/31 — Review checklist](../rules/31-review-checklist.md) — what a reviewer will ask.
- [rules/28 — File naming](../rules/28-file-naming.md) — the suffix taxonomy a moved file must obey.
- [filenames.config.mjs](../eslint/filenames.config.mjs) — the machine-readable kind list.
- [ADR 0001 — Module-first architecture](../architecture/adrs/0001-module-first-architecture.md) —
  the direction a relocation must not reverse.

## Preconditions

- [ ] Tests pass **before** you start. A refactor on a red suite is a rewrite.
- [ ] The behavior contract is pinned by tests. If it is not, write the characterization tests first
      — that is the refactor's first commit.
- [ ] You can say in one sentence what improves. "Cleaner" is not a reason; "the hook exceeded 200
      lines and mixed two concerns" is.

## Files

```text
(varies — but the taxonomy does not)
src/**/<name>.<kind>.ts     every moved file keeps a suffix from FILE_SUFFIX_KINDS
src/modules/*/index.ts      edit when a public surface shifts
src/modules/*/README.md     edit when the anatomy or surface changes
```

## Steps

1. **Separate the commits.** Behavior change and structure change never share one. A reviewer must
   be able to read a refactor diff and see nothing happen.
2. **Let the gates aim you.** They name real problems: `npm run quality:circular` (madge) finds
   import cycles, `npm run quality:duplicates` (jscpd, `--threshold 0`) finds copy-paste,
   `npm run quality:dead-code` (knip) finds unused exports, and the complexity budgets in
   `eslint.config.mjs` — `complexity: 8`, `sonarjs/cognitive-complexity: 10`, `max-lines: 300`,
   `max-lines-per-function: 50` — name the functions that are too big.
3. **Split along the taxonomy, not along size.** A 250-line hook is not "half a hook and half a
   hook"; it is usually a query hook plus a view-model hook, the way health splits
   `use-health-query` from `use-health-card`. The suffix tells you what a file is allowed to
   contain.
4. **Renaming a file means renaming its kind.** `EXACT_FILE_KINDS` and `FILE_SUFFIX_KINDS` are the
   whole allowlist; `npm run quality:filenames` rejects an unknown kind and any non-kebab-case name.
   `unicorn/filename-case` catches it at lint time too.
5. **Moving code across layers is a direction question.** `ALLOWED_TARGETS` in
   `validate-architecture.mjs` is the graph: app → modules → platform → shared → packages, one way.
   Moving a use case into `src/shared` fails `architecture/no-feature-business-logic-in-shared`;
   into `src/app`, `architecture/no-feature-business-logic-in-app`.
6. **Extracting to `src/shared` requires generality.** Two callers is a coincidence; three is a
   pattern. `src/shared` may never import a module (`architecture/no-feature-imports-in-shared`), so
   anything feature-flavored cannot go there anyway.
7. **Narrow the public surface while you are in there.** Every extra `index.ts` export is a future
   coupling; `knip` will tell you which are unused.
8. **Run the suite after each step**, not at the end. The step that broke it is the step you can
   still remember.

## Tests

- Do not rewrite tests to match the new shape. If a test must change, either it was testing
  implementation (delete it and test behavior), or this is not a refactor.
- Coverage must not drop: `npm run test:coverage:per-file` names any file that fell below threshold
  — usually a sign a branch moved somewhere untested.
- Moving a file moves its colocated `*.test.ts` with it, unchanged.
- Run: `npm run test:unit` after each step; the full `npm run quality` before the PR.

## Security / accessibility / native considerations

- None beyond the defaults — unless the refactor crosses `src/modules/auth`,
  `src/packages/secure-storage` or `src/packages/http`, in which case it is the **critical** lane
  and needs [security-review](security-review.md) even though "nothing changed".
- Moving a listener registration risks losing a cleanup —
  `architecture/require-native-listener-cleanup` catches the effect, not a subscription you dropped.

## Documentation delta

- The module README when the anatomy or public surface moves.
- `context/architecture-map.md` and `context/module-anatomy.md` when the shape itself changes.
- Nothing at all when the refactor is genuinely internal — that is the sign it was one.

## Validation

```bash
npm run quality:circular
npm run quality:duplicates
npm run quality:dead-code
npm run quality:filenames
npm run quality
```

## Forbidden shortcuts

- Sneaking a fix into a refactor commit — the reviewer stops being able to see either one.
- Renaming to a suffix that "looks right" — `npm run quality:filenames` reads
  `filenames.config.mjs`, not intent.
- Extracting to `src/shared` to break a cycle — that hides the cycle in a layer that may not import
  back; fix the direction instead.
- Loosening `max-lines` or adding an `eslint-disable` instead of splitting —
  `architecture/no-undocumented-eslint-disable` will demand an `EXC-nnnn` for a problem that has a
  real fix. See [exception](exception.md).
- Deleting a test that "no longer applies" without proving the behavior it covered is gone.

## Definition of done

- [ ] Behavior is unchanged and the existing tests prove it, unedited.
- [ ] Every file carries a valid kind suffix; the layer direction still holds.
- [ ] Cycles, duplication and dead exports are no worse — ideally better.
- [ ] Coverage did not drop and no suppression was added.
- [ ] `npm run quality` passes.
