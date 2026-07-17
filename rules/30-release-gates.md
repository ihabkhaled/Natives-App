# 30 — Release gates

> Authority: normative. Conflicts resolve in favor of ADRs and the security policy.

## Mandatory

- MUST pass `npm run validate` before a release. It is `validate:web` followed by
  `validate:native`, and it is the only definition of "done" that counts.
- MUST run the gate that matches the change's risk lane while iterating: routine work needs lint,
  typecheck, and `test:unit`; standard work adds coverage, architecture, ownership, and build;
  critical work — auth, tokens, permissions, deep links, secure storage, migrations, secrets —
  adds integration, contract, security, and E2E.
- MUST fix the cause when a gate fails. A red gate is information, not an obstacle.
- MUST treat an iOS **UNVERIFIED** result as an open item routed to a macOS run, never as a pass.
- MUST rebuild `.ai/` through `npm run knowledge:build` when canonical documents change, since
  `knowledge:validate` fails on a stale manifest.

## Forbidden

- NEVER remove a step from a `validate` chain, lower a threshold, or widen an ignore list to get a
  green build.
- NEVER release on a partial chain because "only the docs changed" — the docs gates are in the chain
  for exactly that change.
- NEVER commit generated `.ai/` edits by hand to satisfy `knowledge:stale`.

## The chains

`npm run quality` — 17 steps, in this order:

| #     | Step                                                                       |
| ----- | -------------------------------------------------------------------------- |
| 1–2   | `format:check`, `lint`                                                     |
| 3–4   | `typecheck` (TypeScript 7), `typecheck:toolchain` (TypeScript 5.9)         |
| 5     | `quality:architecture-rules` (the plugin's own fixtures)                   |
| 6–7   | `test:coverage`, `test:coverage:per-file`                                  |
| 8     | `build`                                                                    |
| 9–10  | `quality:architecture`, `quality:package-ownership`                        |
| 11–13 | `quality:dead-code`, `quality:circular`, `quality:duplicates`              |
| 14–17 | `quality:exports`, `quality:locales`, `quality:docs`, `quality:agent-docs` |

`npm run validate:web` — `quality`, then:

| Stage     | Steps                                                          |
| --------- | -------------------------------------------------------------- |
| Browser   | `test:e2e`, `test:a11y`, `test:visual`                         |
| Security  | `security:audit`, `security:secrets`, `security:scan`          |
| Knowledge | `knowledge:build`, `knowledge:validate`, `knowledge:benchmark` |

`npm run validate:native` — `cap:sync`, `cap:sync:check`, `android:verify`, `ios:verify`.

`npm run validate` — `validate:web && validate:native`.

## Rationale

The order is deliberate: formatting and lint fail in seconds, typecheck in tens of seconds, and the
slow browser and native stages only run once the cheap signals are clean. Splitting web from native
means a machine without a Mac or an Android SDK can still run everything meaningful, and the native
chain fails honestly rather than silently skipping. Because the chains are shell `&&` sequences, the
first failure stops the run — you always debug one thing.

## Valid

```bash
# iterating on a critical change (auth, tokens, deep links)
npm run lint && npm run typecheck
npm run test:coverage && npm run test:coverage:per-file
npm run test:integration && npm run test:contract
npm run security:audit && npm run security:secrets
# before release
npm run validate
```

## Invalid

```bash
npm run lint -- --max-warnings=5   # the zero-warning contract is the gate
npm run test:coverage -- --coverage.thresholds.perFile=false  # per-file is the point
npm run validate:web              # shipping a Capacitor app without validate:native
```

## Enforcement

| Mechanism                                          | Command                            |
| -------------------------------------------------- | ---------------------------------- |
| Static, type, test, architecture, docs gates       | `npm run quality`                  |
| Everything above plus browser, security, knowledge | `npm run validate:web`             |
| Sync drift, Android build, iOS honesty             | `npm run validate:native`          |
| The release gate                                   | `npm run validate`                 |
| Pre-push subset (typecheck, lint, architecture)    | `.husky/pre-push`                  |
| Every gate on push and pull request                | `.github/workflows/ci.yml` per-job |
| Aggregate refusal when any gate fails              | `all-gates-green` job              |

Manual review where mechanical enforcement is impossible: CI runs every gate on push and pull
request, and `all-gates-green` fails when any job fails or is cancelled — but nothing forces a
_tag_ to be cut from a commit whose CI was green. Branch protection requiring `all-gates-green`
is a repository setting, not a file this project can commit. Configure it; until you do, the last
step is a human promise.

## Definition of done

- [ ] `npm run validate` passes end to end on a machine that can build both platforms.
- [ ] No chain step was removed and no threshold was lowered to get there.
- [ ] Any iOS UNVERIFIED result has a macOS run behind it before the release ships.

## Related

[22-testing-and-coverage](22-testing-and-coverage.md) ·
[26-native-release-readiness](26-native-release-readiness.md) · [18-security](18-security.md) ·
[31-review-checklist](31-review-checklist.md)
