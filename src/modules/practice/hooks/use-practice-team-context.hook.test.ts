import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildAuthUser, useCurrentUserQuery, type CurrentUserQueryView } from '@/modules/auth';

import { usePracticeTeamContext } from './use-practice-team-context.hook';

vi.mock('@/modules/auth', () => ({
  buildAuthUser: vi.fn(),
  useCurrentUserQuery: vi.fn(),
}));

function mockCurrentUser(overrides: Partial<CurrentUserQueryView> = {}): void {
  vi.mocked(useCurrentUserQuery).mockReturnValue({
    user: undefined,
    isLoading: false,
    isError: false,
    ...overrides,
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('usePracticeTeamContext', () => {
  it('selects the first authenticated membership as the current team scope', () => {
    vi.mocked(buildAuthUser).mockReturnValue({
      id: 'user-1',
      email: 'member@example.com',
      displayName: 'Member',
      permissions: [],
      accountState: 'active',
      onboardingComplete: true,
      memberships: [
        {
          membershipId: 'membership-1',
          teamId: 'team-1',
          teamSlug: 'team-one',
          teamName: 'Team One',
          seasonId: 'season-1',
          seasonSlug: 'season-one',
          seasonName: 'Season One',
          status: 'active',
          roles: ['member'],
        },
      ],
    });
    mockCurrentUser({ user: buildAuthUser() });

    const { result } = renderHook(() => usePracticeTeamContext());

    expect(result.current.teamId).toBe('team-1');
    expect(result.current.isLoading).toBe(false);
  });

  it('returns an empty team id while membership context is unavailable', () => {
    mockCurrentUser({ isLoading: true });

    const { result } = renderHook(() => usePracticeTeamContext());

    expect(result.current.teamId).toBe('');
    expect(result.current.isLoading).toBe(true);
  });

  it('preserves a profile-query error for the screen boundary', () => {
    mockCurrentUser({ isError: true });

    const { result } = renderHook(() => usePracticeTeamContext());

    expect(result.current.isError).toBe(true);
  });
});
