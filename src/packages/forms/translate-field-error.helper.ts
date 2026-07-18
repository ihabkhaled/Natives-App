import type { FormFieldBinding } from './forms.types';

/**
 * Replace a field binding's i18n error KEY with translated copy. Schema
 * validation stores message keys; this resolves them just before the UI
 * renders, so components never see raw keys.
 */
export function translateFieldError(
  binding: FormFieldBinding,
  translate: (message: string) => string,
): FormFieldBinding {
  return binding.errorMessage === undefined
    ? binding
    : { ...binding, errorMessage: translate(binding.errorMessage) };
}
