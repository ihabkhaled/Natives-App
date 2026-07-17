# TypeScript 7 status

The dual-compiler snapshot and its exit condition. The rationale is
[ADR 0011](../architecture/adrs/0011-typescript-7-toolchain-compatibility.md).

## Current state — dual compiler, still required

| Role             | Package             | Version                    | Invoked as                                 |
| ---------------- | ------------------- | -------------------------- | ------------------------------------------ |
| Primary compiler | `typescript7`       | alias → `typescript@7.0.2` | `node node_modules/typescript7/bin/tsc -b` |
| Parser compiler  | `typescript`        | `5.9.3`                    | `tsc` (whatever is on `PATH`)              |
| Consumer         | `typescript-eslint` | `8.64.0`                   | peer `typescript: >=4.8.4 <6.1.0`          |

The alias exists because two majors of the same package cannot both be named `typescript`. As a side
effect the primary compiler does not own the `tsc` bin, so it must be invoked by path.

**Verified 2026-07-16:** `typescript-eslint@8.64.0` declares
`peerDependencies.typescript: ">=4.8.4 <6.1.0"`. The upper bound `<6.1.0` excludes major 7, so the
dual arrangement is still necessary. Re-verify with:

```bash
node -e "console.log(require('./node_modules/typescript-eslint/package.json').peerDependencies)"
```

## Which compiler gates what

- `npm run typecheck` → **TS 7.0.2**. This is the verdict that matters.
- `npm run build` → **TS 7.0.2** project build, then `vite build`.
- `npm run typecheck:toolchain` → **TS 5.9.3**. Not redundant: it proves the compiler the linter
  loads in-process also accepts the code, so a type-aware rule cannot be reasoning about a program
  that would not compile.

Both run inside `npm run quality`. `typescript7` sits in `knip.json` `ignoreDependencies` because
nothing imports it by name.

## The footgun

Bare `npx tsc`, an editor's bundled TypeScript, and any tool resolving `typescript` from
`node_modules` all get **5.9.3**, not the primary compiler. A file that typechecks in the editor can
still fail `npm run typecheck`. When they disagree, TS7 is the authority — reproduce with the npm
script, never the bare binary.

## Removal trigger

The arrangement dies the moment typescript-eslint's peer range covers TypeScript 7. That is watched
mechanically, not remembered:

```bash
node scripts/quality/check-toolchain-compatibility.mjs
```

It reads the alias's major from `package.json` and the live peer range from `node_modules`, then
**exits 1 when the range's upper bound no longer excludes the primary major** — failing precisely
when the dual setup has become unnecessary, with a message that is the removal checklist. It is
deliberately outside the `quality` chain: a retirement alarm run during dependency work, not a
per-commit gate.

**When it fires:** drop the `typescript` 5.x devDependency; point `typescript` at v7 and delete the
`typescript7` alias; collapse the two typecheck scripts into one and update the gate table in
[release-gates](../context/release-gates.md); remove `typescript7` from `knip.json`; retire ADR 0011
per its own Supersession clause and update this page.

## Related constraint

`baseUrl` is gone in TS7 (TS5102), so `tsconfig.base.json` is paths-only. That is a permanent TS7
fact independent of the dual arrangement — it survives the removal. See
[known-pitfalls](./known-pitfalls.md). A fuller reference at
`docs/dependencies/typescript-compatibility.md` is the intended home for the version snapshot; it
does not exist yet, so this page is authoritative in the meantime.
