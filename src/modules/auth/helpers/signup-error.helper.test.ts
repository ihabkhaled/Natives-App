import { describe, expect, it } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';
import { I18N_KEYS } from '@/shared/i18n';
import { mapErrorCodeToI18nKey } from '@/shared/mappers';

import { mapSignupErrorToI18nKey } from './signup-error.helper';

const OTHER_CODES = Object.values(APP_ERROR_CODE).filter(
  (code) => code !== APP_ERROR_CODE.Conflict,
);

describe('mapSignupErrorToI18nKey', () => {
  it('words a 409 as an already-registered email rather than a generic conflict', () => {
    expect(mapSignupErrorToI18nKey(APP_ERROR_CODE.Conflict)).toBe(I18N_KEYS.signup.emailTaken);
    expect(mapSignupErrorToI18nKey(APP_ERROR_CODE.Conflict)).not.toBe(I18N_KEYS.errors.conflict);
  });

  it.each(OTHER_CODES)('delegates %s to the shared error catalog', (code) => {
    expect(mapSignupErrorToI18nKey(code)).toBe(mapErrorCodeToI18nKey(code));
  });
});
