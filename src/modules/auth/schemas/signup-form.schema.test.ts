import { describe, expect, it } from 'vitest';

import { safeParseWithSchema } from '@/packages/schema';
import { I18N_KEYS } from '@/shared/i18n';

import type { SignupFormValues } from '../types/signup.types';
import { signupFormSchema } from './signup-form.schema';

const VALID: SignupFormValues = {
  displayName: 'Nadia Newcomer',
  email: 'nadia@example.com',
  password: 'Ranger#Strong1234',
};

function parse(overrides: Partial<SignupFormValues>) {
  return safeParseWithSchema(signupFormSchema, { ...VALID, ...overrides });
}

function messageFor(overrides: Partial<SignupFormValues>): string | undefined {
  const result = parse(overrides);
  return result.success ? undefined : result.issues[0]?.message;
}

describe('signupFormSchema', () => {
  it('accepts a complete, policy-compliant request', () => {
    expect(parse({})).toEqual({ success: true, data: VALID });
  });

  it('trims surrounding whitespace off the identity fields', () => {
    const result = parse({ displayName: '  Nadia Newcomer  ', email: ' nadia@example.com ' });

    expect(result.success && result.data.displayName).toBe('Nadia Newcomer');
    expect(result.success && result.data.email).toBe('nadia@example.com');
  });

  it('requires a display name', () => {
    expect(messageFor({ displayName: '   ' })).toBe(I18N_KEYS.signup.validationNameRequired);
  });

  it('rejects a display name past the backend 120-character ceiling', () => {
    expect(messageFor({ displayName: 'n'.repeat(121) })).toBe(
      I18N_KEYS.signup.validationNameTooLong,
    );
  });

  it('requires an email', () => {
    expect(messageFor({ email: '' })).toBe(I18N_KEYS.auth.validationEmailRequired);
  });

  it('rejects a malformed email', () => {
    expect(messageFor({ email: 'nadia-at-example' })).toBe(I18N_KEYS.auth.validationEmailInvalid);
  });

  it('rejects an email past the backend 320-character ceiling', () => {
    expect(messageFor({ email: `${'n'.repeat(315)}@e.com` })).toBe(
      I18N_KEYS.signup.validationEmailTooLong,
    );
  });

  it('rejects a password shorter than the 12-character policy', () => {
    expect(messageFor({ password: 'Short1pass' })).toBe(I18N_KEYS.auth.validationPasswordWeak);
  });

  it('rejects a password past the backend 72-character ceiling', () => {
    expect(messageFor({ password: `Aa1${'x'.repeat(70)}` })).toBe(
      I18N_KEYS.signup.validationPasswordTooLong,
    );
  });

  it.each([
    ['no lower-case', 'RANGERSTRONG1234'],
    ['no upper-case', 'rangerstrong1234'],
    ['no digit', 'RangerStrongPass'],
  ])('rejects a password with %s', (_label, password) => {
    expect(messageFor({ password })).toBe(I18N_KEYS.auth.validationPasswordWeak);
  });
});
