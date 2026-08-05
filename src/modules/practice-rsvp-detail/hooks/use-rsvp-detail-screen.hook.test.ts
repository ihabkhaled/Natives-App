import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { useAppQuery } from '@/packages/query';
import { PERMISSIONS } from '@/shared/security';

import {
  buildRsvpParticipant,
  buildRsvpRevision,
  buildRsvpSummary,
} from '../../../../tests/factories/practice-rsvp-detail.factory';
import { RSVP_PARTICIPANTS_PAGE_SIZE } from '../constants/practice-rsvp-detail.constants';
import { useRsvpDetailScreen } from './use-rsvp-detail-screen.hook';
import { useRsvpOverridePanel } from './use-rsvp-override-panel.hook';

vi.mock('@/modules/auth', () => ({
  useActiveTeamScope: vi.fn(),
  useEffectivePermissions: vi.fn(),
}));
vi.mock('@/packages/query', () => ({ useAppQuery: vi.fn() }));
vi.mock('@/packages/i18n', () => ({
  useAppTranslation: () => ({ t: (key: string) => key, locale: 'en' }),
}));
vi.mock('./use-rsvp-override-panel.hook', () => ({ useRsvpOverridePanel: vi.fn() }));

interface QueryStub {
  readonly data: unknown;
  readonly isPending: boolean;
  readonly isError: boolean;
  readonly isFetching: boolean;
}

function queryFor(key: readonly unknown[]): QueryStub {
  if (key.includes('summary')) {
    return { data: buildRsvpSummary(), isPending: false, isError: false, isFetching: false };
  }
  if (key.includes('history')) {
    return {
      data: { items: [buildRsvpRevision()] },
      isPending: false,
      isError: false,
      isFetching: false,
    };
  }
  return {
    data: { items: [buildRsvpParticipant()], total: 1, limit: 20, offset: 0 },
    isPending: false,
    isError: false,
    isFetching: false,
  };
}

function panelController(overrides: Record<string, unknown> = {}) {
  return {
    mode: { kind: 'none' as const },
    draft: { status: '', reason: '', reasonCategory: '', note: '', noteVisibility: '' },
    isSubmitting: false,
    draftActions: {
      onStatusChange: vi.fn(),
      onReasonChange: vi.fn(),
      onReasonCategoryChange: vi.fn(),
      onNoteChange: vi.fn(),
      onNoteVisibilityChange: vi.fn(),
      onSubmit: vi.fn(),
      onCancel: vi.fn(),
    },
    rosterActions: { onOverride: vi.fn(), onViewHistory: vi.fn() },
    historyMembershipId: '',
    onClosePanel: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useActiveTeamScope).mockReturnValue({ teamId: 't1', isLoading: false } as never);
  vi.mocked(useEffectivePermissions).mockReturnValue({
    permissions: [PERMISSIONS.practicesManage],
    isLoading: false,
  } as never);
  vi.mocked(useAppQuery).mockImplementation(
    (options: { queryKey: readonly unknown[] }) => queryFor(options.queryKey) as never,
  );
  vi.mocked(useRsvpOverridePanel).mockReturnValue(panelController());
});

describe('useRsvpDetailScreen', () => {
  it('builds a ready view with the roster and the summary', () => {
    const { result } = renderHook(() => useRsvpDetailScreen('s1'));

    expect(result.current.isForbidden).toBe(false);
    expect(result.current.hasError).toBe(false);
    expect(result.current.summary).not.toBeNull();
    expect(result.current.rows).toHaveLength(1);
  });

  it('falls back to an empty roster and a zero total before the read has settled', () => {
    vi.mocked(useAppQuery).mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
      isFetching: false,
    } as never);

    const { result } = renderHook(() => useRsvpDetailScreen('s1'));

    expect(result.current.rows).toEqual([]);
    expect(result.current.summary).toBeNull();
  });

  it('falls back to an empty history list before that read has settled', () => {
    vi.mocked(useRsvpOverridePanel).mockReturnValue(
      panelController({ mode: { kind: 'history', membershipId: 'member-1' } }),
    );
    vi.mocked(useAppQuery).mockImplementation((options: { queryKey: readonly unknown[] }) =>
      (options.queryKey.includes('history')
        ? { data: undefined, isPending: true, isError: false, isFetching: false }
        : queryFor(options.queryKey)) as never,
    );

    const { result } = renderHook(() => useRsvpDetailScreen('s1'));

    expect(result.current.panel).toEqual({
      kind: 'history',
      panel: expect.objectContaining({ items: [] }) as unknown,
    });
  });

  it('withholds the screen from a principal without practice.manage', () => {
    vi.mocked(useEffectivePermissions).mockReturnValue({ permissions: [], isLoading: false } as never);

    const { result } = renderHook(() => useRsvpDetailScreen('s1'));

    expect(result.current.isForbidden).toBe(true);
  });

  it('does not call a principal forbidden while permissions are still resolving', () => {
    vi.mocked(useEffectivePermissions).mockReturnValue({ permissions: [], isLoading: true } as never);

    const { result } = renderHook(() => useRsvpDetailScreen('s1'));

    expect(result.current.isForbidden).toBe(false);
    expect(result.current.isLoading).toBe(true);
  });

  it('changing the status filter resets the growing window back to the first page', () => {
    const { result, rerender } = renderHook(() => useRsvpDetailScreen('s1'));

    act(() => {
      result.current.onLoadMore();
    });
    act(() => {
      result.current.onStatusFilterChange('going');
    });
    rerender();

    const participantsCall = vi
      .mocked(useAppQuery)
      .mock.calls.reverse()
      .find((call) => call[0].queryKey.includes('participants'));
    expect(participantsCall?.[0].queryKey).toContain(RSVP_PARTICIPANTS_PAGE_SIZE);
    expect(result.current.statusFilter).toBe('going');
  });

  it('widens the roster window from "load more"', () => {
    const { result, rerender } = renderHook(() => useRsvpDetailScreen('s1'));

    act(() => {
      result.current.onLoadMore();
    });
    rerender();

    const participantsCall = vi
      .mocked(useAppQuery)
      .mock.calls.reverse()
      .find((call) => call[0].queryKey.includes('participants'));
    expect(participantsCall?.[0].queryKey).toContain(RSVP_PARTICIPANTS_PAGE_SIZE * 2);
  });

  it('hands the roster row actions straight through from the panel controller', () => {
    const rosterActions = { onOverride: vi.fn(), onViewHistory: vi.fn() };
    vi.mocked(useRsvpOverridePanel).mockReturnValue(panelController({ rosterActions }));

    const { result } = renderHook(() => useRsvpDetailScreen('s1'));
    result.current.rows[0]?.onOverride();

    expect(rosterActions.onOverride).toHaveBeenCalledWith('member-1');
  });

  it('resolves an open override panel from the controller\'s mode and draft', () => {
    vi.mocked(useRsvpOverridePanel).mockReturnValue(
      panelController({ mode: { kind: 'override', membershipId: 'member-1' } }),
    );

    const { result } = renderHook(() => useRsvpDetailScreen('s1'));

    expect(result.current.panel.kind).toBe('override');
  });

  it('resolves an open history panel with the fetched revisions', () => {
    vi.mocked(useRsvpOverridePanel).mockReturnValue(
      panelController({
        mode: { kind: 'history', membershipId: 'member-1' },
        historyMembershipId: 'member-1',
      }),
    );

    const { result } = renderHook(() => useRsvpDetailScreen('s1'));

    expect(result.current.panel).toEqual({
      kind: 'history',
      panel: expect.objectContaining({ items: expect.any(Array) as unknown }) as unknown,
    });
  });
});
