import { describe, expect, it } from 'vitest';

import { isFilledIn } from './agenda-groups-form.helper';

describe('isFilledIn', () => {
  it('rejects an empty string', () => {
    expect(isFilledIn('')).toBe(false);
  });

  it('rejects whitespace only', () => {
    expect(isFilledIn('   ')).toBe(false);
  });

  it('accepts real content, even padded with whitespace', () => {
    expect(isFilledIn('  membership-1  ')).toBe(true);
  });
});
