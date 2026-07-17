# Accessibility reviewer

## Purpose

Read a change for the users axe cannot speak for. Automated scanning catches roughly the mechanical
half of WCAG — missing labels, contrast, bad ARIA. It cannot tell whether focus went somewhere
sensible, whether an error is announced, or whether the Arabic layout is mirrored rather than merely
translated. This lens covers that half.

## What it checks

- **Names and roles.** Every interactive element has an accessible name; icon-only controls carry a
  translated label, not a `title`.
- **Focus.** Visible, ordered, and moved deliberately — into a dialog, back to the trigger on close,
  to the first invalid field on submit. Nothing is reachable by pointer only.
- **Errors.** Announced and associated with their field. `form-field.component.tsx` owns the
  association; the hook owns the copy.
- **Live regions.** Async outcomes — a toast, the offline banner, a retry — reach a screen reader,
  not only the eye.
- **RTL, not just translation.** Direction is derived centrally from locale and applied to the
  document root; check logical properties over `left`/`right`, and mirrored chevrons.
- **Targets.** 44px minimum, already asserted in `tests/accessibility/a11y.spec.ts`.
- **Copy.** From `I18N_KEYS`, present in both `en.json` and `ar.json`.
- **Contrast in both palettes.** Dark mode is a separate surface with separate failures.

## The questions it asks

- Can this be operated with a keyboard alone, from the first tab stop?
- When this fails, what does a screen-reader user hear — and when?
- Where does focus go after this action, and is that where the user is looking?
- Does this read correctly in Arabic, or only translate correctly?
- Is this color the only thing carrying the meaning?

## Commands it runs

```bash
npm run test:a11y        # axe: welcome, login (+error), settings, workbench, home,
                         # dark palette, Arabic RTL, and target size
npm run quality:locales  # en/ar key-tree parity; no orphan copy
npm run test:visual      # includes the Arabic RTL settings snapshot
```

`npm run test:e2e` also carries `@rtl`-tagged specs in a dedicated Arabic project. A passing axe run
is a floor, not a pass — walk the change with a keyboard.

## What it defers to

- **Normative:** [rule 19](../rules/19-accessibility.md) and [rule 21](../rules/21-i18n-rtl.md).
- **[ADR 0002](../architecture/adrs/0002-ui-only-components.md)** — copy is translated in the hook,
  so a component receiving a raw string is an architecture finding as much as an a11y one;
  **[ADR 0012](../architecture/adrs/0012-error-normalization.md)** for error-copy provenance.
- **`architecture/no-raw-i18n-text`** already rejects hardcoded JSX text; do not re-report lint.
- **The testing reviewer** for coverage of new states; **the source and the axe output** over any
  assertion on this page.
