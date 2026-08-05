import { describe, expect, it } from 'vitest';

import { formatTagList, parseTagList } from './drill-tag-list.helper';

describe('parseTagList', () => {
  it('splits a comma-separated line into trimmed tags', () => {
    expect(parseTagList('cones, discs ,pinnies')).toEqual(['cones', 'discs', 'pinnies']);
  });

  it('drops blank segments from a trailing or doubled comma', () => {
    expect(parseTagList('cones,,discs,')).toEqual(['cones', 'discs']);
  });

  it('returns an empty list for a blank line', () => {
    expect(parseTagList('')).toEqual([]);
    expect(parseTagList('   ')).toEqual([]);
  });

  it('returns one tag for a line with no comma', () => {
    expect(parseTagList('cones')).toEqual(['cones']);
  });
});

describe('formatTagList', () => {
  it('joins tags back into one comma-separated line', () => {
    expect(formatTagList(['cones', 'discs'])).toBe('cones, discs');
  });

  it('formats an empty list as an empty string', () => {
    expect(formatTagList([])).toBe('');
  });

  it('round-trips through parseTagList', () => {
    expect(parseTagList(formatTagList(['throwing', 'footwork']))).toEqual(['throwing', 'footwork']);
  });
});
