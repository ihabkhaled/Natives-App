import { describe, expect, it } from 'vitest';

import { mapSuperAdmin, mapSuperAdminRoster } from './platform-admins.mapper';

const ENTRY = {
  assignmentId: 'assignment-1',
  userId: 'user-1',
  email: 'root@example.com',
  displayName: 'Ranger One',
  effectiveFrom: '2026-01-05T09:00:00.000Z',
  grantedBy: null,
};

describe('platform-admins.mapper', () => {
  it('maps one assignment to the domain shape with the Iso rename', () => {
    expect(mapSuperAdmin(ENTRY)).toEqual({
      assignmentId: 'assignment-1',
      userId: 'user-1',
      email: 'root@example.com',
      displayName: 'Ranger One',
      effectiveFromIso: '2026-01-05T09:00:00.000Z',
      grantedBy: null,
    });
  });

  it('preserves a null display name and a recorded granting actor', () => {
    const mapped = mapSuperAdmin({ ...ENTRY, displayName: null, grantedBy: 'user-0' });

    expect(mapped.displayName).toBeNull();
    expect(mapped.grantedBy).toBe('user-0');
  });

  it('maps the roster envelope with its server total', () => {
    expect(mapSuperAdminRoster({ items: [ENTRY], total: 3 })).toEqual({
      items: [mapSuperAdmin(ENTRY)],
      total: 3,
    });
  });
});
