# 21 — i18n and RTL

> Authority: normative. Conflicts resolve in favor of ADRs and the security policy.

## Mandatory

- MUST declare every user-visible string as a key in `I18N_KEYS`
  (`src/shared/i18n/i18n-keys.constants.ts`) and write its copy in both `en.json` and `ar.json`.
- MUST translate inside a hook, through `useAppTranslation` from `@/packages/i18n`, and pass the
  finished string down as a prop.
- MUST use `translateNow` only where no hook can run — the class-based `AppErrorBoundary` is the
  reason it exists.
- MUST keep the catalogs at exact parity: the same key tree in `en` and `ar`, every key declared in
  `I18N_KEYS`, and no orphan copy in a catalog.
- MUST derive direction from the locale with `localeToDirection` (`ar`, `fa`, `he`, `ur` → `rtl`)
  and apply `dir` once at the document root from the app appearance provider.
- MUST format dates, times, and numbers through `@/packages/date` with the active locale, never with
  a hand-rolled string.
- MUST use logical CSS properties and flex/grid ordering so a mirrored layout needs no per-component
  branch.

## Forbidden

- NEVER put user-visible text in JSX as raw text or as a string expression — the linter reads both.
- NEVER import `i18next`, `react-i18next`, or the language detector outside `src/packages/i18n`.
- NEVER concatenate translated fragments into a sentence; grammar and word order differ per
  language, so interpolate within one key.
- NEVER ship a key with empty `en` copy, and never leave `ar` behind "for now".

## Rationale

Arabic is a first-class locale in this boilerplate precisely because RTL breaks the assumptions that
LTR-only code makes invisibly: hard-coded `margin-left`, concatenated sentences, and per-component
direction checks. Keys-only copy also means a translator never opens a `.tsx` file. Catalog parity
is gated because the failure mode of a missing key is silent in development and visible only to the
users who read that language.

## Valid

```ts
// src/modules/health/hooks/use-health-card.hook.ts
const { t, locale } = useAppTranslation();
return {
  title: t(I18N_KEYS.health.title),
  checkedAtText: health === undefined ? '' : formatDateTime(health.checkedAtIso, locale),
};
```

## Invalid

```tsx
// src/modules/health/components/health-status-card/health-status-card.component.tsx
<IonCardTitle>Backend health</IonCardTitle> {/* raw copy in JSX */}
<IonNote>{'Checked at ' + new Date(props.checkedAtIso).toLocaleString()}</IonNote> {/* concatenation + raw formatting */}
```

## Enforcement

| Mechanism                                              | Command                             |
| ------------------------------------------------------ | ----------------------------------- |
| `architecture/no-raw-i18n-text`                        | `npm run lint`                      |
| `architecture/no-raw-package-imports`                  | `npm run lint`                      |
| `architecture/no-direct-dayjs-import-outside-owner`    | `npm run lint`                      |
| `en`/`ar` parity, `I18N_KEYS` completeness, empty copy | `npm run quality:locales`           |
| RTL journeys through the `e2e-desktop-ar` project      | `npm run test:e2e`                  |
| Mirrored layout regressions                            | `npm run test:visual`               |
| i18n owner dirs match the registry                     | `npm run quality:package-ownership` |

Manual review where mechanical enforcement is impossible: translation quality and layout sanity. The
locale gate proves `ar.json` has a string for every key — it cannot tell that the string is a
machine translation, or that the mirrored screen puts the primary action where nobody looks.

## Definition of done

- [ ] Every new string is an `I18N_KEYS` entry with real `en` and `ar` copy.
- [ ] Translation happens in a hook; the component receives finished text.
- [ ] The screen was viewed in `ar` and reads correctly right to left.

## Related

[03-components](03-components.md) · [16-forms-and-validation](16-forms-and-validation.md) ·
[19-accessibility](19-accessibility.md) ·
[../docs/eslint/no-raw-i18n-text.md](../docs/eslint/no-raw-i18n-text.md)
