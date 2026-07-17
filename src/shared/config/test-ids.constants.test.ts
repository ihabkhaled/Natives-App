import { describe, expect, it } from 'vitest';

import { TEST_IDS } from './test-ids.constants';

const VALUES = Object.values(TEST_IDS);

describe('TEST_IDS', () => {
  it('keeps every id unique so selectors stay unambiguous', () => {
    expect(new Set(VALUES).size).toBe(VALUES.length);
  });

  it('uses lower-case kebab values', () => {
    const malformed = VALUES.filter(
      (value) => value !== value.toLowerCase() || value.includes(' ') || value.includes('_'),
    );
    expect(malformed).toEqual([]);
  });

  it('never exposes an empty id', () => {
    expect(VALUES.filter((value) => value.length === 0)).toEqual([]);
  });

  it('exposes the ids the shell and state components depend on', () => {
    expect(TEST_IDS.appShell).toBe('app-shell');
    expect(TEST_IDS.offlineBanner).toBe('offline-banner');
    expect(TEST_IDS.errorBoundaryFallback).toBe('error-boundary-fallback');
  });

  it('names every key after its value', () => {
    const mismatched = Object.entries(TEST_IDS).filter(
      ([key, value]) => value !== key.replaceAll(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`),
    );
    expect(mismatched).toEqual([]);
  });
});
