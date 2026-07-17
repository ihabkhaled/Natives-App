# Release gates

The real chain from `package.json`, in order, and what each link proves. Nothing here is aspiration:
these are the scripts that exist and the order they run in.

```text
pre-commit  →  pre-push  →  npm run quality  →  npm run validate:web  →  npm run validate:native
                                 (17 gates)          (quality + 9)             (4 gates)
                                                          └──────── npm run validate ────────┘
```

## Local hooks (fast, staged-scope)

`.husky/pre-commit` runs `lint-staged` (ESLint `--fix --max-warnings=0` + Prettier on staged files),
then `validate-filenames.mjs --staged` for the filename taxonomy, then
`validate-forbidden-imports.mjs`. `.husky/commit-msg` runs commitlint against
`@commitlint/config-conventional`. `.husky/pre-push` re-runs typecheck, lint, the two architecture
gates, and the test suite — the last cheap chance before CI.

`quality:filenames` exists as a script but is intentionally not in the `quality` chain: the
pre-commit hook already runs it over staged files, which is where a wrong filename is cheapest to
fix.

## `npm run quality` — 17 gates

| #   | Gate                         | Proves                                                                                                                                   |
| --- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `format:check`               | Prettier is clean; formatting is never a review topic                                                                                    |
| 2   | `lint`                       | ESLint at `--max-warnings=0`: 50 architecture rules + strict type-aware rules                                                            |
| 3   | `typecheck`                  | The **primary** compiler (TS 7.0.2, via `node node_modules/typescript7/bin/tsc -b`)                                                      |
| 4   | `typecheck:toolchain`        | The parser compiler (TS 5.9.3) also accepts the code — see [ADR 0011](../architecture/adrs/0011-typescript-7-toolchain-compatibility.md) |
| 5   | `quality:architecture-rules` | The architecture rules' own fixtures still accept and reject correctly                                                                   |
| 6   | `test:coverage`              | All Vitest projects pass and coverage is written                                                                                         |
| 7   | `test:coverage:per-file`     | No file is below its threshold — named, not averaged                                                                                     |
| 8   | `build`                      | TS7 project build + a real Vite production bundle                                                                                        |
| 9   | `quality:architecture`       | Layer direction and module structure, re-derived independently of lint                                                                   |
| 10  | `quality:package-ownership`  | Every dependency has an owner; no vendor imported outside it                                                                             |
| 11  | `quality:dead-code`          | knip: no unused files, exports, or dependencies                                                                                          |
| 12  | `quality:circular`           | madge: no import cycles under `src/`                                                                                                     |
| 13  | `quality:duplicates`         | jscpd at `--threshold 0`: no copy-paste in `src/` or `tests/`                                                                            |
| 14  | `quality:exports`            | `index.ts` files are re-export surfaces only, and every export resolves                                                                  |
| 15  | `quality:locales`            | `en`/`ar` key-tree parity; every `I18N_KEYS` leaf exists; no orphan copy                                                                 |
| 16  | `quality:docs`               | Every relative doc link resolves; every ESLint rule has a doc                                                                            |
| 17  | `quality:agent-docs`         | Agent entrypoints exist and share one `Governance-Version`                                                                               |

Order is deliberate. Formatting and lint fail in seconds; the build and the full suite come after
the cheap gates have already rejected the obvious. Gates 9 and 10 duplicate lint on purpose: a
second implementation means a plugin bug and a script bug must coincide to let a violation through.

## `npm run validate:web` — quality + 9

Runs `quality` first, then:

| Gate                  | Proves                                                                      |
| --------------------- | --------------------------------------------------------------------------- |
| `test:e2e`            | Journeys across desktop, Pixel 7, and the Arabic RTL project                |
| `test:a11y`           | axe finds no WCAG 2.2 AA violations, including dark and RTL                 |
| `test:visual`         | Five surfaces match their snapshots within `maxDiffPixelRatio: 0.02`        |
| `security:audit`      | `npm audit --audit-level=high`                                              |
| `security:secrets`    | Trivy secret scan — a committed token fails the build                       |
| `security:scan`       | Trivy vuln + secret + misconfig at HIGH/CRITICAL                            |
| `knowledge:build`     | Regenerates `.ai/` from the canonical roots                                 |
| `knowledge:validate`  | The manifest hash matches every canonical file; every link resolves         |
| `knowledge:benchmark` | The context resolver stays under 5s and returns rules for every sample task |

`knowledge:build` runs immediately before `knowledge:validate` for a reason: validate compares
canonical file hashes against `.ai/manifest.json`, so a docs edit without a rebuild fails. Editing
any canonical document and running `validate:web` regenerates and re-verifies in one pass.

## `npm run validate:native` — 4 gates

| Gate             | Proves                                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `cap:sync`       | `npm run build` then `cap sync` — the web build the native shells will load                                                     |
| `cap:sync:check` | `android/` and `ios/` exist, both native app ids match `APP_IDENTITY`, and the tracked native tree did **not** drift after sync |
| `android:verify` | `cap:sync` → `android:lint` → `android:test` → `android:build` (`assembleDebug`)                                                |
| `ios:verify`     | On macOS: a real `xcodebuild`. Elsewhere: prints **UNVERIFIED** and exits 0                                                     |

`ios:verify` is honest by design. On a non-macOS machine it cannot compile the iOS project, so it
says so and exits 0 rather than faking a pass — CI runs iOS on a macOS job. `android:verify` fails
loudly with an actionable message when no JDK is on `PATH`, and names the task it did **not** run.
Both realities are recorded in `memory/native-pitfalls.md`.

## Choosing gates by risk

`npm run knowledge:context -- --task="<exact task>"` classifies the task into a risk lane and prints
the gates it requires: routine (lint, typecheck, unit), standard (adds coverage, architecture,
ownership, build), critical (adds integration, contract, the security scans, and E2E). Auth, tokens,
permissions, deep links, secure storage, and migrations are always critical.
