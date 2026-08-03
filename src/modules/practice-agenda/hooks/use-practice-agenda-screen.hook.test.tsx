// Must be imported before `@/platform`, whose module factory below reads it.
import { createPlatformMock } from '../../../../tests/setup/platform-mock.helper';
import { MOCK_PRACTICE_AGENDA } from '@/tests/msw/practice-agenda.fixture';
import { PERMISSIONS } from '@/shared/security';
import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as AuthModule from '@/modules/auth';
import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { useNetworkStatus } from '@/platform';

import {
  buildAgendaGrants,
  buildAgendaTeamScope,
} from '../../../../tests/factories/practice-agenda-view.factory';
import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { getPracticeAgenda } from '../services/get-practice-agenda.service';
import { removeAgendaStation } from '../services/remove-agenda-station.service';
import { reorderAgendaBlocks } from '../services/reorder-agenda-blocks.service';
import { usePracticeAgendaScreen } from './use-practice-agenda-screen.hook';

vi.mock('../services/get-practice-agenda.service', () => ({ getPracticeAgenda: vi.fn() }));
vi.mock('../services/reorder-agenda-blocks.service', () => ({ reorderAgendaBlocks: vi.fn() }));
vi.mock('../services/remove-agenda-station.service', () => ({ removeAgendaStation: vi.fn() }));
vi.mock('@/modules/auth', async (importOriginal) => ({
  ...(await importOriginal<typeof AuthModule>()),
  useActiveTeamScope: vi.fn(),
  useEffectivePermissions: vi.fn(),
}));
vi.mock('@/platform', () => createPlatformMock());

const COACH = [PERMISSIONS.practicesRead, PERMISSIONS.practicesManage];

function mockGrants(permissions: readonly string[] = COACH, isLoading = false): void {
  vi.mocked(useActiveTeamScope).mockReturnValue(buildAgendaTeamScope(isLoading));
  vi.mocked(useEffectivePermissions).mockReturnValue(buildAgendaGrants(permissions));
}

type ScreenRender = ReturnType<
  typeof renderHookWithProviders<ReturnType<typeof usePracticeAgendaScreen>>
>;

function renderScreen(): ScreenRender {
  return renderHookWithProviders(() => usePracticeAgendaScreen('session-1'), {
    initialPath: '/practice-sessions/session-1/agenda',
  });
}

/** Most cases start from a resolved plan; only the state cases do not. */
async function renderReadyScreen(): Promise<ScreenRender> {
  const utils = renderScreen();
  await waitFor(() => {
    expect(utils.result.current.status).toBe('ready');
  });
  return utils;
}

function blockIdsOf(utils: ScreenRender): readonly string[] {
  return utils.result.current.blocks.map((block) => block.id);
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });
  mockGrants();
  vi.mocked(getPracticeAgenda).mockResolvedValue(MOCK_PRACTICE_AGENDA);
  vi.mocked(reorderAgendaBlocks).mockResolvedValue({} as never);
  vi.mocked(removeAgendaStation).mockResolvedValue(undefined);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('usePracticeAgendaScreen', () => {
  it('starts loading so the screen can render its skeleton', () => {
    const { result } = renderScreen();

    expect(result.current.status).toBe('loading');
  });

  it('becomes ready with the plan in the order the session runs it', async () => {
    const { result } = await renderReadyScreen();

    // The fixture arrives out of order on purpose; `position` decides.
    expect(result.current.blocks.map((block) => block.title)).toEqual([
      'Warm-up',
      'Cutting drill',
      'Film and questions',
    ]);
  });

  it('counts the blocks it is actually showing', async () => {
    const { result } = await renderReadyScreen();

    expect(result.current.countLabel).toBe('3 blocks');
  });

  it('nests each block’s stations in their own running order', async () => {
    const { result } = await renderReadyScreen();

    expect(result.current.blocks[1]?.stations.map((station) => station.name)).toEqual([
      'Under cuts',
      'Deep cuts',
    ]);
  });

  it('carries the screen’s own copy, translated', async () => {
    const { result } = await renderReadyScreen();

    expect(result.current.pageTitle).toBe('Practice agenda');
    expect(result.current.listHeading).toBe('Blocks');
    expect(result.current.listIntro).toBe('In the order the session runs them.');
    expect(result.current.emptyTitle).toBe('No agenda yet');
  });

  it('points at the plan it is showing', () => {
    const { result } = renderScreen();

    expect(result.current.path).toBe('/practice-sessions/session-1/agenda');
  });

  it('commits a move with the version the plan was read at', async () => {
    const { result } = await renderReadyScreen();

    act(() => {
      result.current.onMoveBlock(1, -1);
    });

    await waitFor(() => {
      expect(reorderAgendaBlocks).toHaveBeenCalledWith(
        expect.objectContaining({
          blockIds: ['block-2', 'block-1', 'block-3'],
          expectedVersion: 4,
        }),
      );
    });
  });

  it('shows the moved order before the server has answered', async () => {
    vi.mocked(reorderAgendaBlocks).mockImplementation(() => new Promise(() => undefined));
    const utils = await renderReadyScreen();

    act(() => {
      utils.result.current.onMoveBlock(1, -1);
    });

    expect(blockIdsOf(utils)).toEqual(['block-2', 'block-1', 'block-3']);
    expect(utils.result.current.isSaving).toBe(true);
  });

  it('says the move did not happen, and puts the plan back', async () => {
    vi.mocked(reorderAgendaBlocks).mockRejectedValue(new Error('conflict'));
    const utils = await renderReadyScreen();

    act(() => {
      utils.result.current.onMoveBlock(1, -1);
    });

    await waitFor(() => {
      expect(utils.result.current.notice).toBe('That action did not complete. Try again.');
    });
    expect(blockIdsOf(utils)).toEqual(['block-1', 'block-2', 'block-3']);
  });

  it('removes a station from the block that holds it', async () => {
    const { result } = await renderReadyScreen();

    act(() => {
      result.current.onRemoveStation('block-2', 'station-1');
    });

    await waitFor(() => {
      expect(removeAgendaStation).toHaveBeenCalledWith(
        expect.objectContaining({ blockId: 'block-2', stationId: 'station-1' }),
      );
    });
  });

  it('lets a reader see the plan but withholds the editing affordances', async () => {
    mockGrants([PERMISSIONS.practicesRead]);
    const { result } = await renderReadyScreen();

    expect(result.current.canEdit).toBe(false);
  });

  it('waits rather than refusing while the grants are still resolving', () => {
    mockGrants([], true);
    const { result } = renderScreen();

    // Forbidden is a verdict, not a default.
    expect(result.current.status).toBe('loading');
  });

  it('refuses the plan without the practice read grant', () => {
    mockGrants([]);
    const { result } = renderScreen();

    expect(result.current.status).toBe('forbidden');
  });

  it('shows the empty plan of a session nobody has planned yet', async () => {
    vi.mocked(getPracticeAgenda).mockResolvedValue({
      ...MOCK_PRACTICE_AGENDA,
      agendaId: null,
      status: null,
      version: null,
      blocks: [],
    });
    const { result } = renderScreen();

    await waitFor(() => {
      expect(result.current.status).toBe('empty');
    });
  });

  it('blames the connection, not the server, when the read fails offline', async () => {
    vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: false });
    vi.mocked(getPracticeAgenda).mockRejectedValue(new Error('offline'));
    const { result } = renderScreen();

    await waitFor(() => {
      expect(result.current.status).toBe('offline');
    });
  });

  it('keeps a resolved plan on screen through an offline blip', async () => {
    const { result } = await renderReadyScreen();

    vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: false });

    // A coach mid-session is not thrown back to an offline screen.
    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
  });
});
