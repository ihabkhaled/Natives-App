import { describe, expect, it } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';
import { I18N_KEYS } from '@/shared/i18n';

import { mapErrorCodeToI18nKey } from './error-i18n.mapper';

const CODES = Object.values(APP_ERROR_CODE);

describe('mapErrorCodeToI18nKey', () => {
  it.each(CODES)('maps %s to a key in the errors namespace', (code) => {
    expect(mapErrorCodeToI18nKey(code).startsWith('errors.')).toBe(true);
  });

  it('gives every code its own message', () => {
    const keys = CODES.map((code) => mapErrorCodeToI18nKey(code));

    expect(new Set(keys).size).toBe(keys.length);
  });

  it('maps transport and session codes to their catalog entries', () => {
    expect(mapErrorCodeToI18nKey(APP_ERROR_CODE.NetworkOffline)).toBe(I18N_KEYS.errors.network);
    expect(mapErrorCodeToI18nKey(APP_ERROR_CODE.SessionExpired)).toBe(
      I18N_KEYS.errors.sessionExpired,
    );
    expect(mapErrorCodeToI18nKey(APP_ERROR_CODE.DeepLinkRejected)).toBe(
      I18N_KEYS.errors.deepLinkRejected,
    );
  });
});
