import { describe, expect, it } from 'vitest';

import { toCompetitionSlug } from './public-competition-slug.mapper';

describe('toCompetitionSlug', () => {
  it('lower-cases and hyphenates a competition name', () => {
    expect(toCompetitionSlug('EUNC 2026')).toBe('eunc-2026');
  });

  it('collapses punctuation and runs of spaces into single hyphens', () => {
    expect(toCompetitionSlug('  Cairo  Open —  Mixed!  ')).toBe('cairo-open-mixed');
  });

  it('leaves no leading or trailing hyphen for a name that starts with punctuation', () => {
    expect(toCompetitionSlug('#1 Series!')).toBe('1-series');
  });

  it('resolves a name with nothing addressable to an empty slug', () => {
    expect(toCompetitionSlug('!!!')).toBe('');
  });
});
