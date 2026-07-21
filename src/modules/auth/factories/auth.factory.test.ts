import { describe, expect, it } from 'vitest';

import { PERMISSIONS } from '@/shared/security';

import { buildAuthUser } from './auth.factory';

describe('buildAuthUser', () => {
  it('builds the deterministic default admin persona', () => {
    const user = buildAuthUser();

    expect(user.id).toBe('user-1');
    expect(user.email).toBe('ranger@example.com');
    expect(user.displayName).toBe('Ranger One');
    expect(user.accountState).toBe('active');
    expect(user.onboardingComplete).toBe(true);
    expect(user.permissions).toEqual(Object.values(PERMISSIONS));
    expect(user.memberships).toHaveLength(1);
  });

  it('grants the default persona the manage-users capability', () => {
    expect(buildAuthUser().permissions).toContain(PERMISSIONS.memberLifecycleManage);
  });

  it('applies overrides on top of the defaults', () => {
    const user = buildAuthUser({
      id: 'user-2',
      displayName: 'Ranger Two',
      permissions: [PERMISSIONS.memberList],
      onboardingComplete: false,
      memberships: [],
    });

    expect(user.id).toBe('user-2');
    expect(user.displayName).toBe('Ranger Two');
    expect(user.permissions).toEqual([PERMISSIONS.memberList]);
    expect(user.onboardingComplete).toBe(false);
    expect(user.memberships).toEqual([]);
    expect(user.email).toBe('ranger@example.com');
  });
});
