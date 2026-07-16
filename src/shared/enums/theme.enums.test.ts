import { describe, expect, it } from 'vitest';

import { THEME_MODE, THEME_MODES } from './theme.enums';

describe('THEME_MODE', () => {
  it('pins the persisted theme values', () => {
    expect(THEME_MODE).toEqual({ Light: 'light', Dark: 'dark', System: 'system' });
  });

  it('derives the selectable mode list from the map', () => {
    expect(THEME_MODES).toEqual(['light', 'dark', 'system']);
  });

  it('keeps the derived list in sync with the map', () => {
    expect([...THEME_MODES].sort()).toEqual(Object.values(THEME_MODE).sort());
  });
});
