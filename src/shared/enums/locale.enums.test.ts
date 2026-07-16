import { describe, expect, it } from 'vitest';

import { APP_LOCALE, APP_LOCALES } from './locale.enums';

describe('APP_LOCALE', () => {
  it('pins the supported locale codes', () => {
    expect(APP_LOCALE).toEqual({ English: 'en', Arabic: 'ar' });
  });

  it('derives the locale list from the map', () => {
    expect(APP_LOCALES).toEqual(['en', 'ar']);
  });

  it('keeps the derived list in sync with the map', () => {
    expect([...APP_LOCALES].sort()).toEqual(Object.values(APP_LOCALE).sort());
  });
});
