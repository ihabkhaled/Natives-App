import { describe, expect, it } from 'vitest';

import { I18N_KEYS } from '@/shared/i18n';

import { contactFormSchema } from './contact-form.schema';

const VALID = { email: 'player@example.com', subject: 'Tryout question', message: 'Hello there!' };

describe('contactFormSchema', () => {
  it('accepts a fully valid request', () => {
    expect(contactFormSchema.safeParse(VALID).success).toBe(true);
  });

  it('trims and requires an email', () => {
    const empty = contactFormSchema.safeParse({ ...VALID, email: '   ' });
    expect(empty.success).toBe(false);
    expect(empty.error?.issues[0]?.message).toBe(I18N_KEYS.contact.validationEmailRequired);
  });

  it('rejects a malformed email', () => {
    const result = contactFormSchema.safeParse({ ...VALID, email: 'not-an-email' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(I18N_KEYS.contact.validationEmailInvalid);
  });

  it('rejects an email over 254 characters', () => {
    const longEmail = `${'a'.repeat(250)}@x.co`;
    const result = contactFormSchema.safeParse({ ...VALID, email: longEmail });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(I18N_KEYS.contact.validationEmailTooLong);
  });

  it('rejects a subject under 3 characters after trimming', () => {
    const result = contactFormSchema.safeParse({ ...VALID, subject: ' hi ' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(I18N_KEYS.contact.validationSubjectTooShort);
  });

  it('rejects a subject over 160 characters', () => {
    const result = contactFormSchema.safeParse({ ...VALID, subject: 'a'.repeat(161) });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(I18N_KEYS.contact.validationSubjectTooLong);
  });

  it('rejects a message under 10 characters after trimming', () => {
    const result = contactFormSchema.safeParse({ ...VALID, message: ' too short ' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(I18N_KEYS.contact.validationMessageTooShort);
  });

  it('rejects a message over 4000 characters', () => {
    const result = contactFormSchema.safeParse({ ...VALID, message: 'a'.repeat(4001) });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(I18N_KEYS.contact.validationMessageTooLong);
  });

  it('accepts the exact boundary lengths', () => {
    const result = contactFormSchema.safeParse({
      ...VALID,
      subject: 'a'.repeat(3),
      message: 'a'.repeat(10),
    });
    expect(result.success).toBe(true);
  });
});
