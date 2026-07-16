import { describe, expect, it } from 'vitest';

import { THEME_MODE } from '@/shared/enums';

import { selectIsDarkTheme } from './settings.selectors';

describe('selectIsDarkTheme', () => {
  it('forces dark when the user picked dark, whatever the system says', () => {
    expect(selectIsDarkTheme(THEME_MODE.Dark, false)).toBe(true);
    expect(selectIsDarkTheme(THEME_MODE.Dark, true)).toBe(true);
  });

  it('forces light when the user picked light, whatever the system says', () => {
    expect(selectIsDarkTheme(THEME_MODE.Light, true)).toBe(false);
    expect(selectIsDarkTheme(THEME_MODE.Light, false)).toBe(false);
  });

  it('follows the system signal when the user picked system', () => {
    expect(selectIsDarkTheme(THEME_MODE.System, true)).toBe(true);
    expect(selectIsDarkTheme(THEME_MODE.System, false)).toBe(false);
  });
});
