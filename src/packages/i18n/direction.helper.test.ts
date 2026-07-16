import { describe, expect, it } from 'vitest';

import { localeToDirection } from './direction.helper';

describe('localeToDirection', () => {
  it.each(['ar', 'he', 'fa', 'ur'])('maps the %s language to rtl', (locale) => {
    expect(localeToDirection(locale)).toBe('rtl');
  });

  it.each(['en', 'fr', 'de', 'tr'])('maps the %s language to ltr', (locale) => {
    expect(localeToDirection(locale)).toBe('ltr');
  });

  it('ignores the region subtag', () => {
    expect(localeToDirection('ar-EG')).toBe('rtl');
    expect(localeToDirection('en-US')).toBe('ltr');
  });

  it('is case-insensitive', () => {
    expect(localeToDirection('AR-EG')).toBe('rtl');
    expect(localeToDirection('AR')).toBe('rtl');
    expect(localeToDirection('EN')).toBe('ltr');
  });

  it('falls back to ltr for an empty locale', () => {
    expect(localeToDirection('')).toBe('ltr');
  });

  it('does not treat an rtl code as a prefix of another language', () => {
    expect(localeToDirection('arn')).toBe('ltr');
    expect(localeToDirection('urdu')).toBe('ltr');
  });
});
