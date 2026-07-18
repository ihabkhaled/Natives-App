import { describe, expect, it } from 'vitest';

import { safeParseWithSchema } from '@/packages/schema';
import { I18N_KEYS } from '@/shared/i18n';

import { forgotPasswordFormSchema } from './forgot-password-form.schema';

function firstMessage(email: string): string | undefined {
  const result = safeParseWithSchema(forgotPasswordFormSchema, { email });
  return result.success ? undefined : result.issues[0]?.message;
}

describe('forgotPasswordFormSchema', () => {
  it('accepts a valid email address', () => {
    expect(safeParseWithSchema(forgotPasswordFormSchema, { email: 'user@example.com' })).toEqual({
      success: true,
      data: { email: 'user@example.com' },
    });
  });

  it('flags a missing email with the required key', () => {
    expect(firstMessage('')).toBe(I18N_KEYS.auth.validationEmailRequired);
  });

  it('flags a malformed email with the invalid key', () => {
    expect(firstMessage('not-an-email')).toBe(I18N_KEYS.auth.validationEmailInvalid);
  });
});
