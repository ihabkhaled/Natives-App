import { describe, expect, it } from 'vitest';

import { moveArrayItem, removeArrayItem, replaceArrayItem } from './reorderable-rows.helper';

describe('moveArrayItem', () => {
  it('swaps an entry with its neighbour without losing either', () => {
    expect(moveArrayItem(['a', 'b', 'c'], 0, 1)).toEqual(['b', 'a', 'c']);
    expect(moveArrayItem(['a', 'b', 'c'], 2, -1)).toEqual(['a', 'c', 'b']);
  });

  it('refuses to move past either edge', () => {
    const items = ['a', 'b'];
    expect(moveArrayItem(items, 0, -1)).toBe(items);
    expect(moveArrayItem(items, 1, 1)).toBe(items);
    expect(moveArrayItem(items, 5, -1)).toBe(items);
  });
});

describe('removeArrayItem', () => {
  it('removes exactly the addressed entry', () => {
    expect(removeArrayItem(['a', 'b', 'c'], 1)).toEqual(['a', 'c']);
  });
});

describe('replaceArrayItem', () => {
  it('replaces exactly the addressed entry', () => {
    expect(replaceArrayItem(['a', 'b'], 1, 'z')).toEqual(['a', 'z']);
  });
});
