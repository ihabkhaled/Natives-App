# Skill: Add a translation key

**Use when:** any new user-visible string appears — a label, a message, a validation error.

## Required reading

- [rules/21 — i18n and RTL](../rules/21-i18n-rtl.md) — key-only copy, en/ar parity, direction.
- [docs/eslint/no-raw-i18n-text](../docs/eslint/no-raw-i18n-text.md) — what counts as raw text.
- [i18n-keys.constants.ts](../src/shared/i18n/i18n-keys.constants.ts) — the namespaced key tree.
- [validate-locales.mjs](../scripts/quality/validate-locales.mjs) — the gate; read what it actually
  checks before arguing with it.

## Preconditions

- [ ] The string is user-visible. Log messages and analytics event names are not translated.
- [ ] You have real Arabic copy, not a placeholder — the gate rejects empty values and machine mush
      is worse than a missing feature.
- [ ] You know the namespace: `common`, `errors`, `states`, `welcome`, `auth`, `home`, `health`, …

## Files

```text
src/shared/i18n/i18n-keys.constants.ts    the declaration — the source of truth
src/shared/i18n/locales/en.json           English copy
src/shared/i18n/locales/ar.json           Arabic copy
```

## Steps

1. **Declare the key** in `I18N_KEYS` under its namespace. The value is the dotted path itself:
   `health: { title: 'health.title', … }`. That redundancy is what lets `validate-locales.mjs` match
   declarations to catalog entries by regex.
2. Follow the namespace convention: the leaf is `camelCase`, the path is `namespace.leaf`. The
   gate's `isDottedKey` accepts only 2+ alphanumeric segments — a key with a dash or three levels
   will not be recognized as declared and the run fails.
3. **Add the copy to `en.json` and `ar.json`** at the matching nested path. All three must agree, in
   all three directions: `ar` missing a key fails, `en` missing a key fails, a catalog key with no
   `I18N_KEYS` declaration fails as "orphan copy", and an empty `en` value fails.
4. **Consume through a hook.** `const { t } = useAppTranslation();` then
   `t(I18N_KEYS.health.title)`. Components receive the resolved string as a prop — a `t()` call in a
   component fails `architecture/no-hooks-in-components`, and a bare string in JSX fails
   `architecture/no-raw-i18n-text`.
5. **Interpolate with params**, never by concatenating: `t(I18N_KEYS.home.greeting, { name })`. The
   `TranslateParams` type comes from `@/packages/i18n`; the catalogs carry the placeholders.
6. **Error copy is derived, not chosen.** A new `AppErrorCode` needs an `errors.*` key plus an entry
   in `ERROR_CODE_TO_I18N_KEY` (`src/shared/mappers/error-i18n.mapper.ts`). That map is typed
   `Record<AppErrorCode, I18nKey>`, so forgetting one is a typecheck error, not a runtime blank.
7. **Validation messages are keys too** — `login-form.schema.ts` passes
   `I18N_KEYS.auth.validationEmailInvalid` into `.min()` and the hook translates it later. See
   [form](form.md).
8. Write Arabic that reads naturally, and check RTL: `localeToDirection` from `@/packages/i18n`
   drives `dir`, and `applyDocumentLocale` sets it on `<html>`.

## Tests

- `i18n-keys.constants.test.ts` — the declaration tree is a pure constants file; keep it exhaustive.
- Hook tests that assert copy must initialize the real stack: `await initTestI18n()` from
  `tests/setup/i18n-test.helper.ts` in `beforeAll`. It loads the actual `en.json`/`ar.json`, so
  `use-health-card.hook.test.ts` can assert `'API health'` — a test asserting the key string would
  pass while the catalog is empty.
- `tests/accessibility/a11y.spec.ts` axe-scans the Arabic layout after asserting
  `toHaveAttribute('dir', 'rtl')`; `tests/visual/visual.spec.ts` holds an RTL snapshot.
- Run: `npm run quality:locales && npx vitest run --project unit src/shared/i18n`.

## Security / accessibility / native considerations

- Never interpolate a backend message into copy — that re-opens the raw-error leak that
  `architecture/no-unsafe-error-display` and ADR 0012 exist to close. Map the code to a key instead.
- RTL is not mirroring text alone: check icon direction, chevrons, and any absolute positioning.
- Long Arabic strings change layout — the visual snapshot is where that surfaces.

## Documentation delta

- None for a routine key. `rules/21` only if the key policy or the supported-locale set changes.
- `context/error-flow.md` when a new error code and its copy join the taxonomy.

## Validation

```bash
npm run quality:locales
npx vitest run --project unit src/shared/i18n
npm run test:a11y
npm run test:visual
```

## Forbidden shortcuts

- `<IonLabel>Save</IonLabel>` — `architecture/no-raw-i18n-text`.
- Adding to `en.json` and "doing `ar` later" — `npm run quality:locales` fails the build, by design.
- Copying the English value into `ar.json` to pass the gate — the gate goes green and the product is
  broken for every Arabic user. The gate checks presence; only you can check meaning.
- `t()` inside a component or a schema file — hooks translate; schemas carry keys.
- Building a sentence with `` `${t(a)} ${t(b)}` `` — word order is not universal; use one key with
  params.

## Definition of done

- [ ] The key is declared in `I18N_KEYS` and present in both catalogs with real copy.
- [ ] Only hooks call `t()`; components receive strings.
- [ ] A new error code has a key and an `ERROR_CODE_TO_I18N_KEY` entry.
- [ ] `npm run quality:locales` passes and the RTL a11y scan is clean.
