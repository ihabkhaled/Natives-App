import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useQueryClient } from '@/packages/query';

import { buildAuthMembership, buildAuthUser } from '../factories/auth.factory';
import { useActiveTeamStore } from '../store/active-team.store';
import { useCurrentUserQuery } from './use-current-user-query.hook';
import { useTeamSwitcher } from './use-team-switcher.hook';

vi.mock('@/packages/i18n', () => ({
  useAppTranslation: () => ({ t: (key: string) => key, locale: 'en' }),
}));
vi.mock('./use-current-user-query.hook', () => ({ useCurrentUserQuery: vi.fn() }));
vi.mock('@/packages/query', () => ({ useQueryClient: vi.fn() }));

const invalidateQueries = vi.fn();

const FIRST = buildAuthMembership({
  membershipId: 'membership-1',
  teamId: 'team-1',
  teamName: 'Ultimate Natives',
  seasonName: 'Season 2026',
});
const SECOND = buildAuthMembership({
  membershipId: 'membership-2',
  teamId: 'team-2',
  teamName: 'Natives Reserve',
  seasonName: null,
});

function mockMemberships(memberships: readonly ReturnType<typeof buildAuthMembership>[]): void {
  vi.mocked(useCurrentUserQuery).mockReturnValue({
    user: buildAuthUser({ memberships }),
    isLoading: false,
    isError: false,
  });
}

beforeEach(() => {
  useActiveTeamStore.getState().clearSelection();
  vi.mocked(useQueryClient).mockReturnValue({ invalidateQueries } as never);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useTeamSwitcher', () => {
  it('collapses entirely for a single-team principal', () => {
    mockMemberships([FIRST]);

    const { result } = renderHook(() => useTeamSwitcher());

    expect(result.current.isAvailable).toBe(false);
    expect(result.current.options).toHaveLength(1);
  });

  it('offers every team the principal holds, with the active one marked', () => {
    mockMemberships([FIRST, SECOND]);

    const { result } = renderHook(() => useTeamSwitcher());

    expect(result.current.isAvailable).toBe(true);
    expect(result.current.activeTeamName).toBe('Ultimate Natives');
    expect(result.current.activeTeamDetail).toBe('Season 2026');
    expect(result.current.options.map((option) => option.isActive)).toEqual([true, false]);
  });

  it('opens and closes the menu', () => {
    mockMemberships([FIRST, SECOND]);

    const { result } = renderHook(() => useTeamSwitcher());

    act(() => {
      result.current.onToggle();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.onToggle();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('switches scope, closes the menu, and drops every cached team-scoped read', () => {
    mockMemberships([FIRST, SECOND]);

    const { result, rerender } = renderHook(() => useTeamSwitcher());

    act(() => {
      result.current.onToggle();
    });
    act(() => {
      result.current.onSelect('team-2');
    });
    rerender();

    expect(useActiveTeamStore.getState().selectedTeamId).toBe('team-2');
    expect(invalidateQueries).toHaveBeenCalledTimes(1);
    expect(result.current.isOpen).toBe(false);
    expect(result.current.activeTeamName).toBe('Natives Reserve');
    expect(result.current.activeTeamDetail).toBeNull();
  });

  it('does not churn the cache when the chosen team is already the active one', () => {
    mockMemberships([FIRST, SECOND]);

    const { result } = renderHook(() => useTeamSwitcher());

    act(() => {
      result.current.onSelect('team-1');
    });

    expect(invalidateQueries).not.toHaveBeenCalled();
    expect(useActiveTeamStore.getState().selectedTeamId).toBeNull();
  });

  it('is unavailable and empty while the principal has no membership', () => {
    vi.mocked(useCurrentUserQuery).mockReturnValue({
      user: undefined,
      isLoading: true,
      isError: false,
    });

    const { result } = renderHook(() => useTeamSwitcher());

    expect(result.current.isAvailable).toBe(false);
    expect(result.current.options).toEqual([]);
    expect(result.current.activeTeamDetail).toBeNull();
  });
});
