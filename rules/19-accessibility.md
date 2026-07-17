# 19 — Accessibility

> Authority: normative. Conflicts resolve in favor of ADRs and the security policy.

## Mandatory

- MUST meet WCAG 2.2 AA for every shipped screen; accessibility is a functional requirement, not a
  polish pass.
- MUST give every interactive control an accessible name — visible text, `aria-label`, or a `label`
  associated through the shared `FormField`.
- MUST keep interactive targets at or above `MIN_TOUCH_TARGET_PX` (44 CSS px); the shared primitives
  encode this (`AppButton` ships `min-h-11`).
- MUST announce asynchronous state changes to assistive tech: `aria-busy` while pending, and
  `ARIA_LIVE.Polite` or `ARIA_LIVE.Assertive` regions for messages that appear without a navigation.
- MUST mark decorative content `aria-hidden="true"` — a spinner beside a label is not information.
- MUST keep the DOM order equal to the reading order, and MUST keep every route reachable and
  operable by keyboard alone.
- MUST express state through more than colour, and MUST verify contrast in both the light and dark
  themes the settings module can select.
- MUST apply `dir` at the document root from the active locale, so RTL is layout-driven rather than
  per-component.

## Forbidden

- NEVER put an interaction handler on a non-interactive element; use a button or a link.
- NEVER remove focus outlines without shipping an equally visible replacement.
- NEVER rely on placeholder text as a field's label.
- NEVER let a `data-testid` stand in for an accessible name — test ids are for tests, not for users.

## Rationale

Ionic's components are accessible by default and this app's own compositions are where that breaks:
a custom card that swallows a tap, a status badge whose only signal is colour, a toast that never
announces. Encoding the rules in `src/shared/ui` means correctness is inherited rather than
re-derived per screen, and the automated axe pass then guards the compositions those primitives form.

## Valid

```tsx
// src/shared/ui/button/button.component.tsx
<IonButton
  disabled={isDisabled}
  aria-busy={props.loading === true ? 'true' : undefined}
  className="min-h-11"
>
  {props.loading === true ? <IonSpinner slot="start" name="crescent" aria-hidden="true" /> : null}
  {props.label}
</IonButton>
```

## Invalid

```tsx
// src/modules/ui-workbench/components/workbench-states/workbench-states.component.tsx
<div onClick={props.onRetry} className="h-6">
  {' '}
  {/* non-interactive element, 24px target */}
  <IonSpinner /> {/* decorative, unhidden, and the only signal that anything is loading */}
</div>
```

## Enforcement

| Mechanism                                                | Command             |
| -------------------------------------------------------- | ------------------- |
| `jsx-a11y` recommended rule set on every `.tsx`          | `npm run lint`      |
| axe-core scans driven through Playwright                 | `npm run test:a11y` |
| Keyboard and RTL journeys (the `@rtl` project runs `ar`) | `npm run test:e2e`  |
| Rendered-name assertions in component tests              | `npm run test:unit` |

Manual review where mechanical enforcement is impossible: most of it. Automated axe checks catch
roughly a third of WCAG failures — they cannot judge whether a label is meaningful, whether focus
order tells a coherent story, or whether an announcement arrives at a useful moment. Screen-reader
and keyboard-only passes on new screens are a human obligation.

## Definition of done

- [ ] Every new control has a name, a 44px target, and a keyboard path.
- [ ] Async and error states announce themselves; decorative nodes are hidden.
- [ ] The screen was driven once by keyboard, and once with a screen reader, in `en` and `ar`.

## Related

[03-components](03-components.md) · [21-i18n-rtl](21-i18n-rtl.md) ·
[16-forms-and-validation](16-forms-and-validation.md) ·
[../src/modules/ui-workbench/README.md](../src/modules/ui-workbench/README.md)
