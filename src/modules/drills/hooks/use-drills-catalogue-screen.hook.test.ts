import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAppQuery } from '@/packages/query';
import { useAppNavigation } from '@/packages/router';

import { DRILL_NEW_ID } from '../constants/drills.constants';
import { useDrillsContext } from './use-drills-context.hook';
import { useDrillsCatalogueScreen } from './use-drills-catalogue-screen.hook';

vi.mock('@/packages/i18n', () => ({ useAppTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/packages/query', () => ({ useAppQuery: vi.fn() }));
vi.mock('@/packages/router', () => ({ useAppNavigation: vi.fn() }));
vi.mock('./use-drills-context.hook', () => ({ useDrillsContext: vi.fn() }));

const push = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useAppNavigation).mockReturnValue({ push } as never);
  vi.mocked(useDrillsContext).mockReturnValue({
    teamId: 't1',
    isOffline: false,
    isLoading: false,
    canManage: true,
  });
  vi.mocked(useAppQuery).mockReturnValue({
    data: { items: [], total: 0, limit: 50, offset: 0 },
    isPending: false,
    error: null,
    refetch: vi.fn(),
  } as never);
});

describe('useDrillsCatalogueScreen', () => {
  it('navigates to the new-drill sentinel route', () => {
    const { result } = renderHook(() => useDrillsCatalogueScreen());

    act(() => {
      result.current.onNewDrill();
    });

    expect(push).toHaveBeenCalledWith(`/drills/${DRILL_NEW_ID}`);
  });

  it('navigates to the routed drill on open', () => {
    const { result } = renderHook(() => useDrillsCatalogueScreen());

    act(() => {
      result.current.onOpen('d1');
    });

    expect(push).toHaveBeenCalledWith('/drills/d1');
  });

  it('narrows the visible items as the coach types a search', () => {
    vi.mocked(useAppQuery).mockReturnValue({
      data: {
        items: [
          {
            id: 'd1',
            seasonId: null,
            name: 'Give-and-go break',
            category: 'throwing',
            objective: null,
            instructions: null,
            equipment: [],
            intensity: 'moderate',
            defaultDurationMinutes: null,
            skillTags: [],
            safetyNotes: null,
            mediaUrl: null,
            status: 'active',
            version: 1,
          },
          {
            id: 'd2',
            seasonId: null,
            name: 'Zone breakdown',
            category: 'defense',
            objective: null,
            instructions: null,
            equipment: [],
            intensity: 'low',
            defaultDurationMinutes: null,
            skillTags: [],
            safetyNotes: null,
            mediaUrl: null,
            status: 'active',
            version: 1,
          },
        ],
        total: 2,
        limit: 50,
        offset: 0,
      },
      isPending: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    const { result } = renderHook(() => useDrillsCatalogueScreen());
    expect(result.current.items).toHaveLength(2);

    act(() => {
      result.current.onSearchChange('zone');
    });

    expect(result.current.items.map((item) => item.id)).toEqual(['d2']);
  });

  it('withholds the screen from a principal without the grant', () => {
    vi.mocked(useDrillsContext).mockReturnValue({
      teamId: 't1',
      isOffline: false,
      isLoading: false,
      canManage: false,
    });

    const { result } = renderHook(() => useDrillsCatalogueScreen());

    expect(result.current.status).toBe('forbidden');
  });
});
