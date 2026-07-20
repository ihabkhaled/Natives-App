import { describe, expect, it } from 'vitest';

import type { AuthMembership } from '../types/auth.types';
import { selectActiveMembership } from './active-membership.helper';

function membership(overrides: Partial<AuthMembership> = {}): AuthMembership {
  return {
    membershipId: 'membership-1',
    teamId: 'team-1',
    teamSlug: 'team-one',
    teamName: 'Team One',
    seasonId: 'season-1',
    seasonSlug: 'season-one',
    seasonName: 'Season One',
    status: 'active',
    roles: ['member'],
    ...overrides,
  };
}

describe('selectActiveMembership', () => {
  it('returns null when the principal holds no membership at all', () => {
    expect(selectActiveMembership([])).toBeNull();
  });

  it('prefers the first active membership over an earlier inactive one', () => {
    const inactive = membership({ membershipId: 'membership-old', status: 'left' });
    const active = membership({ membershipId: 'membership-new' });

    expect(selectActiveMembership([inactive, active])).toBe(active);
  });

  it('falls back to the first membership when none is active', () => {
    const suspended = membership({ membershipId: 'membership-suspended', status: 'suspended' });

    expect(selectActiveMembership([suspended])).toBe(suspended);
  });

  it('keeps a team without a season as a real scope', () => {
    const seasonless = membership({ seasonId: null, seasonSlug: null, seasonName: null });

    expect(selectActiveMembership([seasonless])?.teamId).toBe('team-1');
  });
});
