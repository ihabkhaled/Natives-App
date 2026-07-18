import { describe, expect, it, vi } from 'vitest';

import type { FormFieldBinding } from './forms.types';
import { translateFieldError } from './translate-field-error.helper';

const baseBinding: FormFieldBinding = {
  name: 'email',
  value: '',
  onChange: () => undefined,
  onBlur: () => undefined,
  errorMessage: undefined,
};

describe('translateFieldError', () => {
  it('returns the binding unchanged when there is no error', () => {
    const translate = vi.fn((message: string) => `t:${message}`);

    const result = translateFieldError(baseBinding, translate);

    expect(result).toBe(baseBinding);
    expect(translate).not.toHaveBeenCalled();
  });

  it('translates the error message key when present', () => {
    const result = translateFieldError(
      { ...baseBinding, errorMessage: 'auth.validationEmailRequired' },
      (message) => `t:${message}`,
    );

    expect(result.errorMessage).toBe('t:auth.validationEmailRequired');
  });
});
