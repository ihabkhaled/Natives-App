# 25 — Dependencies

> Authority: normative. Conflicts resolve in favor of ADRs and the security policy.

## Mandatory

- MUST justify a new dependency against the alternative of writing it: a package earns its place by
  solving a problem that is genuinely hard, not by saving twenty lines.
- MUST pin every dependency to an exact version — no `^`, no `~`, no ranges. `package.json` in this
  repo lists exact versions and `package-lock.json` is committed.
- MUST register a new runtime dependency in `eslint/package-ownership.config.mjs` and create its
  owner package in the same change; the ownership gate fails on an unowned dependency.
- MUST keep tooling-only packages in `devDependencies`, and MUST list a genuinely-unused-but-needed
  package in the `knip.json` `ignoreDependencies` allowlist with a reason.
- MUST honour the engine floor: Node `>=24` and npm `>=10`.
- MUST review a new package's transitive weight, license, maintenance, and native footprint before
  adding it — a Capacitor plugin also changes the Android and iOS projects.
- MUST remove the dependency, its owner, its registry entry, and its documentation together.

## Forbidden

- NEVER add a dependency without an owner directory; there is no "we'll wrap it later".
- NEVER introduce a second library for a job an owner already covers — one HTTP client, one form
  library, one date library.
- NEVER upgrade a major version inside an unrelated change.
- NEVER leave a known high or critical advisory unresolved to land a feature.

## Rationale

Every dependency is a permanent commitment to somebody else's release schedule, and in a Capacitor
app it is also a commitment in two native build systems. Exact pins make the lockfile the truth and
make `npm ci` reproducible across machines and CI. Requiring the owner in the same change is what
keeps [09-package-ownership](09-package-ownership.md) true by construction rather than by cleanup.

## Valid

```jsonc
// package.json
"dependencies": {
  "@capacitor/network": "8.0.1" // exact pin; owner: src/packages/capacitor-network
}
```

```js
// eslint/package-ownership.config.mjs
{ vendor: '@capacitor/network', owner: '@/packages/capacitor-network', ownerDirs: ['src/packages/capacitor-network'] },
```

## Invalid

```jsonc
// package.json
"dependencies": {
  "lodash": "^4.17.21", // range pin, no owner, and a job the app already does natively
  "moment": "2.30.1" // a second date library beside the dayjs owner
}
```

## Enforcement

| Mechanism                                                    | Command                             |
| ------------------------------------------------------------ | ----------------------------------- |
| Every runtime dependency owned, every owner dir present      | `npm run quality:package-ownership` |
| `architecture/no-raw-package-imports` (unregistered vendors) | `npm run lint`                      |
| Unused dependencies, exports, and files                      | `npm run quality:dead-code`         |
| High and critical advisories                                 | `npm run security:audit`            |
| Vulnerable versions in the tree                              | `npm run security:scan`             |
| Available updates (advisory, not a gate)                     | `npm run deps:check`                |

Manual review where mechanical enforcement is impossible: the decision itself. No gate asks whether
the package is maintained, whether its license is compatible, or whether the 40 kB it adds is worth
the 20 lines it saves. That judgement is the review.

## Definition of done

- [ ] The dependency is pinned exactly, registered, owned, and documented.
- [ ] `npm run quality:package-ownership` and `npm run quality:dead-code` pass.
- [ ] `npm run security:audit` reports nothing at high or above.

## Related

[09-package-ownership](09-package-ownership.md) · [18-security](18-security.md) ·
[26-native-release-readiness](26-native-release-readiness.md) ·
[../docs/eslint/no-raw-package-imports.md](../docs/eslint/no-raw-package-imports.md)
