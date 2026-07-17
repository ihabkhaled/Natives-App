# Skill: Prove accessibility

**Use when:** a screen is added or its states change — axe is a gate, not a suggestion.

## Required reading

- [rules/19 — Accessibility](../rules/19-accessibility.md) — the WCAG 2.2 AA obligations.
- [a11y.spec.ts](../tests/accessibility/a11y.spec.ts) — the eight checks that run today.
- [accessibility.constants.ts](../src/shared/accessibility/accessibility.constants.ts) —
  `MIN_TOUCH_TARGET_PX` and `ARIA_LIVE`.
- [visual.spec.ts](../tests/visual/visual.spec.ts) — the light, dark and RTL snapshots.
- [status-view.component.tsx](../src/shared/ui/status-view/status-view.component.tsx) — the
  primitive behind every empty/error/offline/permission state.

## Preconditions

- [ ] The screen is reachable via `APP_ROUTES` and `gotoApp` — see
      [playwright-test](playwright-test.md).
- [ ] Its copy exists in `en` **and** `ar`; RTL is scanned, so a missing catalog entry fails here.
- [ ] Its error and empty states can be triggered deterministically.

## Files

```text
tests/accessibility/a11y.spec.ts    edit: add the screen and its states
tests/visual/visual.spec.ts         edit: add a snapshot if layout matters
src/shared/ui/**                    edit: fix the primitive, not the screen, when it is shared
```

## Steps

1. Add a test to `tests/accessibility/a11y.spec.ts` using the shared `analyze(page)` helper —
   `new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()` with
   `['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']`.
2. Assert zero violations, not "fewer": `expect((await analyze(page)).violations).toEqual([])`. The
   empty-array form prints the offending nodes when it fails, which is why it beats a length check.
3. **Scan every state, not just the happy one.** The login test scans the clean screen, then fills
   an invalid email, submits, waits for `'Enter a valid email address.'`, and scans **again**. Error
   states are where labels and live regions break.
4. **Scan dark.** Click `ion-segment-button[value="dark"]` inside `TEST_IDS.settingsThemeSelect`,
   wait for `expect(page.locator('html')).toHaveClass(/ion-palette-dark/u)`, then analyze. Contrast
   regressions live in the palette, not the markup.
5. **Scan RTL.** Click `ion-segment-button[value="ar"]` inside `TEST_IDS.settingsLocaleSelect`, wait
   for `toHaveAttribute('dir', 'rtl')`, then analyze.
6. **Check touch targets.** Measure rather than eyeball:
   `const box = await submit.boundingBox(); expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);` —
   44 is `MIN_TOUCH_TARGET_PX`.
7. **Fix the cause, at the right level.** A violation in `ErrorState` is a `src/shared/ui` fix that
   repairs every screen at once. A violation in one module's component is a module fix. Never fix by
   suppressing an axe rule.
8. Assert semantics in unit tests too, where they are cheap: `getByRole('heading', { level: 2 })`
   for a `StatusView` title, `toHaveAttribute('role', 'alert')` for an error note, `aria-busy` on a
   submitting button. See [hook-test](hook-test.md).
9. Add a visual snapshot when the layout carries meaning — the config allows a `0.02` diff ratio and
   disables animations.

## Tests

- The eight standing checks: welcome, login (clean **and** error), settings, workbench,
  authenticated home, dark contrast, Arabic RTL, and the 44px target. A new screen earns at least
  one, plus its error state.
- Run: `npm run test:a11y`, or one file with `npx playwright test tests/accessibility/a11y.spec.ts`.
- Snapshots: `npm run test:visual`; refresh deliberately with
  `npx playwright test tests/visual --update-snapshots`.

## Security / accessibility / native considerations

- Axe finds roughly the machine-checkable half. Keyboard order, focus management after navigation,
  and whether a screen reader announcement makes sense are **manual** checks — do them and say you
  did, rather than implying axe covered them.
- `jsx-a11y` runs at lint time on every `.tsx`; it catches a different class of defect earlier.
- Ionic supplies much of the semantics — but only when `setupIonicReact()` has run, which
  `start-app.ts` guarantees in the real app.

## Documentation delta

- `rules/19` if an obligation or the tag set changes.
- The visual snapshot files, committed, when the layout intentionally changes.

## Validation

```bash
npm run test:a11y
npm run test:visual
npm run lint
npm run quality:locales
```

## Forbidden shortcuts

- Disabling an axe rule to go green — the violation is the product's, not axe's.
- Scanning only the default state — the error state is exactly where the defects are.
- `aria-label` sprinkled onto everything — it overrides real content and often makes things worse.
- Skipping the RTL scan because "Arabic is just a mirror" — direction affects focus order and
  layout.
- Claiming WCAG conformance from a green axe run — say "no axe violations at WCAG 2.2 AA tags".

## Definition of done

- [ ] The screen is scanned clean, in its error state, in dark, and in RTL.
- [ ] Violations are zero, fixed at the shared primitive where the primitive is at fault.
- [ ] Interactive targets measure at least 44px.
- [ ] Manual keyboard and focus checks were performed and reported as manual.
- [ ] `npm run test:a11y` and `npm run test:visual` pass.
