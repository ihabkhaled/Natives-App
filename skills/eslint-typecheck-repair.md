# Skill: Repair a lint or typecheck failure

**Use when:** `npm run lint` or either typecheck script is red and you need the real fix.

## Required reading

- [rules/23 — ESLint and TypeScript](../rules/23-eslint-typescript.md) — strictness and the
  zero-warning policy.
- [ADR 0011 — TypeScript 7](../architecture/adrs/0011-typescript-7-toolchain-compatibility.md) —
  why there are two compilers and which one is authoritative.
- [docs/eslint/README](../docs/eslint/README.md) — all 50 architecture rules and what each enforces.
- [eslint.config.mjs](../eslint.config.mjs) — the layered config, complexity budgets, and
  relaxations.

## Preconditions

- [ ] You have the full message, including the rule id or the TS error code.
- [ ] You have read the rule's doc — every architecture rule has one at `docs/eslint/<rule>.md`,
      with a valid example, an invalid example, and a "How to fix".
- [ ] You accept the premise: a rule firing usually means the design is wrong, not the rule.

## Files

```text
(the file the rule names — plus, often, a new file that should have existed)
docs/eslint/<rule>.md          the fix, written down already
eslint/filenames.config.mjs    the kind taxonomy, when the complaint is a filename
eslint/package-ownership.config.mjs   the registry, when the complaint is a vendor import
```

## Steps

1. **Read the rule doc first.** `docs/eslint/no-hooks-in-components.md` and friends each carry the
   canonical fix. `quality:docs` guarantees the doc exists for every rule in the plugin.
2. **Map the complaint to the missing file.** These rules almost always mean "this belongs somewhere
   else that does not exist yet":
   - `no-hooks-in-components` → the logic wants a `*.hook.ts` ([hook](hook.md)).
   - `no-inline-query-keys` → a `*.keys.ts` builder ([query](query.md)).
   - `no-inline-routes` → an `APP_PATHS` entry plus a `*.paths.ts` builder ([route](route.md)).
   - `no-inline-api-endpoints` → a `*-api.constants.ts` entry ([gateway](gateway.md)).
   - `no-inline-test-ids` → a `TEST_IDS` entry ([component](component.md)).
   - `no-raw-i18n-text` → an `I18N_KEYS` entry and copy in both catalogs ([i18n-key](i18n-key.md)).
   - `no-raw-package-imports` → an owner package and a registry entry
     ([package-wrapper](package-wrapper.md)).
   - `no-types-outside-type-files` → a `*.types.ts` beside the component.
   - `require-component-folder` → a same-named folder around the component.
3. **`no-typescript-enum`** wants the as-const pattern this codebase uses everywhere:
   `export const X = { A: 'a' } as const;` then `export type X = (typeof X)[keyof typeof X];` — see
   `SESSION_STATUS`, `HTTP_ERROR_KIND`, `ROUTE_ACCESS`.
4. **Complexity failures are real.** `complexity: 8`, `sonarjs/cognitive-complexity: 10`,
   `max-depth: 3`, `max-params: 4`, `max-statements: 20`, `max-lines-per-function: 50`,
   `max-lines: 300` — tighter still for components (150/120) and hooks (200/90). Extract a function;
   do not raise the budget.
5. **Run both compilers.** `npm run typecheck` uses `typescript7` and is authoritative;
   `npm run typecheck:toolchain` uses TypeScript 5.9.3, which only the lint parser needs. They can
   disagree — fixing one and shipping is how the toolchain breaks.
6. **Never widen a type to pass.** `strictTypeChecked` is on: `any`, a bare `as`, or a `!` where the
   value really can be null is a deferred crash. Narrow properly, or parse at the boundary
   ([nest-dto-integration](nest-dto-integration.md)).
7. **`npm run lint:fix` for formatting only.** It cannot fix an architecture rule, because the fix
   is a new file, not a token change.
8. **A suppression is the last resort and needs a paper trail** —
   `architecture/no-undocumented-eslint-disable` demands an `EXC-nnnn`, and
   `unicorn/no-abusive-eslint-disable` forbids a bare `eslint-disable`. Read
   [exception](exception.md) before you reach for one.

## Tests

- The plugin's own suite is `npm run quality:architecture-rules` (the `architecture-plugin` Vitest
  project) — it runs every rule's valid/invalid fixtures from
  `eslint/architecture-plugin/fixtures/`. If you genuinely believe a rule is wrong, that is where
  you prove it, with a fixture.
- After the fix, the file's own tests must still pass — a rule fix that changes behavior is a bug.
- Run: `npm run lint && npm run typecheck && npm run quality:architecture-rules`.

## Security / accessibility / native considerations

- `eslint-plugin-security` findings (`detect-unsafe-regex`, `detect-non-literal-regexp`,
  `detect-eval-with-expression`) are not style. Fix the code.
- `jsx-a11y` failures are accessibility defects that axe would also catch, only later and more
  slowly.
- A suppression in `src/modules/auth` or `src/packages/secure-storage` triggers
  [security-review](security-review.md).

## Documentation delta

- None for a routine fix.
- A new rule needs `docs/eslint/<rule>.md` plus a row in `docs/eslint/README.md`; `quality:docs`
  fails without the file.

## Validation

```bash
npm run lint
npm run typecheck
npm run typecheck:toolchain
npm run quality:architecture-rules
npm run format:check
```

## Forbidden shortcuts

- `// eslint-disable-next-line` to move on — `architecture/no-undocumented-eslint-disable` blocks
  it, and a real `EXC-nnnn` for a fixable problem is worse than the original failure.
- `as any` / `as unknown as T` — the error is telling you the boundary is unparsed.
- Raising a complexity budget in `eslint.config.mjs` — that is editing the ruler to fit the plank.
- Adding a directory to a rule's ownership config to make an import legal — that deletes the
  boundary.
- `--max-warnings=1` locally — the script is `--max-warnings=0` and CI runs the script.

## Definition of done

- [ ] The rule's doc was read and the named fix applied.
- [ ] The fix created the file the architecture expected, rather than silencing the rule.
- [ ] No `any`, no gratuitous cast, no widened budget, no new suppression.
- [ ] Both typecheck scripts and `quality:architecture-rules` pass.
- [ ] `npm run lint` reports zero warnings.
