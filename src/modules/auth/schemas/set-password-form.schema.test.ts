import { describe, expect, it } from 'vitest';

import { safeParseWithSchema } from '@/packages/schema';
import { I18N_KEYS } from '@/shared/i18n';

import { setPasswordFormSchema } from './set-password-form.schema';

const STRONG = 'Ranger#Strong1234';

function parse(values: { password: string; confirmPassword: string }) {
  return safeParseWithSchema(setPasswordFormSchema, values);
}

function firstMessageFor(
  values: { password: string; confirmPassword: string },
  field: string,
): string | undefined {
  const result = parse(values);
  if (result.success) {
    return undefined;
  }
  return result.issues.find((issue) => issue.path === field)?.message;
}

describe('setPasswordFormSchema', () => {
  it('accepts a strong, matching password', () => {
    expect(parse({ password: STRONG, confirmPassword: STRONG }).success).toBe(true);
  });

  it('rejects a password shorter than the minimum', () => {
    expect(firstMessageFor({ password: 'Short1a', confirmPassword: 'Short1a' }, 'password')).toBe(
      I18N_KEYS.auth.validationPasswordWeak,
    );
  });

  it('rejects a password missing a required character class', () => {
    expect(
      firstMessageFor(
        { password: 'alllowercase1234', confirmPassword: 'alllowercase1234' },
        'password',
      ),
    ).toBe(I18N_KEYS.auth.validationPasswordWeak);
    expect(
      firstMessageFor(
        { password: 'NoDigitsHereAtAll', confirmPassword: 'NoDigitsHereAtAll' },
        'password',
      ),
    ).toBe(I18N_KEYS.auth.validationPasswordWeak);
  });

  it('requires the confirmation field', () => {
    expect(firstMessageFor({ password: STRONG, confirmPassword: '' }, 'confirmPassword')).toBe(
      I18N_KEYS.auth.validationConfirmRequired,
    );
  });

  it('rejects a mismatched confirmation', () => {
    expect(
      firstMessageFor({ password: STRONG, confirmPassword: `${STRONG}x` }, 'confirmPassword'),
    ).toBe(I18N_KEYS.auth.validationPasswordsMismatch);
  });
});
