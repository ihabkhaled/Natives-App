# Localization workflow

How a string gets from a design into both catalogs without a translator ever opening a `.tsx` file,
and without a missing Arabic key reaching a user.

## Adding a string

1. **Declare the key** in the owning `src/shared/i18n/<area>-keys.constants.ts`. The key is its own
   dotted path (`squads.thresholdValue`), so the constant and the catalog can never drift apart.
2. **Write English copy** in [`en.json`](../../src/shared/i18n/locales/en.json). Expand
   abbreviations — "minutes", not "min" — because an abbreviation is untranslatable and a screen
   reader spells it out.
3. **Write Arabic copy** in [`ar.json`](../../src/shared/i18n/locales/ar.json) in the same commit,
   using [the terminology glossary](terminology-glossary.md). Never leave `ar` "for now": the gate
   fails, and it fails for a reason — a missing translation is invisible in development and visible
   only to the people who read that language.
4. **Translate in a hook** through `useAppTranslation`, and pass finished text down as a prop.
5. **Run `npm run quality:locales`** before committing.

## Interpolation, never concatenation

Word order differs per language, so a sentence is one key with placeholders:

```ts
// correct — the translator controls the whole sentence
t(I18N_KEYS.squads.thresholdValue, {
  percent: formatPercent(squad.attendanceThresholdPct, locale),
});

// wrong — Arabic cannot reorder a fragment the code already glued together
`${t(I18N_KEYS.squads.thresholdLabel)}: ${String(squad.attendanceThresholdPct)}%`;
```

The gate compares the **placeholder set** of every key between `en` and `ar`, so a translation that
drops `{{count}}` fails the build rather than rendering a sentence with a hole in it.

## Plurals

Anything counted uses i18next plural suffixes on the declared base key. `I18N_KEYS` still declares
the base; the catalogs carry the family:

| Language | Required categories                                |
| -------- | -------------------------------------------------- |
| `en`     | `_one`, `_other`                                   |
| `ar`     | `_zero`, `_one`, `_two`, `_few`, `_many`, `_other` |

```json
"movementDelta_one": "{{count}} place",
"movementDelta_other": "{{count}} places"
```

```ts
t(I18N_KEYS.points.movementDelta, { count: Math.abs(row.rankDelta) });
```

The categories are read from ICU at gate time (`Intl.PluralRules`), not hard-coded, so adding a
language cannot silently ship the wrong set. English `(s)` suffixes are a defect: Arabic has six
plural forms and no way to express them with a parenthesis.

## Numbers, percentages, and dates

| Need                   | Owner                                         |
| ---------------------- | --------------------------------------------- |
| Counts, totals, ranks  | `formatNumber` from `@/packages/number`       |
| Signed deltas          | `formatSignedNumber`                          |
| Percentages (0–100 in) | `formatPercent`                               |
| Score lines            | `formatScorePair` (bidi-isolated)             |
| Dates, times, relative | `@/packages/date` (Africa/Cairo presentation) |

`Intl` and `toLocaleString`/`toLocaleDateString`/`toLocaleTimeString` are blocked by ESLint outside
those owners, so a hand-rolled format cannot creep back in.

## Stress-testing a layout

Neither `en` nor `ar` is the widest case a screen will meet. The pseudo-locale harness in
[`tests/unit/i18n/pseudo-locale.fixture.ts`](../../tests/unit/i18n/pseudo-locale.fixture.ts)
expands every string ~1.6x, accents the prose, and brackets both ends, leaving `{{placeholders}}`
untouched:

```ts
import enCatalog from '@/shared/i18n/locales/en.json';
import { rankByStress } from '../../tests/unit/i18n/pseudo-locale.fixture';

rankByStress(enCatalog).slice(0, 20); // the 20 strings most likely to clip
```

Use it to pick review targets: if the widest twenty render without clipping, wrapping, or a
truncated control, the catalog is layout-safe. This is a review aid, not a gate — jsdom cannot see
a clipped pixel, so a human confirms it.

## RTL checklist for a new screen

- [ ] No physical CSS (`margin-left`, `left:`, `text-align: left`) — logical properties only.
- [ ] SVG geometry that encodes reading order (a trend line, a bar chart) mirrors in RTL; polar
      charts do not.
- [ ] Any composed numeric run (`8 – 6`, `3 / 12`) goes through `@/packages/number` so it is
      bidi-isolated.
- [ ] The screen was opened in `ar` and the primary action is still where the eye lands first.

## The gates

| Gate                                                 | Command                   |
| ---------------------------------------------------- | ------------------------- |
| Catalog parity, plurals, placeholders, duplicates    | `npm run quality:locales` |
| Raw copy in JSX, raw vendor/Intl access              | `npm run lint`            |
| RTL journeys (`e2e-desktop-ar`, `@rtl`-tagged tests) | `npm run test:e2e`        |
| Mirrored-layout regressions                          | `npm run test:visual`     |

## Related

[terminology-glossary](terminology-glossary.md) · [rules/21-i18n-rtl](../../rules/21-i18n-rtl.md) ·
[rules/ui-ux-quality-mandate](../../rules/ui-ux-quality-mandate.md)
