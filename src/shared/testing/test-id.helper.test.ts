import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { testIdProps } from './test-id.helper';

describe('testIdProps', () => {
  it('spreads into the data-testid attribute the queries rely on', () => {
    expect(testIdProps(TEST_IDS.appShell)).toEqual({ 'data-testid': 'app-shell' });
  });

  it('exposes only the test id prop', () => {
    expect(Object.keys(testIdProps('anything'))).toEqual(['data-testid']);
  });

  it('returns a fresh object per call', () => {
    expect(testIdProps('a')).not.toBe(testIdProps('a'));
  });
});
