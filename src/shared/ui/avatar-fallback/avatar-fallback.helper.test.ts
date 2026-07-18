import { describe, expect, it } from 'vitest';

import { deriveInitials } from './avatar-fallback.helper';

describe('deriveInitials', () => {
  it('returns an empty string for blank input', () => {
    expect(deriveInitials('')).toBe('');
    expect(deriveInitials('   ')).toBe('');
  });

  it('uses the first two letters of a single word', () => {
    expect(deriveInitials('mohamed')).toBe('MO');
    expect(deriveInitials('A')).toBe('A');
  });

  it('uses the first and last initial for multi-word names', () => {
    expect(deriveInitials('Mohamed Refaat')).toBe('MR');
    expect(deriveInitials('  ahmed   ali   hassan ')).toBe('AH');
  });
});
