import { describe, expect, it } from 'vitest';

import { drillDetailPath, drillDetailPattern, drillsPath } from './drills.paths';

describe('drills paths', () => {
  it('exposes the list route', () => {
    expect(drillsPath()).toBe('/drills');
  });

  it('exposes the detail pattern with its parameter unresolved', () => {
    expect(drillDetailPattern()).toBe('/drills/:drillId');
  });

  it('resolves the pattern for one drill', () => {
    expect(drillDetailPath('d1')).toBe('/drills/d1');
  });

  it('resolves the pattern for the create-mode sentinel', () => {
    expect(drillDetailPath('new')).toBe('/drills/new');
  });

  it('encodes the id so a stray slash cannot invent a route segment', () => {
    expect(drillDetailPath('d/1')).toBe('/drills/d%2F1');
  });
});
