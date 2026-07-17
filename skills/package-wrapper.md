# Skill: Add a package owner (vendor facade)

**Use when:** a new third-party library must be usable from application code.

## Required reading

- [rules/09 — Package ownership](../rules/09-package-ownership.md) — the one-owner discipline.
- [ADR 0004 — Package ownership](../architecture/adrs/0004-package-ownership.md) — the decision and
  its cost.
- [docs/eslint/no-raw-package-imports](../docs/eslint/no-raw-package-imports.md) — what the rule
  reports and where.
- [context/package-ownership](../context/package-ownership.md) — today's vendor → owner map.
- [date.facade.ts](../src/packages/date/date.facade.ts) — a facade that hides Day.js plugins and
  returns plain strings.

## Preconditions

- [ ] The dependency is justified — see [dependency-upgrade](dependency-upgrade.md) for the pinning
      and audit obligations.
- [ ] It is a plain library. Capacitor plugins follow [capacitor-plugin](capacitor-plugin.md).
- [ ] You can name the app-facing API without using the vendor's nouns.

## Files

```text
src/packages/<owner>/<owner>.facade.ts    the wrapper (the only file importing the vendor)
src/packages/<owner>/<owner>.types.ts     app-owned types, if the API needs any
src/packages/<owner>/index.ts             the public surface
eslint/package-ownership.config.mjs       edit: the registry entry — not optional
package.json                              edit: exact pinned version
```

## Steps

1. **Install pinned.** Every entry in `dependencies` is an exact version — `"dayjs": "1.11.21"`, no
   caret. `npm run quality:package-ownership` reads `package.json` directly.
2. **Register ownership first.** Add to `PACKAGE_OWNERSHIP` in
   `eslint/package-ownership.config.mjs`:
   `{ vendor: '<npm-name>', owner: '@/packages/<owner>', ownerDirs: ['src/packages/<owner>'] }`.
   Skipping this is the classic failure: the gate reports
   `dependency "<name>" has no owner in package-ownership.config.mjs`, and every import of it fails
   `architecture/no-raw-package-imports` — including inside your own new package.
3. Keep `ownerDirs` to one directory. Two are permitted only where infrastructure genuinely shares a
   vendor (`@ionic/react` is owned by `@/packages/ionic` but also readable by `src/packages/router`;
   `@capacitor/core` by `src/platform/runtime` and `src/packages/secure-storage`). A third is a
   design smell.
4. **Write the facade.** Export app-shaped functions, not the vendor's object. `date.facade.ts`
   extends Day.js with `localizedFormat` and `relativeTime` once at module load, then exports
   `formatDate(isoDateTime, locale): string` — callers never see a `Dayjs`.
5. Do not leak vendor types across the surface. If a type must cross, redeclare it as an app type.
   `architecture/no-raw-vendor-types-in-domain` bans vendor types inside modules, and the ownership
   gate only forgives type-only imports inside `src/packages/**` and `src/platform/**`.
6. **Write `index.ts`** as re-exports only. `quality:exports` rejects any non-export statement, with
   one exception: a bare side-effect import, which is how `src/packages/ionic/index.ts` does
   `import './ionic-styles';`.
7. The owner may not import application code — `architecture/no-module-imports-in-package-owners`. A
   package that needs app config takes it as a parameter, the way `createHttpClient` takes
   `HttpClientDependencies`.
8. Add a hook facade for vendor hooks: `useAppQuery`, `useAppTranslation`, `useAppForm` all exist so
   feature hooks never import the vendor. `architecture/no-third-party-hooks-outside-hook-files`
   backs this up.
9. If the vendor deserves its own ESLint owner rule (as Axios, Day.js, Ionic and Virtuoso have),
   that is a plugin change plus a doc in `docs/eslint/` — `quality:docs` fails on a rule with no
   doc.

## Tests

- `<owner>.facade.test.ts`, colocated. Test the app-facing contract, not the vendor:
  `date.facade.test.ts` asserts formatted output per locale, not that Day.js works.
- Prove the boundary holds: exercise every exported function, including the failure path
  (`isValidIsoDateTime('nonsense')` is `false`).
- Package files carry the same 95% per-file threshold as everything else.
- Run: `npx vitest run --project unit src/packages/<owner>`.

## Security / accessibility / native considerations

- A new dependency is new attack surface: `npm run security:audit` at `--audit-level=high` and
  `npm run security:scan` (Trivy) must pass.
- `knip` will flag the package as unused until something imports it — wire a real consumer in the
  same change or the dead-code gate fails.

## Documentation delta

- `context/package-ownership.md` and `context/dependency-map.md` — the new vendor and its owner.
- `rules/09` if the ownership policy itself gains a nuance.
- `docs/eslint/<rule>.md` if you added a dedicated owner rule.

## Validation

```bash
npm run quality:package-ownership
npm run quality:exports
npm run quality:dead-code
npm run security:audit
npx vitest run --project unit src/packages/<owner>
```

## Forbidden shortcuts

- Importing the vendor from a module "just this once" — `architecture/no-raw-package-imports`; there
  is no allowlist for one call site.
- Adding the dependency without the registry entry — `npm run quality:package-ownership` fails the
  build, and the message names your file.
- Re-exporting the vendor wholesale (`export * from 'vendor'`) — that is a passthrough, not a
  facade, and it puts vendor types back in feature code.
- Listing several `ownerDirs` to make an import compile — that is deleting the boundary to silence
  it.

## Definition of done

- [ ] The vendor is pinned, registered, and imported in exactly one directory.
- [ ] The facade exposes app vocabulary; no vendor type crosses `index.ts`.
- [ ] `index.ts` is re-exports only, and `knip` sees a real consumer.
- [ ] `context/package-ownership.md` lists the new owner.
- [ ] `npm run quality:package-ownership` and `npm run security:audit` pass.
