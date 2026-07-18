import { describe, expect, it } from 'vitest';

import { APP_ICONS } from './icons.constants';

describe('APP_ICONS', () => {
  it('exposes the approved icon set', () => {
    expect(Object.keys(APP_ICONS).sort()).toEqual([
      'alert',
      'checkmark',
      'dot',
      'empty',
      'eye',
      'eyeOff',
      'flask',
      'home',
      'information',
      'lock',
      'logOut',
      'offline',
      'person',
      'refresh',
      'settings',
      'shield',
      'warning',
    ]);
  });

  it('resolves every icon to a non-empty source string', () => {
    for (const [name, source] of Object.entries(APP_ICONS)) {
      expect(typeof source, `${name} must resolve to a string`).toBe('string');
      expect(source.length, `${name} must not be empty`).toBeGreaterThan(0);
    }
  });

  it('maps each name to a distinct icon', () => {
    const sources = Object.values(APP_ICONS);

    expect(new Set(sources).size).toBe(sources.length);
  });
});
