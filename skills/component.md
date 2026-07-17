# Skill: Add a presentational component

**Use when:** you need new UI that renders values it is handed and raises callbacks.

## Required reading

- [rules/03 — Components](../rules/03-components.md) — the props-in/JSX-out contract.
- [ADR 0002 — UI-only components](../architecture/adrs/0002-ui-only-components.md) — why components
  may not think.
- [docs/eslint/no-hooks-in-components](../docs/eslint/no-hooks-in-components.md) — the rule that
  catches the usual mistake.
- [Health status card](../src/modules/health/components/health-status-card/) — a component folder
  with loading, error and ready branches and zero logic.

## Preconditions

- [ ] A hook already produces the view model, or you are writing it next — see [hook](hook.md).
- [ ] The component is feature-specific. Anything reusable across modules belongs in
      `src/shared/ui/` beside `AppButton`, `ErrorState`, `PageShell`.
- [ ] Every string it renders arrives already translated. Components never call `t()`.

## Files

```text
src/modules/<module>/components/<thing>-card/
  <thing>-card.component.tsx    the single component
  <thing>-card.types.ts         props (usually an alias of the hook's view type)
  <thing>-card.constants.ts     test ids drawn from TEST_IDS
  index.ts                      folder surface
```

## Steps

1. Create the folder named exactly like the component file stem —
   `architecture/require-component-folder` fails on a bare `foo.component.tsx`.
2. Declare props in `<thing>-card.types.ts`. Prefer aliasing the hook view, as
   `health-status-card.types.ts` does: `export type HealthStatusCardProps = HealthCardView;`. A type
   alias inside the `.component.tsx` trips `architecture/no-types-outside-type-files`.
3. Add `<thing>-card.constants.ts` mapping `TEST_IDS` entries to local names, mirroring
   `HEALTH_CARD_TEST_IDS`. Add the ids to `src/shared/config/test-ids.constants.ts` first — a
   literal `data-testid` fails `architecture/no-inline-test-ids`.
4. Write the component as a single named `export function` returning `React.JSX.Element`. Ionic
   primitives come from `@/packages/ionic` only
   (`architecture/no-direct-ionic-import-outside-owner`); shared primitives from `@/shared/ui`.
5. Branch with ternaries returning JSX, never with `if`/`for` statements in the body —
   `architecture/no-inline-component-logic`. Health renders
   `{props.isLoading ? <LoadingState … /> : null}` and gates the ready branch on
   `!props.isLoading && props.errorMessage === undefined`.
6. Render errors as the prepared `errorMessage` string. Passing an `Error` into JSX trips
   `architecture/no-unsafe-error-display`.
7. Export from `index.ts`: the component and its props type. One component per file
   (`architecture/one-component-per-file`); named exports only
   (`architecture/no-default-export-in-app-source`).

## Tests

- `<thing>-card.component.test.tsx`, colocated. Build props with a `buildProps(overrides)` factory
  and plain `render` from `@testing-library/react` — no providers are needed because there are no
  hooks.
- Prove: each state renders alone (loading hides status and error), precedence (loading beats a
  stale error), and that callbacks fire once.
- jsdom facts: Ionic boolean props are DOM properties, so assert
  `expect(button).toHaveProperty('disabled', true)`; `ion-button` has no implicit ARIA role, so
  click it via `getByTestId` or `getByText`, not `getByRole`.
- Run: `npx vitest run --project unit src/modules/<module>/components`.

## Security / accessibility / native considerations

- Interactive targets must clear `MIN_TOUCH_TARGET_PX` (44) from `@/shared/accessibility`.
- Error notes carry `role="alert"`; busy buttons carry `aria-busy` — see `login-form.component.tsx`.
- Icons come from `@/packages/icons`; a decorative icon needs no label, a meaningful one does.

## Documentation delta

- The module README's public-surface table, if the component is exported from `index.ts`.
- None otherwise: internal components are an implementation detail.

## Validation

```bash
npm run lint
npm run quality:filenames
npx vitest run --project unit src/modules/<module>/components
npm run test:a11y
```

## Forbidden shortcuts

- Calling `useState`/`useAppTranslation` "just for this one string" —
  `architecture/no-hooks-in-components` and `architecture/no-built-in-hooks-outside-hook-files`.
- Hard-coding English copy — `architecture/no-raw-i18n-text`.
- A second small component in the same file — `architecture/one-component-per-file`.
- Importing `@ionic/react` directly — `architecture/no-direct-ionic-import-outside-owner`.

## Definition of done

- [ ] The component body is JSX plus ternaries; no statements, no hooks, no `t()`.
- [ ] Props, constants, and the component live in their own files inside the named folder.
- [ ] Test ids resolve through `TEST_IDS`; new ids are declared centrally.
- [ ] Every branch is covered; the file clears the 95% per-file threshold.
- [ ] `npm run lint` and `npx vitest run --project unit` pass.
