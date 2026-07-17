# Skill: Document an exception

**Use when:** a rule genuinely cannot be satisfied and a suppression is the honest answer.

## Required reading

- [rules/29 — Exceptions](../rules/29-exceptions.md) — the `EXC-nnnn` scheme and the exceptions that
  exist.
- [docs/eslint/no-undocumented-eslint-disable](../docs/eslint/no-undocumented-eslint-disable.md) —
  the rule, its scope, and the canonical example.
- [logger.factory.ts](../src/packages/logger/logger.factory.ts) — the one real exception in this
  codebase; read it before writing a second.
- [rules/00 — Non-negotiable rules](../rules/00-non-negotiable-rules.md) — item 33: every
  `eslint-disable` MUST cite a documented `EXC-nnnn`.

## Preconditions

- [ ] You tried the real fix. [eslint-typecheck-repair](eslint-typecheck-repair.md) lists the file
      each rule is actually asking for; most "exceptions" are a missing file.
- [ ] The suppression is the narrowest possible: one rule, smallest scope, not a bare
      `eslint-disable` (`unicorn/no-abusive-eslint-disable` forbids that outright).
- [ ] You can state what would make the exception unnecessary. An exception with no exit is a
      defect.

## Files

```text
<the file needing the suppression>   the disable comment citing EXC-nnnn
docs/exceptions/                     the record — the directory the rule's message names
rules/29-exceptions.md               edit: the register of live exceptions
```

## Steps

1. **Understand the rule.** `architecture/no-undocumented-eslint-disable` scans **every** linted
   file — it has no path self-scoping — for any comment containing `eslint-disable`, and requires a
   match for `/EXC-\d{4}/u` in the same comment. The message points you here: "Document the
   exception in docs/exceptions first."
2. **Study the real one.** `EXC-0001` lives in `src/packages/logger/logger.factory.ts`:

   ```ts
   /* eslint-disable no-console -- EXC-0001: the logger package is the single console owner. */
   ```

and closes with `/* eslint-enable no-console */`. It is the codebase's only exception, and it
exists because `no-console` is `error` across `src/**` while _something_ must ultimately write to
the console — so exactly one file is allowed to, and every other module goes through
`createLogger(scope, createConsoleSink())`. The exception is what makes the ban enforceable
everywhere else.

3. **Take the next number.** Four digits, zero-padded, never reused: `EXC-0001` is taken, so yours
   is `EXC-0002`. Grep before you claim it — `grep -rn "EXC-" src docs rules`.
4. **Write the record** in `docs/exceptions/` before the code. It must state: the rule suppressed,
   the exact file and scope, why the rule cannot be satisfied, what compensates for the loss, and
   what would let it be deleted.
5. **Write the comment** in the `-- EXC-nnnn: <reason>` form. The reason goes in the comment, not
   only in the record — the next reader has the file open, not the docs.
6. **Scope it tightly.** Prefer `eslint-disable-next-line <rule> -- EXC-nnnn: …` over a block. If
   you use a block, `eslint-enable` it as soon as the need ends — the logger re-enables `no-console`
   immediately after the ternary that picks the writer.
7. **Name the rule.** `/* eslint-disable -- EXC-0002 */` with no rule id disables everything and
   fails `unicorn/no-abusive-eslint-disable` anyway.
8. **Register it** in `rules/29-exceptions.md` so the corpus lists every live exception in one
   place.
9. **Review it as a change of policy**, because it is one. An exception in `src/modules/auth` or
   `src/packages/secure-storage` needs [security-review](security-review.md).

## Tests

- The suppressed file still needs its tests: `logger.factory.test.ts` covers the sink, the level
  routing, and the field sanitization — the disable removed a lint rule, not the obligation to prove
  behavior.
- Prove the compensating control. The logger's exception is only acceptable because `createLogger`
  redacts via `sanitizeLogFields`; `logger.helper.test.ts` is what makes that claim checkable.
- Run: `npm run lint` (the disable must satisfy the rule) and the file's own suite.

## Security / accessibility / native considerations

- Exceptions concentrate risk: `EXC-0001` is why one file may write to the console, and therefore
  why redaction in that package matters more than anywhere else.
- A suppression in a security path is a finding by default — justify it to a reviewer, not to a
  linter.
- Never suppress `security/*`, `jsx-a11y/*`, or an `architecture/*` boundary rule to unblock a
  merge.

## Documentation delta

- `docs/exceptions/EXC-nnnn.md` (new) — the record.
- `rules/29-exceptions.md` — the register.
- The owner package's README or doc comment when the exception defines its purpose, as the logger's
  does.

## Validation

```bash
npm run lint
npm run quality:docs
npm run quality:agent-docs
npm run knowledge:validate
```

## Forbidden shortcuts

- Inventing an `EXC-nnnn` that has no record — the regex is satisfied and the paper trail is a lie.
  This is the single worst outcome available in this repo.
- Reusing `EXC-0001` for an unrelated disable — that number means "the logger owns the console".
- A bare `/* eslint-disable */` — `unicorn/no-abusive-eslint-disable` plus the missing rule id.
- Suppressing instead of creating the file the rule wants — see the mapping in
  [eslint-typecheck-repair](eslint-typecheck-repair.md).
- Leaving a stale exception after the cause is gone — delete the comment, the record, and the
  register row.

## Definition of done

- [ ] The real fix was attempted and is documented as impossible or worse.
- [ ] The number is new, four digits, and grep-confirmed unused.
- [ ] The record exists in `docs/exceptions/` and is registered in `rules/29-exceptions.md`.
- [ ] The comment names one rule, cites `EXC-nnnn`, states the reason, and re-enables promptly.
- [ ] The record states what would let the exception be deleted.
