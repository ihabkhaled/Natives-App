import { describe, expect, it } from 'vitest';

import { ENABLED_FEATURE_FLAGS, FEATURE_FLAGS, isFeatureEnabled } from './feature-flags.constants';

describe('FEATURE_FLAGS', () => {
  it('exposes kebab-case flag identifiers', () => {
    const malformed = Object.values(FEATURE_FLAGS).filter((value) =>
      value.split('-').some((segment) => !/^[a-z]+$/u.test(segment)),
    );

    expect(malformed).toEqual([]);
  });

  it('keeps every flag unique', () => {
    const values = Object.values(FEATURE_FLAGS);

    expect(new Set(values).size).toBe(values.length);
  });
});

describe('isFeatureEnabled', () => {
  it('treats an unflagged route as always enabled', () => {
    expect(isFeatureEnabled(null)).toBe(true);
  });

  it('enables a flag present in the registry', () => {
    expect(isFeatureEnabled(FEATURE_FLAGS.adminConsole)).toBe(true);
    expect(ENABLED_FEATURE_FLAGS).toContain(FEATURE_FLAGS.adminConsole);
  });

  it('disables a flag absent from the registry', () => {
    expect(isFeatureEnabled('unlisted-flag' as (typeof FEATURE_FLAGS)['adminConsole'])).toBe(false);
  });
});
