import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useActiveTeamScope, type ActiveTeamScopeView } from '@/modules/auth';

import { usePracticeTeamContext } from './use-practice-team-context.hook';

vi.mock('@/modules/auth', () => ({ useActiveTeamScope: vi.fn() }));

function mockScope(overrides: Partial<ActiveTeamScopeView> = {}): void {
  vi.mocked(useActiveTeamScope).mockReturnValue({
    teamId: '',
    membershipId: '',
    seasonId: null,
    teamName: '',
    isLoading: false,
    isError: false,
    ...overrides,
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('usePracticeTeamContext', () => {
  it('works inside the team the principal is currently scoped to', () => {
    mockScope({ teamId: 'team-1', membershipId: 'membership-1', teamName: 'Team One' });

    const { result } = renderHook(() => usePracticeTeamContext());

    expect(result.current.teamId).toBe('team-1');
    expect(result.current.isLoading).toBe(false);
  });

  it('follows a switch to another team rather than pinning the first membership', () => {
    mockScope({ teamId: 'team-2', membershipId: 'membership-2', teamName: 'Team Two' });

    const { result } = renderHook(() => usePracticeTeamContext());

    expect(result.current.teamId).toBe('team-2');
  });

  it('returns an empty team id while membership context is unavailable', () => {
    mockScope({ isLoading: true });

    const { result } = renderHook(() => usePracticeTeamContext());

    expect(result.current.teamId).toBe('');
    expect(result.current.isLoading).toBe(true);
  });

  it('preserves a profile-query error for the screen boundary', () => {
    mockScope({ isError: true });

    const { result } = renderHook(() => usePracticeTeamContext());

    expect(result.current.isError).toBe(true);
  });
});
