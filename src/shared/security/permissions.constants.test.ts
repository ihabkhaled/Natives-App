import { describe, expect, it } from 'vitest';

import { PERMISSIONS } from './permissions.constants';

const VALUES = Object.values(PERMISSIONS);

describe('PERMISSIONS', () => {
  it('exposes dotted, lower-case canonical permission strings', () => {
    const malformed = VALUES.filter((value) => {
      const segments = value.split('.');
      return segments.length < 2 || segments.some((segment) => !/^[a-z]+$/u.test(segment));
    });

    expect(malformed).toEqual([]);
  });

  it('keeps every permission string unique', () => {
    expect(new Set(VALUES).size).toBe(VALUES.length);
  });

  it('pins the admin-only capability the shell keys navigation on', () => {
    expect(PERMISSIONS.usersManage).toBe('users.manage');
  });
});
