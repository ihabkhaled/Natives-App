import { describe, expect, it } from 'vitest';

import { hasAllPermissions } from './permission-check.helper';

describe('hasAllPermissions', () => {
  it('is satisfied when every required permission is granted', () => {
    expect(hasAllPermissions(['members.read', 'users.manage'], ['members.read'])).toBe(true);
  });

  it('is not satisfied when any required permission is missing', () => {
    expect(hasAllPermissions(['members.read'], ['members.read', 'users.manage'])).toBe(false);
  });

  it('treats an empty requirement as always satisfied', () => {
    expect(hasAllPermissions([], [])).toBe(true);
  });

  it('rejects every requirement when nothing is granted', () => {
    expect(hasAllPermissions([], ['members.read'])).toBe(false);
  });
});
