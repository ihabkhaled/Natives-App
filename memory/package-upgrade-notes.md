# Package upgrade notes

Version choices that are constrained rather than preferred, plus how to re-verify them. `.npmrc`
sets `save-exact=true`, so every version is exact and every bump is a deliberate, reviewable edit.

## The `overrides` block

```json
"overrides": {
  "eslint-plugin-jsx-a11y": { "eslint": "$eslint" },
  "eslint-plugin-react": { "eslint": "$eslint" }
}
```

Both plugins work with ESLint 10 but still declare `eslint` peers of `<=9`, so a plain install fails
peer resolution. The override is **scoped**: it re-points only those two packages' `eslint` peer at
the version already installed (`$eslint` = the root `eslint` entry, currently `10.7.0`), rather than
forcing a version tree-wide. It is cosmetic — a stale range for plugins that already function.
Delete each entry when its plugin publishes an ESLint 10 peer, and do not extend the pattern to a
peer that exists for a real reason (see the typescript-eslint row below).

## Constrained versions

| Package                            | Version   | Constraint                                                                           |
| ---------------------------------- | --------- | ------------------------------------------------------------------------------------ |
| `@sentry/react`                    | `10.60.0` | **Exact** peer of `@sentry/capacitor@4.2.0`. Bump both together or the install fails |
| `react-router`, `react-router-dom` | `5.3.4`   | The `@ionic/react-router` v5 integration contract                                    |
| `typescript`                       | `5.9.3`   | Parser-only; `typescript-eslint@8.64.0` peers `>=4.8.4 <6.1.0`                       |
| `typescript7`                      | → `7.0.2` | The primary compiler; aliased because two majors cannot share a name                 |
| `eslint-plugin-react`              | `7.37.5`  | Needs the override **and** an explicit `react: '19.2'` in `eslint.config.mjs`        |
| `eslint-plugin-jsx-a11y`           | `6.10.2`  | Needs the override                                                                   |

Details: [ionic-router-compatibility](./ionic-router-compatibility.md),
[typescript-7-status](./typescript-7-status.md), [known-pitfalls](./known-pitfalls.md).

`engines` is `node: >=24.0.0`, `npm: >=10.0.0`. The npm floor is `>=10` because npm 12 requires
`^22.22.2 || ^24.15.0 || >=26` and the installed Node (24.14.1) sits in the gap below `^24.15.0`.

## Coupled sets — bump together or not at all

- `@sentry/capacitor` + `@sentry/react` — exact peer.
- `@ionic/react` + `@ionic/react-router` — same version line (`8.8.14`).
- `@capacitor/core` + `cli` + `android` + `ios` — same version (`8.4.2`); a mismatch breaks
  `cap sync` in confusing ways.
- `@tanstack/react-query` + `@tanstack/react-query-devtools`; `vitest` + `@vitest/coverage-v8`.
- `react` + `react-dom` + `@types/react` + `@types/react-dom`.
- `typescript` (parser) is **not** coupled to `typescript7` (primary) — they move independently.

## How to re-verify

```bash
npm run deps:check                                       # ncu: what is behind
npm info <package> peerDependencies                      # the registry's current peers
node scripts/quality/check-toolchain-compatibility.mjs   # fails when the dual compiler is obsolete
```

`npm run deps:check` reports drift but cannot know which drift is intentional — that is what this
page is for. Read it before acting on `ncu` output.

## After any dependency change

1. Register new runtime dependencies in `eslint/package-ownership.config.mjs` and build the owner
   package first — the ownership gate fails on an unowned dependency, lint on an unregistered import.
2. `npm run quality` — the full chain, including `quality:dead-code`, which catches a dependency
   nothing uses.
3. `npm run security:audit` and `npm run security:secrets`.
4. If a Capacitor package moved: `npm run cap:sync`, then `npm run cap:sync:check`, and commit the
   native changes the sync generated.
5. Update this page when a constraint changes — the value of a pin is the reason attached to it.
