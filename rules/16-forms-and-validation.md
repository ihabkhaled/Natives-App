# 16 — Forms and validation

> Authority: normative. Conflicts resolve in favor of ADRs and the security policy.

## Mandatory

- MUST build every form with `useAppForm` from `@/packages/forms`, which binds React Hook Form to a
  schema resolver and validates on `onTouched`.
- MUST define the form's contract as a Zod schema in the module's `schemas/*.schema.ts`, built with
  `schemaBuilder` from `@/packages/schema`.
- MUST write validation messages as i18n **keys**, not sentences: `min(1, I18N_KEYS.auth.validationEmailRequired)`.
- MUST translate those keys in the form hook, so the field component receives finished copy.
- MUST render fields through the shared UI primitives — `FormField`, `AppInput`, `PasswordInput` —
  so label association, error wiring, and touch-target sizing stay uniform.
- MUST re-validate on the server and treat the client schema as UX, not as a security control.
- MUST map a `validation` failure's `fieldErrors` back onto the matching form fields rather than
  showing one generic banner.

## Forbidden

- NEVER import `react-hook-form` or `@hookform/resolvers` outside `src/packages/forms`.
- NEVER write ad-hoc validation rules inline in a component or a `register` call — the schema is the
  single contract.
- NEVER put a translated sentence in a schema; a schema that contains English cannot be Arabic.
- NEVER trust client validation for anything that matters: it is a hint to the user, not a gate.

## Rationale

Validation lives in exactly two places or it lives in fifty: putting it in a schema means the same
contract drives typing, parsing, and messaging. Keeping messages as keys is what allows the same
schema to serve `en` and `ar` without a fork, and it keeps the locale catalogs the only place copy
is written. Mapping field errors from the API back onto fields is how a NestJS `errors[]` array
becomes a usable form instead of a shrug.

## Valid

```ts
// src/modules/auth/schemas/login-form.schema.ts
export const loginFormSchema = schemaBuilder.object({
  email: schemaBuilder
    .string()
    .min(1, I18N_KEYS.auth.validationEmailRequired)
    .pipe(schemaBuilder.email(I18N_KEYS.auth.validationEmailInvalid)),
  password: schemaBuilder.string().min(MIN_PASSWORD_LENGTH, I18N_KEYS.auth.validationPasswordMin),
});
```

## Invalid

```ts
// src/modules/auth/hooks/use-login-form.hook.ts
import { useForm } from 'react-hook-form'; // owner is @/packages/forms

export function useLoginForm() {
  return useForm({
    // hand-rolled rules, and an untranslatable English sentence
    resolver: undefined,
    defaultValues: { email: '', password: '' },
  });
}
```

## Enforcement

| Mechanism                                              | Command                             |
| ------------------------------------------------------ | ----------------------------------- |
| `architecture/no-raw-package-imports`                  | `npm run lint`                      |
| `architecture/no-third-party-hooks-outside-hook-files` | `npm run lint`                      |
| `architecture/no-raw-i18n-text`                        | `npm run lint`                      |
| `*.schema.ts` at 100% coverage                         | `npm run test:coverage:per-file`    |
| Every catalog key declared and present in `en`/`ar`    | `npm run quality:locales`           |
| Forms owner dirs match the registry                    | `npm run quality:package-ownership` |

Manual review where mechanical enforcement is impossible: the locale gate proves a key exists in
both catalogs, not that a schema message key is the _right_ one. A password rule pointing at the
email-invalid key passes every gate and confuses every user.

## Definition of done

- [ ] The form runs on `useAppForm` with a Zod schema and no inline rules.
- [ ] Every message is an `I18N_KEYS` reference, translated in the hook.
- [ ] Server field errors land on their fields; the schema is treated as UX only.

## Related

[21-i18n-rtl](21-i18n-rtl.md) · [19-accessibility](19-accessibility.md) ·
[17-error-handling](17-error-handling.md) ·
[../src/modules/ui-workbench/README.md](../src/modules/ui-workbench/README.md)
