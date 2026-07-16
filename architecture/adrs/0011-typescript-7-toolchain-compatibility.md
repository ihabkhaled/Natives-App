# ADR 0011: TypeScript 7 toolchain compatibility

- Status: Accepted
- Date: 2026-07-16
- Deciders: Architecture owner

## Context

TypeScript 7 is the native-port compiler and is worth adopting for its checking speed on a strict
codebase. It cannot simply replace TypeScript 5, because `typescript-eslint@8.64.0` declares
`peerDependencies.typescript` as `>=4.8.4 <6.1.0`. That range excludes both 6 and 7, and the parser
loads the compiler in-process to build the type-aware program that `strictTypeChecked` needs. So the
choice is: skip TS7, drop type-aware linting, or install both compilers and give each one job.

TS7 also removed `baseUrl` — configuring it raises TS5102 — which the tsconfig has to account for
independently of this decision.

## Decision

Run two compilers, with a single, explicit division of labour.

- **Primary compiler — TypeScript 7.0.2**, installed under the npm alias
  `"typescript7": "npm:typescript@7.0.2"`. It is the only compiler whose verdict gates the build.
  Because the alias does not own the `tsc` bin name, it is invoked by path:
  - `npm run typecheck` → `node node_modules/typescript7/bin/tsc -b --pretty false`
  - `npm run build` → `node node_modules/typescript7/bin/tsc -b && vite build`
- **Parser compiler — TypeScript 5.9.3**, installed as plain `typescript`. It exists _only_ to
  satisfy the typescript-eslint peer range and is what `tsc` on `PATH` resolves to. Its own pass,
  `npm run typecheck:toolchain` (`tsc -b --pretty false`), is kept in the `quality` chain so the
  code the linter's compiler sees is verified too, rather than merely parsed.
- `tsconfig.base.json` declares `paths` with **no** `baseUrl`; `@/*` maps to `./src/*` and resolves
  through `vite-tsconfig-paths` at build and test time.
- `typescript7` is listed in `knip.json`'s `ignoreDependencies` because nothing imports it by name.

**Removal condition:** the moment typescript-eslint's peer range covers TypeScript 7, this
arrangement must be deleted — drop the `typescript` 5.x devDependency, point `typescript` at v7,
remove the `typescript7` alias, and collapse the two typecheck scripts into one.

That condition is watched mechanically, not remembered:
`node scripts/quality/check-toolchain-compatibility.mjs` reads the alias's major from `package.json`
and the live peer range from `node_modules/typescript-eslint/package.json`, and **exits non-zero
when the range's upper bound no longer excludes the primary major** — failing precisely when the
dual setup becomes unnecessary. It is deliberately outside the `quality` chain: a retirement alarm,
run on dependency work. A companion reference at `docs/dependencies/typescript-compatibility.md` is
the intended home for the version snapshot; it does not exist yet, so this ADR carries the contract
in the meantime.

## Consequences

**Positive:** Full TS7 checking on the build path while type-aware ESLint keeps working. The
retirement trigger is executable, so this decision cannot quietly outlive its reason.

**Negative / cost:** Two compilers in `node_modules`, two typecheck passes in `quality`, and a
genuine footgun: bare `npx tsc` silently runs 5.9.3, not the primary compiler. Any behavior
difference between the two majors surfaces as a confusing second-pass failure.

**Enforcement:** `npm run typecheck` and `npm run typecheck:toolchain` both run inside
`npm run quality`; `node scripts/quality/check-toolchain-compatibility.mjs` fails when the dual
arrangement is obsolete.

## Alternatives considered

- TypeScript 5.9.3 only — rejected: gives up the primary compiler's checking speed for a tooling
  peer range.
- TypeScript 7 only, with type-aware linting disabled — rejected: `strictTypeChecked` catches whole
  classes of defects that syntax-only rules cannot.
- `overrides` to force typescript-eslint to accept v7 — rejected: unlike the ESLint 10 peer
  overrides, this one is not cosmetic; the parser loads the compiler API in-process, so an
  unsupported major risks real breakage rather than a satisfied range.

## Supersession

Superseded by its own removal condition above: when typescript-eslint supports TypeScript 7, this
ADR is retired and replaced by a single-compiler note.
