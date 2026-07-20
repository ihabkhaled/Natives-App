import { describe, expect, it } from 'vitest';

import {
  buildRegistrationResultView,
  canSubmitRegistration,
  EMPTY_REGISTRATION_DRAFT,
  fieldError,
  isBirthYearValid,
  isEmailValid,
  isNameValid,
  orNull,
  parseBirthYear,
  type RegistrationDraft,
} from './registration-form.helper';

const t = (key: string): string => key;

function draft(overrides: Partial<RegistrationDraft> = {}): RegistrationDraft {
  return {
    ...EMPTY_REGISTRATION_DRAFT,
    tryoutId: 'tryout-1',
    fullName: 'Sara Nabil',
    email: 'sara@example.test',
    consentGiven: true,
    ...overrides,
  };
}

describe('field validation', () => {
  it('requires a non-blank name', () => {
    expect(isNameValid('   ')).toBe(false);
    expect(isNameValid('Sara')).toBe(true);
  });

  it('accepts a plausible address and rejects the usual malformed shapes', () => {
    expect(isEmailValid('sara@example.test')).toBe(true);
    expect(isEmailValid('sara@example')).toBe(false);
    expect(isEmailValid('sara.example.test')).toBe(false);
    expect(isEmailValid('a@b@c.test')).toBe(false);
    expect(isEmailValid('@example.test')).toBe(false);
  });

  it('treats an empty birth year as valid because the field is optional', () => {
    expect(isBirthYearValid('')).toBe(true);
    expect(parseBirthYear('  ')).toBeNull();
  });

  it('rejects an implausible birth year rather than coercing it', () => {
    expect(isBirthYearValid('12')).toBe(false);
    expect(isBirthYearValid('2400')).toBe(false);
    expect(isBirthYearValid('not-a-year')).toBe(false);
  });

  it('parses a plausible birth year', () => {
    expect(isBirthYearValid('2001')).toBe(true);
    expect(parseBirthYear('2001')).toBe(2001);
  });
});

describe('orNull', () => {
  it('sends an untouched optional field as null, never an empty string', () => {
    expect(orNull('   ')).toBeNull();
    expect(orNull(' 0100 ')).toBe('0100');
  });
});

describe('canSubmitRegistration', () => {
  it('refuses without consent, however complete the rest is', () => {
    expect(canSubmitRegistration(draft({ consentGiven: false }))).toBe(false);
  });

  it('refuses without a chosen event', () => {
    expect(canSubmitRegistration(draft({ tryoutId: '' }))).toBe(false);
  });

  it('refuses on an invalid email or name', () => {
    expect(canSubmitRegistration(draft({ email: 'nope' }))).toBe(false);
    expect(canSubmitRegistration(draft({ fullName: '' }))).toBe(false);
  });

  it('refuses on an implausible birth year', () => {
    expect(canSubmitRegistration(draft({ birthYear: '12' }))).toBe(false);
  });

  it('accepts a complete, consented registration', () => {
    expect(canSubmitRegistration(draft())).toBe(true);
  });
});

describe('fieldError', () => {
  it('stays quiet until the candidate has typed something', () => {
    expect(fieldError(t, '', false, 'tryouts.validationEmailInvalid')).toBeNull();
  });

  it('surfaces the message once a typed value is invalid', () => {
    expect(fieldError(t, 'nope', false, 'tryouts.validationEmailInvalid')).toBe(
      'tryouts.validationEmailInvalid',
    );
  });

  it('stays quiet for a valid typed value', () => {
    expect(fieldError(t, 'sara@example.test', true, 'tryouts.validationEmailInvalid')).toBeNull();
  });
});

describe('buildRegistrationResultView', () => {
  it('renders nothing before the candidate has submitted', () => {
    expect(buildRegistrationResultView(t, null)).toBeNull();
  });

  it('reports each outcome with its own copy', () => {
    const registered = buildRegistrationResultView(t, {
      outcome: 'registered',
      reference: 'UN-1',
      consentVersion: 'v1',
    });
    const waitlisted = buildRegistrationResultView(t, {
      outcome: 'waitlisted',
      reference: null,
      consentVersion: 'v1',
    });
    const duplicate = buildRegistrationResultView(t, {
      outcome: 'duplicate',
      reference: null,
      consentVersion: 'v1',
    });

    expect(registered?.title).toBe('tryouts.registeredTitle');
    expect(registered?.reference).toBe('UN-1');
    expect(waitlisted?.title).toBe('tryouts.waitlistedTitle');
    expect(duplicate?.title).toBe('tryouts.duplicateTitle');
    expect(duplicate?.reference).toBeNull();
  });
});
