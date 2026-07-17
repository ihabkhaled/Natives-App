# Skill: Add or upgrade a dependency

**Use when:** a package must be added, bumped, or removed.

## Required reading

- [rules/25 — Dependencies](../rules/25-dependencies.md) — adding, pinning, owning, removing.
- [ADR 0011 — TypeScript 7](../architecture/adrs/0011-typescript-7-toolchain-compatibility.md) —
  why two TypeScripts exist and which one compiles.
- [package-ownership.config.mjs](../eslint/package-ownership.config.mjs) — the registry every
  runtime dependency must appear in.
- [context/dependency-map](../context/dependency-map.md) — what depends on what today.
- [knip.json](../knip.json) — the dead-code gate's entry points and its `ignoreDependencies` list.

## Preconditions

- [ ] The need is real and unmet by what is installed — check `context/package-ownership.md` first.
- [ ] For an addition: an owner package is planned — see [package-wrapper](package-wrapper.md), or
      [capacitor-plugin](capacitor-plugin.md) for a plugin.
- [ ] For an upgrade: you have read the changelog for the range you are crossing, not just the
      version number.

## Files

```text
package.json                          exact versions only
package-lock.json                     committed, from a real install
eslint/package-ownership.config.mjs   registry entry for any runtime dependency
src/packages/<owner>/**               the facade, for an addition
knip.json                             only when a dependency legitimately has no importer
```

## Steps

1. **Survey:** `npm run deps:check` (`ncu`) lists what is behind. It is a report, not an instruction
   — this repo pins deliberately.
2. **Pin exactly.** Every entry in `dependencies` and `devDependencies` is a bare version:
   `"axios": "1.18.1"`, `"zod": "4.4.3"`. No `^`, no `~`. A range makes the lockfile the only record
   of what you actually tested.
3. **Upgrade one thing at a time.** A batch bump that breaks tells you nothing about which package
   broke it.
4. **Register a new runtime dependency** in `PACKAGE_OWNERSHIP` before writing any import.
   `npm run quality:package-ownership` reads `package.json` and fails with
   `dependency "<name>" has no owner in package-ownership.config.mjs`. Only `react` and `react-dom`
   are exempt (`FOUNDATIONAL_VENDORS`).
5. **Mind the toolchain split.** `typescript7` (aliased to `typescript@7.0.2`) compiles —
   `npm run typecheck` and `npm run build` both use `node node_modules/typescript7/bin/tsc`. Plain
   `typescript` (5.9.3) exists only for the lint parser, checked by `npm run typecheck:toolchain`.
   **Run both.** A dependency's types can satisfy one and not the other; that is exactly what ADR
   0011 is about.
6. **Check the ESLint 10 surface** when touching a lint plugin. `eslint.config.mjs` already pins
   `react: { version: '19.2' }` because the plugin's `detect` path used `context.getFilename()`,
   which ESLint 10 removed, and `overrides` in `package.json` forces `eslint: $eslint` into two
   plugins. These are load-bearing.
7. **Removing a dependency:** delete the import, the facade, the registry entry and the
   `package.json` line — in that order. Leaving the registry entry fails the gate with
   `owner dir "<dir>" for vendor "<name>" does not exist`.
8. **Audit and scan:** `npm run security:audit` at `--audit-level=high`, then
   `npm run security:scan` (Trivy, HIGH and CRITICAL). A high-severity advisory blocks the merge.
9. **Prove it end to end.** A dependency bump is not a docs change: run `npm run validate:web`, and
   for anything Capacitor-adjacent `npm run validate:native` too.

## Tests

- The owner facade's test is the contract — `date.facade.test.ts` asserts formatted output, so a
  Day.js change that alters formats fails there rather than in a screenshot.
- `npm run quality:architecture-rules` runs the plugin's own fixture suite; an ESLint upgrade that
  changes rule APIs fails here first.
- The visual suite catches rendering regressions from an Ionic or Tailwind bump —
  `npm run test:visual`.
- Run: `npm run test` for the full Vitest set after any bump.

## Security / accessibility / native considerations

- A new dependency is new attack surface and new supply-chain risk. Prefer no dependency; then a
  small, maintained one; then a fork you own.
- Capacitor plugins must stay on the installed major (`8.x`); mixing majors breaks the native
  bridge.
- An Ionic or axe bump changes accessibility output — re-run `npm run test:a11y` and read the diff.

## Documentation delta

- `context/dependency-map.md` and `context/package-ownership.md` for any addition or removal.
- `rules/25` if the pinning or approval policy changes.
- An ADR when the choice is a real tradeoff, not a routine bump.

## Validation

```bash
npm run deps:check
npm run typecheck && npm run typecheck:toolchain
npm run quality:package-ownership
npm run quality:dead-code
npm run security:audit && npm run security:scan
npm run validate:web
```

## Forbidden shortcuts

- `npm i <pkg>` and moving on — the caret it writes is a range, and the registry entry is missing;
  two gates fail.
- `npm audit fix --force` — it silently crosses majors and undoes the pinning.
- Adding to `knip.json`'s `ignoreDependencies` to silence the dead-code gate — the list is for
  genuinely importer-less packages (`@capacitor/android`, `typescript7`), not for hiding an unwired
  one.
- Upgrading `typescript` and assuming `typecheck` covered it — that script uses `typescript7`.
- Skipping `typecheck:toolchain` because "the build passed" — the lint parser is the other half.

## Definition of done

- [ ] The version is exact, and the lockfile came from a real install.
- [ ] Every runtime dependency has a registry entry and exactly one owner directory.
- [ ] Both typecheck scripts pass.
- [ ] `security:audit` and `security:scan` are clean at HIGH and above.
- [ ] `npm run validate:web` passes; native ran too if Capacitor was touched.
