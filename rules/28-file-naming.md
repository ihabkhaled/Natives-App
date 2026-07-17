# 28 — File naming

> Authority: normative. Conflicts resolve in favor of ADRs and the security policy.

## Mandatory

- MUST name every file under `src/` (outside `src/tests/`) with a kebab-case stem and an approved
  kind suffix — the taxonomy lives in `eslint/filenames.config.mjs` and drives the plugin, the
  filename gate, and this rule.
- MUST pick the kind from this taxonomy; the suffix _is_ the file's contract:

| Family                                        | Suffixes                                                                                                                                                                                                                                                                                                  |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UI family (no inline types, no inline consts) | `.component.tsx`, `.container.tsx`, `.provider.tsx`, `.guard.tsx`, `.boundary.tsx`, `.routes.tsx`, `.routes.ts`                                                                                                                                                                                           |
| Behaviour                                     | `.hook.ts`, `.hook.tsx`, `.service.ts`, `.gateway.ts`, `.repository.ts`, `.store.ts`, `.query.ts`, `.mutation.ts`                                                                                                                                                                                         |
| Declaration homes (may hold module literals)  | `.constants.ts`, `.errors.ts`, `.enums.ts`, `.variants.ts`, `.keys.ts`, `.paths.ts`, `.schema.ts`, `.mapper.ts`, `.helper.ts`, `.utils.ts`, `.factory.ts`, `.facade.ts`, `.adapter.ts`, `.coordinator.ts`, `.parser.ts`, `.listener.ts`, `.migrations.ts`, `.selectors.ts`, `.types.ts`, `.interfaces.ts` |
| Tests                                         | `.test.ts`, `.test.tsx`                                                                                                                                                                                                                                                                                   |

- MUST use one of the nine exact names allowed to skip the suffix: `index.ts`, `main.tsx`,
  `vite-env.d.ts`, `http-client.ts`, `ionic-styles.ts`, `start-app.ts`, `route-registry.ts`,
  `handlers.ts`, `browser.ts`. The last three plus `http-client.ts` also count as declaration homes.
- MUST house a `*.component.tsx` in a folder of the same stem —
  `components/health-status-card/health-status-card.component.tsx` — with its companions
  (`.types.ts`, `.constants.ts`, `index.ts`) beside it.
- MUST name a `*.hook.ts` file after the hook it exports: `use-health-card.hook.ts` for
  `useHealthCard`.
- MUST keep every dot-separated segment kebab-case, including the stem: `auth-analytics.constants.ts`.
- MUST register a new kind in `eslint/filenames.config.mjs` before using it — an unknown suffix
  fails the filename gate rather than quietly inventing a taxonomy.

## Forbidden

- NEVER ship a `src/` file with no kind suffix and no exact-name exemption.
- NEVER use camelCase, PascalCase, or snake_case in a filename anywhere in the repo.
- NEVER put a component file in a folder whose name does not match its stem.
- NEVER pick a suffix for aesthetics: naming a service `*.helper.ts` to dodge the one-use-case rule
  buys a 100% coverage requirement and loses the review the suffix was there to trigger.

## Rationale

The suffix is not decoration — it is the key every architecture rule dispatches on. `getFileKind()`
reads the name, and from it follows whether hooks are legal, whether React may be imported, whether
literals may live at module scope, and what coverage threshold applies. That is why an unknown
suffix is an error: a file the taxonomy cannot classify is a file no rule can govern.

## Valid

```text
src/modules/health/components/health-status-card/
  health-status-card.component.tsx
  health-status-card.constants.ts
  health-status-card.types.ts
  index.ts
```

## Invalid

```text
src/modules/health/components/HealthCard/
  HealthStatusCard.tsx        <- PascalCase, no kind suffix, folder stem mismatch
  healthHelpers.ts            <- camelCase, unknown kind
  health_status.types.ts      <- snake_case segment
```

## Enforcement

| Mechanism                                             | Command                          |
| ----------------------------------------------------- | -------------------------------- |
| Kind suffix or exact name, kebab-case, for all `src/` | `npm run quality:filenames`      |
| `unicorn/filename-case` (kebabCase) repo-wide         | `npm run lint`                   |
| `architecture/require-component-folder`               | `npm run lint`                   |
| `architecture/require-hook-filename`                  | `npm run lint`                   |
| `forceConsistentCasingInFileNames`                    | `npm run typecheck`              |
| Per-file thresholds keyed off the pure-glob suffixes  | `npm run test:coverage:per-file` |

Manual review where mechanical enforcement is impossible: whether the suffix tells the truth. The
gate proves `foo.helper.ts` is a known kind; only a reader can see that it makes network calls and
should have been a gateway.

## Definition of done

- [ ] Every new file has an approved kind suffix and a kebab-case stem.
- [ ] Components sit in same-named folders; hooks are named for the hook they export.
- [ ] Any new kind was added to `eslint/filenames.config.mjs` deliberately.

## Related

[08-types-interfaces-enums-constants](08-types-interfaces-enums-constants.md) ·
[03-components](03-components.md) · [22-testing-and-coverage](22-testing-and-coverage.md) ·
[../docs/eslint/require-component-folder.md](../docs/eslint/require-component-folder.md)
