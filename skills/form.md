# Skill: Add a form

**Use when:** the user must enter and submit validated input.

## Required reading

- [rules/16 — Forms and validation](../rules/16-forms-and-validation.md) — schema-only validation
  through the forms owner.
- [rules/21 — i18n and RTL](../rules/21-i18n-rtl.md) — why validation messages are keys, not copy.
- [login-form.schema.ts](../src/modules/auth/schemas/login-form.schema.ts) — a schema whose messages
  are `I18N_KEYS` values.
- [use-login-form.hook.ts](../src/modules/auth/hooks/use-login-form.hook.ts) — bindings plus
  translation of field errors.
- [workbench-form.schema.ts](../src/modules/ui-workbench/schemas/workbench-form.schema.ts) — a
  second, smaller instance of the same pattern.

## Preconditions

- [ ] The field list and their rules are known, including cross-field rules.
- [ ] Every message has an `I18N_KEYS` entry with `en` and `ar` copy — see [i18n-key](i18n-key.md).
- [ ] The submit target exists — usually a mutation ([mutation](mutation.md)).

## Files

```text
src/modules/<module>/schemas/<thing>-form.schema.ts     Zod schema; messages are i18n keys
src/modules/<module>/types/<module>.types.ts            edit: the form values interface
src/modules/<module>/hooks/use-<thing>-form.hook.ts     bindings + translated errors
src/modules/<module>/components/<thing>-form/           the presentational form
```

## Steps

1. **Schema.** Build with `schemaBuilder` from `@/packages/schema`. Pass an i18n **key** as each
   message: `.min(1, I18N_KEYS.auth.validationEmailRequired)` and
   `.pipe(schemaBuilder.email(I18N_KEYS.auth.validationEmailInvalid))`. Literal English here would
   bypass `ar` entirely; the file comment in `login-form.schema.ts` states the contract.
2. Hoist magic numbers: `const MIN_PASSWORD_LENGTH = 8;` then `.min(MIN_PASSWORD_LENGTH, …)`.
3. **Values type.** Add `LoginFormValues` to the module's `types/*.types.ts` —
   `architecture/no-interfaces-outside-interface-files` keeps it out of the hook.
4. **Form hook.** `useAppForm<LoginFormValues>({ schema, defaultValues })` from `@/packages/forms`.
   It installs the standard-schema resolver and `mode: 'onTouched'`; importing `react-hook-form`
   yourself fails `architecture/no-raw-package-imports`.
5. **Bindings.** One `useAppFormField({ control: form.control, name: 'email' })` per field. It
   returns a `FormFieldBinding`: `{ name, value, onChange, onBlur, errorMessage }`.
6. **Translate the errors.** `errorMessage` arrives as a key, so map it before returning — the
   private `translateFieldError(binding, translate)` helper in `use-login-form.hook.ts` does exactly
   this. Take `translate` as an option so the hook stays testable.
7. **Submit.** Wrap RHF's handler so the component hands over a plain event:

   ```ts
   onSubmit: (event) => {
     void form.handleSubmit((values) => {
       options.onValidSubmit(values);
     })(event);
   };
   ```

8. **Component.** Render `FormField` / `AppInput` / `AppPasswordInput` from `@/shared/ui` and wire
   `binding.onChange` — the shared inputs already translate Ionic's `ionInput` into a string
   callback. The component receives labels; it never calls `t()`.

## Tests

- `<thing>-form.schema.test.ts` — a pure file at 100%. Prove each rule fails with the exact **key**
  (`expect(issues[0].message).toBe(I18N_KEYS.auth.validationEmailInvalid)`), and that a valid object
  parses.
- `use-<thing>-form.hook.test.ts` — pass a fake `translate`, assert `errorMessage` is translated
  copy and `onValidSubmit` fires only for valid values.
- `<thing>-form.component.test.tsx` — drive Ionic inputs with `fireIonInput(element, 'value')` from
  `tests/setup/ionic-events.helper.ts`; `fireEvent.change` does nothing to an `ion-input`. Assert
  the submit button with `toHaveProperty('disabled', true)` and
  `toHaveAttribute('aria-busy', 'true')`.
- E2E fills through `fillIonInput(page, TEST_IDS.loginEmailInput, value)` — see
  [playwright-test](playwright-test.md).
- Run: `npx vitest run --project unit src/modules/<module>`.

## Security / accessibility / native considerations

- Password fields use `AppPasswordInput`; the reveal toggle is state in the hook
  (`passwordRevealed`), never in the component.
- Error notes need `role="alert"` and must be reachable — `tests/accessibility/a11y.spec.ts`
  axe-scans the login screen **in its error state** precisely for this.
- Never log or track submitted values. Validation is client convenience; the server revalidates.

## Documentation delta

- `src/shared/i18n/i18n-keys.constants.ts` and both locale catalogs gain the message keys.
- The module README's invariants — auth records that "validation messages are i18n keys; hooks
  translate them".

## Validation

```bash
npm run quality:locales
npx vitest run --project unit src/modules/<module>
npm run test:a11y
npm run test:e2e
```

## Forbidden shortcuts

- `required` / `pattern` props on the input — validation has one home, the schema.
- English strings inside the schema — `npm run quality:locales` will not catch it, but `ar` users
  will.
- `useForm` imported directly — `architecture/no-raw-package-imports`.
- Translating inside the component so the schema can stay English — `architecture/no-raw-i18n-text`.

## Definition of done

- [ ] Validation lives only in the schema; every message is an `I18N_KEYS` value.
- [ ] The hook returns translated bindings; the component renders them.
- [ ] `en.json` and `ar.json` both carry every message; `npm run quality:locales` passes.
- [ ] Component tests drive `ionInput`, not `change`.
- [ ] `npm run test:a11y` passes for the screen's error state.
